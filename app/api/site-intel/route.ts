import { NextRequest, NextResponse } from "next/server";
import { parseAudit, runPageSpeed } from "@/lib/pagespeed";
import { generateMLInsights } from "@/lib/aws-model-insights";
import { getAccessToken, searchAnalytics } from "@/lib/gsc";
import { getLatestSnapshot, saveSnapshot } from "@/lib/scan-history";

export const runtime = "nodejs";

type SiteIntelPayload = {
  userId?: string;
  siteUrl: string;
  sitewide: {
    discoveredUrls: number;
    analyzedUrls: number;
    titleCoveragePct: number;
    descriptionCoveragePct: number;
    h1CoveragePct: number;
    topKeywords: string[];
  };
  title: string;
  description: string;
  primaryTopic: string;
  topKeywords: string[];
  summary: string;
  recommendations: string[];
  kpis: {
    technical: number;
    functional: number;
    user: number;
    seo: number;
    overall: number;
  };
  modelSource: "aws-bedrock" | "heuristic" | "ensemble";
  modelsUsed: Array<{
    id: string;
    name: string;
    status: "active" | "fallback";
    score: number;
    notes: string;
  }>;
  keywordClusters: Array<{
    cluster: string;
    intent: "informational" | "commercial" | "transactional" | "navigational";
    source: "gsc" | "content";
    terms: string[];
  }>;
  trend?: {
    previousAt: string;
    currentAt: string;
    delta: {
      technical: number;
      functional: number;
      user: number;
      seo: number;
      overall: number;
    };
  };
  issues: Array<{
    id: string;
    category: "indexing" | "technical" | "seo" | "ux" | "content";
    severity: "high" | "medium" | "low";
    problem: string;
    impact: string;
    solution: string;
    actions: Array<{
      id: string;
      label: string;
      type: "api" | "link";
      tool: string;
      endpoint?: string;
      url?: string;
      payload?: Record<string, unknown>;
    }>;
  }>;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_SITEMAP_URLS = 500;
const MAX_ANALYZE_URLS = 120;
const FETCH_TIMEOUT_MS = 8000;
const intelCache = new Map<string, { expiresAt: number; data: SiteIntelPayload }>();

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "your", "you", "are", "our", "their", "into", "about", "have", "has", "was", "were", "will", "can", "not", "more", "all", "any", "new", "out", "use", "using", "how", "what", "when", "why", "where", "who", "which", "its", "it's", "a", "an", "to", "of", "on", "in", "at", "by", "as", "is", "be", "or", "if", "it", "we", "us", "they", "them", "he", "she",
]);

function getQueryUrl(siteUrl: string): string {
  return /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(html: string, regex: RegExp): string {
  const m = html.match(regex);
  return m?.[1]?.trim() ?? "";
}

function topTerms(text: string, limit = 6): string[] {
  const freq = new Map<string, number>();
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

function inferIntent(term: string): "informational" | "commercial" | "transactional" | "navigational" {
  const t = term.toLowerCase();
  if (/buy|price|cost|book|hire|service near me|plans|quote/.test(t)) return "transactional";
  if (/best|top|vs|compare|review|alternative/.test(t)) return "commercial";
  if (/login|official|brand|contact|about/.test(t)) return "navigational";
  return "informational";
}

function cleanTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsoluteUrl(rawUrl: string, base: URL): string | null {
  try {
    const candidate = new URL(rawUrl, base);
    if (candidate.hostname !== base.hostname) return null;
    if (candidate.protocol !== "http:" && candidate.protocol !== "https:") return null;
    candidate.hash = "";
    return candidate.toString();
  } catch {
    return null;
  }
}

function extractInternalUrlsFromHtml(html: string, base: URL): string[] {
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  const urls = new Set<string>();

  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1]?.trim();
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      continue;
    }
    const absolute = toAbsoluteUrl(href, base);
    if (absolute) urls.add(absolute);
  }

  return Array.from(urls);
}

function extractLocUrlsFromSitemapXml(xml: string, base: URL): string[] {
  const re = /<loc>([\s\S]*?)<\/loc>/gi;
  const urls: string[] = [];

  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const loc = m[1]?.trim();
    if (!loc) continue;
    const absolute = toAbsoluteUrl(loc, base);
    if (absolute) urls.push(absolute);
  }

  return urls;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": "IndraSEO-Bot/1.0 (+https://indraseo.com)",
        ...(init.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function discoverSiteUrls(base: URL, homepageHtml: string): Promise<string[]> {
  const discovered = new Set<string>();
  discovered.add(base.toString());

  for (const url of extractInternalUrlsFromHtml(homepageHtml, base)) {
    discovered.add(url);
    if (discovered.size >= MAX_SITEMAP_URLS) break;
  }

  const toVisit = [`${base.origin}/sitemap.xml`];
  const visited = new Set<string>();

  while (toVisit.length && discovered.size < MAX_SITEMAP_URLS) {
    const sitemapUrl = toVisit.shift();
    if (!sitemapUrl || visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);

    try {
      const res = await fetchWithTimeout(sitemapUrl, { method: "GET" }, 6000);
      if (!res.ok) continue;
      const xml = await res.text();
      const urls = extractLocUrlsFromSitemapXml(xml, base);

      if (/<sitemapindex/i.test(xml)) {
        for (const u of urls) {
          if (!visited.has(u) && !toVisit.includes(u)) toVisit.push(u);
        }
      } else {
        for (const u of urls) {
          discovered.add(u);
          if (discovered.size >= MAX_SITEMAP_URLS) break;
        }
      }
    } catch {
      // Ignore sitemap fetch failures and continue with what we already discovered.
    }
  }

  return Array.from(discovered);
}

async function analyzeSiteUrls(urls: string[]): Promise<SiteIntelPayload["sitewide"]> {
  const queue = urls.slice(0, MAX_ANALYZE_URLS);
  const batches: Array<Array<string>> = [];

  for (let i = 0; i < queue.length; i += 6) {
    batches.push(queue.slice(i, i + 6));
  }

  let analyzed = 0;
  let titleCount = 0;
  let descriptionCount = 0;
  let h1Count = 0;
  const keywordFreq = new Map<string, number>();

  for (const batch of batches) {
    const results = await Promise.all(
      batch.map(async (url) => {
        try {
          const res = await fetchWithTimeout(url, { method: "GET" }, 6000);
          if (!res.ok) return null;
          const html = await res.text();
          const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
          const description = firstMatch(
            html,
            /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i,
          );
          const h1 = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
          const text = stripTags(html).slice(0, 8000);
          const terms = topTerms(`${title} ${description} ${h1} ${text}`, 8);
          return { title, description, h1, terms };
        } catch {
          return null;
        }
      }),
    );

    for (const item of results) {
      if (!item) continue;
      analyzed += 1;
      if (item.title) titleCount += 1;
      if (item.description) descriptionCount += 1;
      if (item.h1) h1Count += 1;
      for (const term of item.terms) {
        keywordFreq.set(term, (keywordFreq.get(term) ?? 0) + 1);
      }
    }
  }

  const topKeywords = Array.from(keywordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([term]) => term);

  const denom = Math.max(analyzed, 1);
  return {
    discoveredUrls: urls.length,
    analyzedUrls: analyzed,
    titleCoveragePct: Math.round((titleCount / denom) * 100),
    descriptionCoveragePct: Math.round((descriptionCount / denom) * 100),
    h1CoveragePct: Math.round((h1Count / denom) * 100),
    topKeywords,
  };
}

function buildKeywordClusters(
  keywords: string[],
  source: "gsc" | "content",
): SiteIntelPayload["keywordClusters"] {
  const uniq = Array.from(new Set(keywords.map(cleanTerm).filter(Boolean))).slice(0, 24);
  if (!uniq.length) return [];

  const buckets = new Map<string, string[]>();
  for (const term of uniq) {
    const token = term.split(" ").find((w) => w.length >= 4 && !STOP_WORDS.has(w)) ?? term;
    if (!buckets.has(token)) buckets.set(token, []);
    buckets.get(token)?.push(term);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([seed, terms]) => ({
      cluster: `${seed} cluster`,
      intent: inferIntent(terms[0] ?? seed),
      source,
      terms: terms.slice(0, 6),
    }));
}

async function gscQueriesForSite(siteUrl: string): Promise<string[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const today = new Date().toISOString().slice(0, 10);
  const d28 = new Date(Date.now() - 28 * 86_400_000).toISOString().slice(0, 10);

  try {
    const result = await searchAnalytics(token, siteUrl, {
      startDate: d28,
      endDate: today,
      dimensions: ["query"],
      rowLimit: 40,
      orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
    });

    return (result.rows ?? [])
      .map((row) => cleanTerm(row.keys[0] ?? ""))
      .filter((term) => term.length >= 3);
  } catch {
    return [];
  }
}

function inferTopic(title: string, description: string, keywords: string[]): string {
  const blob = `${title} ${description} ${keywords.join(" ")}`.toLowerCase();

  if (/doctor|hospital|medical|clinic|treatment|health/.test(blob)) return "Healthcare / Medical";
  if (/shop|buy|cart|product|store|price|shipping/.test(blob)) return "Ecommerce";
  if (/software|platform|saas|automation|api|tool/.test(blob)) return "SaaS / Software";
  if (/agency|consulting|service|marketing/.test(blob)) return "Services / Agency";
  if (/blog|news|guide|article|resources/.test(blob)) return "Content / Publishing";
  return "General Business";
}

function seoRecommendations(topic: string, keywords: string[]): string[] {
  const base = [
    "Align title tags and H1s with high-intent keywords from your core pages.",
    "Create internal links from high-traffic pages to conversion pages.",
    "Add schema markup on priority pages to improve rich result eligibility.",
  ];

  if (topic === "Ecommerce") {
    return [
      "Add Product and Review schema for category and product pages.",
      "Optimize collection/category pages around buyer-intent terms.",
      ...base,
    ];
  }

  if (topic === "SaaS / Software") {
    return [
      "Build comparison and alternative pages for feature-driven keywords.",
      "Publish use-case pages that map to problem-aware search intent.",
      ...base,
    ];
  }

  if (topic === "Healthcare / Medical") {
    return [
      "Strengthen E-E-A-T with reviewed-by medical profiles and citations.",
      "Add condition, treatment, and FAQ schema where applicable.",
      ...base,
    ];
  }

  return [
    `Create dedicated landing pages for these themes: ${keywords.slice(0, 3).join(", ") || "primary services"}.`,
    ...base,
  ];
}

function hasRegex(html: string, re: RegExp): boolean {
  return re.test(html);
}

function scoreReadability(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = Math.max((text.match(/[.!?]/g) ?? []).length, 1);
  const avgWordsPerSentence = words / sentences;
  // Simpler, faster proxy score around 15 words/sentence as ideal.
  const delta = Math.abs(avgWordsPerSentence - 15);
  return Math.max(0, Math.min(100, Math.round(100 - delta * 4)));
}

function keywordCoverage(keywords: string[], title: string, description: string, h1: string): number {
  if (!keywords.length) return 0;
  const corpus = `${title} ${description} ${h1}`.toLowerCase();
  const covered = keywords.filter((k) => corpus.includes(k.toLowerCase())).length;
  return Math.round((covered / keywords.length) * 100);
}

async function discoverIssues(args: {
  siteUrl: string;
  title: string;
  description: string;
  hasStructuredData: boolean;
  keywordCoveragePct: number;
  internalLinkCount: number;
  pagespeedScore: number;
  headingCount: number;
}): Promise<SiteIntelPayload["issues"]> {
  const issues: SiteIntelPayload["issues"] = [];
  const site = args.siteUrl.replace(/\/$/, "");
  const encodedProperty = encodeURIComponent(site);

  let sitemapExists = false;
  try {
    const sitemapRes = await fetch(`${site}/sitemap.xml`, { method: "GET", cache: "no-store" });
    sitemapExists = sitemapRes.ok;
  } catch {
    sitemapExists = false;
  }

  if (!sitemapExists) {
    issues.push({
      id: "indexing-missing-sitemap",
      category: "indexing",
      severity: "high",
      problem: "No accessible sitemap.xml was detected.",
      impact: "Search engines may crawl and index important pages slower.",
      solution: "Generate and expose a sitemap at /sitemap.xml, then submit it in Search Console.",
      actions: [
        {
          id: "submit-sitemap",
          label: "Submit Sitemap Programmatically",
          type: "api",
          tool: "Google Search Console API",
          endpoint: "/api/remediation/execute",
          payload: { sitemapUrl: `${site}/sitemap.xml` },
        },
        {
          id: "open-search-console",
          label: "Open Search Console Property",
          type: "link",
          tool: "Google Search Console",
          url: `https://search.google.com/search-console?resource_id=${encodedProperty}`,
        },
      ],
    });
  }

  if (!args.title || !args.description) {
    issues.push({
      id: "seo-metadata-gap",
      category: "seo",
      severity: "high",
      problem: "Title or meta description is missing on the scanned homepage.",
      impact: "Lower click-through rate and reduced SERP relevance signals.",
      solution: "Set unique title and meta description aligned to target intent.",
      actions: [
        {
          id: "open-pagespeed",
          label: "Open Google Rich Results Test",
          type: "link",
          tool: "Rich Results Test",
          url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(site)}`,
        },
      ],
    });
  }

  if (args.pagespeedScore < 70) {
    issues.push({
      id: "technical-low-performance",
      category: "technical",
      severity: "high",
      problem: `Mobile performance score is ${args.pagespeedScore}, below recommended threshold.`,
      impact: "Core Web Vitals weaknesses can suppress ranking and reduce engagement.",
      solution: "Optimize LCP resource, reduce JS blocking, and stabilize CLS with fixed dimensions.",
      actions: [
        {
          id: "open-pagespeed-insights",
          label: "Open PageSpeed Insights",
          type: "link",
          tool: "PageSpeed Insights",
          url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(site)}`,
        },
      ],
    });
  }

  if (!args.hasStructuredData) {
    issues.push({
      id: "seo-schema-missing",
      category: "seo",
      severity: "medium",
      problem: "No JSON-LD structured data blocks were detected.",
      impact: "You may miss rich results and entity-based ranking enhancements.",
      solution: "Add Organization, WebSite, Breadcrumb, and page-specific schema.",
      actions: [
        {
          id: "open-schema-validator",
          label: "Open Schema Validator",
          type: "link",
          tool: "Schema Validator",
          url: `https://validator.schema.org/#url=${encodeURIComponent(site)}`,
        },
      ],
    });
  }

  if (args.keywordCoveragePct < 40) {
    issues.push({
      id: "content-low-keyword-coverage",
      category: "content",
      severity: "medium",
      problem: `Keyword coverage score is ${args.keywordCoveragePct}%.`,
      impact: "Pages may not map strongly to user intent or ranking queries.",
      solution: "Map each important page to one primary topic and supporting long-tail terms.",
      actions: [
        {
          id: "open-search-console-performance",
          label: "Open GSC Performance Report",
          type: "link",
          tool: "Google Search Console",
          url: `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodedProperty}`,
        },
      ],
    });
  }

  if (args.internalLinkCount < 10 || args.headingCount < 3) {
    issues.push({
      id: "ux-information-architecture",
      category: "ux",
      severity: "low",
      problem: "Low internal-link density or weak heading structure detected.",
      impact: "Crawl depth and user navigation clarity may suffer.",
      solution: "Increase contextual internal links and improve semantic heading hierarchy.",
      actions: [],
    });
  }

  if (!issues.length) {
    issues.push({
      id: "no-critical-issues",
      category: "seo",
      severity: "low",
      problem: "No critical blockers detected for this URL.",
      impact: "You can focus on scaling content and authority improvements.",
      solution: "Continue publishing intent-mapped pages and monitor trend KPIs weekly.",
      actions: [
        {
          id: "open-search-console",
          label: "Open Search Console",
          type: "link",
          tool: "Google Search Console",
          url: `https://search.google.com/search-console?resource_id=${encodedProperty}`,
        },
      ],
    });
  }

  return issues;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("siteUrl") ?? "";
  const userId = (request.nextUrl.searchParams.get("userId") ?? "").trim().toLowerCase();
  if (!raw) {
    return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
  }

  const siteUrl = getQueryUrl(raw);
  let validated: URL;
  try {
    validated = new URL(siteUrl);
  } catch {
    return NextResponse.json({ error: "Invalid siteUrl" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const cacheKey = `${userId || "anon"}::${validated.toString()}`;
    const cached = intelCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const res = await fetch(validated.toString(), {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "IndraSEO-Bot/1.0 (+https://indraseo.com)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Unable to fetch website content (HTTP ${res.status})` },
        { status: 502 },
      );
    }

    const html = await res.text();
    const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = firstMatch(
      html,
      /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i,
    );
    const h1 = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);

    const plainText = stripTags(html).slice(0, 15000);
    const contentKeywords = topTerms(`${title} ${description} ${h1} ${plainText}`, 12);
    const discoveredUrls = await discoverSiteUrls(validated, html);
    const sitewide = await analyzeSiteUrls(discoveredUrls);
    const gscKeywords = await gscQueriesForSite(validated.toString());
    const usingGscKeywords = gscKeywords.length >= 5;
    const mergedContentKeywords = Array.from(new Set([...contentKeywords, ...sitewide.topKeywords])).slice(0, 20);
    const keywords = usingGscKeywords ? gscKeywords.slice(0, 12) : mergedContentKeywords.slice(0, 12);
    const primaryTopic = inferTopic(title, description, keywords);
    const keywordClusters = buildKeywordClusters(keywords, usingGscKeywords ? "gsc" : "content");

    const [psi] = await Promise.all([runPageSpeed(validated.toString())]);
    const audit = parseAudit(psi);

    const signalSnapshot = {
      siteUrl: validated.toString(),
      title,
      description,
      h1,
      topKeywords: keywords,
      primaryTopic,
      technical: {
        pagespeedScore: audit?.score ?? 50,
        passed: audit?.passed ?? 0,
        warnings: audit?.warnings ?? 0,
        failed: audit?.failed ?? 0,
        lcp: audit?.lcp ?? "N/A",
        inp: audit?.inp ?? "N/A",
        cls: audit?.cls ?? "N/A",
      },
      functional: {
        hasNav: hasRegex(html, /<nav[\s>]/i),
        hasForm: hasRegex(html, /<form[\s>]/i),
        hasSearch: hasRegex(html, /type=["']search["']/i) || hasRegex(html, /search/i),
        hasStructuredData: hasRegex(html, /application\/ld\+json/i),
        internalLinkCount: (html.match(/<a[^>]+href=["']\//gi) ?? []).length,
      },
      user: {
        readabilityScore: scoreReadability(plainText),
        ctaCount: (html.match(/sign up|contact|book|buy now|get started|learn more|submit/gi) ?? []).length,
        headingCount: (html.match(/<h[1-6][\s>]/gi) ?? []).length,
      },
      seo: {
        hasTitle: Boolean(title),
        hasMetaDescription: Boolean(description),
        keywordCoverage: keywordCoverage(keywords, title, description, h1),
      },
    };

    const mlInsights = await generateMLInsights(signalSnapshot);
    const recommendations = mlInsights.recommendations.length
      ? mlInsights.recommendations
      : seoRecommendations(primaryTopic, keywords);

    if (sitewide.descriptionCoveragePct < 70) {
      recommendations.unshift("Increase meta description coverage across site URLs to at least 90% for better CTR consistency.");
    }
    if (sitewide.titleCoveragePct < 85) {
      recommendations.unshift("Add unique title tags across all indexable URLs to improve query matching and ranking coverage.");
    }

    const summary = [
      title ? `Title: ${title}` : "Title not found",
      description ? `Description: ${description}` : "Description not found",
      h1 ? `Primary heading: ${h1}` : "Primary heading not found",
      `Detected topic: ${primaryTopic}`,
      `Sitewide URLs discovered: ${sitewide.discoveredUrls}, analyzed: ${sitewide.analyzedUrls}`,
      `Coverage - title: ${sitewide.titleCoveragePct}%, meta description: ${sitewide.descriptionCoveragePct}%, H1: ${sitewide.h1CoveragePct}%`,
      keywords.length ? `Theme keywords: ${keywords.slice(0, 5).join(", ")}` : "Theme keywords: limited data",
      `Model summary: ${mlInsights.summary}`,
    ].join(". ");

    const previousSnapshot = userId
      ? await getLatestSnapshot(userId, validated.toString()).catch(() => null)
      : null;

    const currentAt = new Date().toISOString();
    const trend = previousSnapshot
      ? {
          previousAt: previousSnapshot.createdAt ?? currentAt,
          currentAt,
          delta: {
            technical: mlInsights.kpis.technical - previousSnapshot.kpis.technical,
            functional: mlInsights.kpis.functional - previousSnapshot.kpis.functional,
            user: mlInsights.kpis.user - previousSnapshot.kpis.user,
            seo: mlInsights.kpis.seo - previousSnapshot.kpis.seo,
            overall: mlInsights.kpis.overall - previousSnapshot.kpis.overall,
          },
        }
      : undefined;

    const payload: SiteIntelPayload = {
      userId: userId || undefined,
      siteUrl: validated.toString(),
      sitewide,
      title,
      description,
      primaryTopic,
      topKeywords: keywords,
      summary,
      recommendations,
      kpis: mlInsights.kpis,
      modelSource: mlInsights.modelSource,
      modelsUsed: mlInsights.modelsUsed,
      keywordClusters,
      trend,
      issues: await discoverIssues({
        siteUrl: validated.toString(),
        title,
        description,
        hasStructuredData: signalSnapshot.functional.hasStructuredData,
        keywordCoveragePct: signalSnapshot.seo.keywordCoverage,
        internalLinkCount: signalSnapshot.functional.internalLinkCount,
        pagespeedScore: signalSnapshot.technical.pagespeedScore,
        headingCount: signalSnapshot.user.headingCount,
      }),
    };

    if (userId) {
      await saveSnapshot({
        userId,
        siteUrl: validated.toString(),
        kpis: mlInsights.kpis,
        topKeywords: keywords,
        modelSource: mlInsights.modelSource,
        createdAt: currentAt,
      }).catch((error) => console.error("[site-intel:saveSnapshot]", error));
    }

    intelCache.set(cacheKey, {
      data: payload,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[/api/site-intel]", error);
    return NextResponse.json(
      { error: "Failed to analyze website content" },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
