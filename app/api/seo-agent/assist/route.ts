import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/otp-session";
import { generateMLInsights } from "@/lib/aws-model-insights";

export const runtime = "nodejs";

type Body = {
  sessionToken: string;
  siteUrl: string;
  inputText: string;
};

const BLOCKED_TERMS = [
  "sql injection",
  "xss",
  "bypass auth",
  "ddos",
  "exploit",
  "malware",
  "ransomware",
  "hack",
  "deface",
  "bruteforce",
  "steal data",
  "phishing",
  "reverse shell",
  "credential stuffing",
];

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUrl(raw: string): string {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionToken = sanitize(body.sessionToken);
  const siteUrlRaw = sanitize(body.siteUrl);
  const inputText = sanitize(body.inputText);

  if (!sessionToken || !siteUrlRaw || !inputText) {
    return NextResponse.json({ error: "sessionToken, siteUrl and inputText are required" }, { status: 400 });
  }

  const session = verifySessionToken(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Invalid or expired secure session" }, { status: 401 });
  }

  let siteUrl: URL;
  try {
    siteUrl = new URL(normalizeUrl(siteUrlRaw));
  } catch {
    return NextResponse.json({ error: "Invalid siteUrl" }, { status: 400 });
  }

  if (siteUrl.hostname.toLowerCase() !== session.websiteHost) {
    return NextResponse.json(
      { error: "You can only request AI changes for your verified website host" },
      { status: 403 },
    );
  }

  const lower = inputText.toLowerCase();
  if (BLOCKED_TERMS.some((term) => lower.includes(term))) {
    return NextResponse.json(
      {
        error:
          "Request blocked by security policy. Only safe SEO optimization guidance is allowed.",
      },
      { status: 400 },
    );
  }

  const agent = await generateMLInsights({
    siteUrl: siteUrl.toString(),
    title: "User SEO change request",
    description: inputText,
    h1: "SEO assistant",
    topKeywords: inputText.split(/\s+/).slice(0, 10),
    primaryTopic: "SEO optimization",
    technical: {
      pagespeedScore: 50,
      passed: 0,
      warnings: 0,
      failed: 0,
      lcp: "N/A",
      inp: "N/A",
      cls: "N/A",
    },
    functional: {
      hasNav: true,
      hasForm: true,
      hasSearch: false,
      hasStructuredData: false,
      internalLinkCount: 0,
    },
    user: {
      readabilityScore: 50,
      ctaCount: 0,
      headingCount: 0,
    },
    seo: {
      hasTitle: true,
      hasMetaDescription: true,
      keywordCoverage: 50,
    },
  });

  const safeRecommendations = agent.recommendations
    .filter((item) => !BLOCKED_TERMS.some((term) => item.toLowerCase().includes(term)))
    .slice(0, 6);

  const missing = [
    /meta description|meta/i.test(lower) ? null : "Meta description optimization",
    /schema|structured data/i.test(lower) ? null : "Structured data/schema checks",
    /internal link|linking/i.test(lower) ? null : "Internal linking enhancements",
    /core web vitals|pagespeed|lcp|inp|cls/i.test(lower) ? null : "Core Web Vitals remediation",
  ].filter(Boolean) as string[];

  return NextResponse.json({
    ok: true,
    mode: "safe-seo-agent",
    siteHost: session.websiteHost,
    summary: agent.summary,
    missingAreas: missing,
    recommendations: safeRecommendations,
    requiresApproval: true,
    securityPolicy: [
      "No website hacking or exploit actions",
      "No credential misuse or bypass operations",
      "Only SEO-safe recommendations for verified host",
    ],
  });
}
