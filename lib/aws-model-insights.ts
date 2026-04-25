import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

export interface SignalSnapshot {
  siteUrl: string;
  title: string;
  description: string;
  h1: string;
  topKeywords: string[];
  primaryTopic: string;
  technical: {
    pagespeedScore: number;
    passed: number;
    warnings: number;
    failed: number;
    lcp: string;
    inp: string;
    cls: string;
  };
  functional: {
    hasNav: boolean;
    hasForm: boolean;
    hasSearch: boolean;
    hasStructuredData: boolean;
    internalLinkCount: number;
  };
  user: {
    readabilityScore: number;
    ctaCount: number;
    headingCount: number;
  };
  seo: {
    hasTitle: boolean;
    hasMetaDescription: boolean;
    keywordCoverage: number;
  };
}

export interface MLInsightResult {
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
}

let cachedClient: BedrockRuntimeClient | null = null;

function bedrockConfigured(): boolean {
  return Boolean(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BEDROCK_MODEL_ID,
  );
}

function getClient(): BedrockRuntimeClient {
  if (!cachedClient) {
    cachedClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
  }
  return cachedClient;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function heuristicInsights(input: SignalSnapshot): MLInsightResult {
  const technical = clampScore(input.technical.pagespeedScore);
  const functional = clampScore(
    (input.functional.hasNav ? 30 : 0) +
      (input.functional.hasForm ? 25 : 0) +
      (input.functional.hasSearch ? 15 : 0) +
      (input.functional.hasStructuredData ? 15 : 0) +
      Math.min(input.functional.internalLinkCount, 15),
  );
  const user = clampScore(input.user.readabilityScore * 0.5 + Math.min(input.user.ctaCount * 10, 25) + Math.min(input.user.headingCount * 3, 25));
  const seo = clampScore((input.seo.hasTitle ? 30 : 0) + (input.seo.hasMetaDescription ? 30 : 0) + input.seo.keywordCoverage * 0.4);
  const overall = clampScore(technical * 0.35 + functional * 0.2 + user * 0.2 + seo * 0.25);

  const recommendations = [
    "Align high-intent keywords with title tag, H1, and first 120 words on each money page.",
    "Improve internal link flow from high-traffic pages to conversion pages.",
    "Add schema markup on critical templates to increase rich result eligibility.",
  ];

  return {
    summary: `Detected ${input.primaryTopic} website. Baseline SEO model scored ${overall}/100 with strongest area in ${technical >= seo ? "technical performance" : "search relevance"}.`,
    recommendations,
    kpis: { technical, functional, user, seo, overall },
    modelSource: "heuristic",
    modelsUsed: [
      {
        id: "heuristic-seo-v1",
        name: "Heuristic SEO Baseline",
        status: "active",
        score: overall,
        notes: "Rule-weighted baseline from technical, functional, user, and SEO signals.",
      },
    ],
  };
}

function rulesEngineScore(input: SignalSnapshot): number {
  let score = 100;
  if (!input.seo.hasTitle) score -= 20;
  if (!input.seo.hasMetaDescription) score -= 15;
  if (!input.functional.hasStructuredData) score -= 12;
  if (input.technical.pagespeedScore < 50) score -= 18;
  if (input.user.headingCount < 3) score -= 10;
  if (input.functional.internalLinkCount < 10) score -= 10;
  if (input.seo.keywordCoverage < 40) score -= 8;
  return clampScore(score);
}

function buildPrompt(input: SignalSnapshot): string {
  return [
    "You are an SEO/UX/technical auditor model.",
    "Return strict JSON only (no markdown) with keys:",
    "summary:string, recommendations:string[5], kpis:{technical:number,functional:number,user:number,seo:number,overall:number}",
    "Scores must be integers in [0,100].",
    "Base output on the following website signal snapshot:",
    JSON.stringify(input),
  ].join("\n");
}

function parseModelJson(text: string): MLInsightResult | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < 0 || end <= start) return null;
    const parsed = JSON.parse(text.slice(start, end + 1)) as {
      summary?: string;
      recommendations?: string[];
      kpis?: { technical?: number; functional?: number; user?: number; seo?: number; overall?: number };
    };

    if (!parsed.summary || !parsed.kpis) return null;

    const recommendations = (parsed.recommendations ?? []).filter(Boolean).slice(0, 5);
    return {
      summary: parsed.summary,
      recommendations: recommendations.length ? recommendations : ["Create URL-specific landing pages and improve internal linking."],
      kpis: {
        technical: clampScore(parsed.kpis.technical ?? 0),
        functional: clampScore(parsed.kpis.functional ?? 0),
        user: clampScore(parsed.kpis.user ?? 0),
        seo: clampScore(parsed.kpis.seo ?? 0),
        overall: clampScore(parsed.kpis.overall ?? 0),
      },
      modelSource: "aws-bedrock",
      modelsUsed: [
        {
          id: "aws-bedrock-primary",
          name: "AWS Bedrock Inference",
          status: "active",
          score: clampScore(parsed.kpis.overall ?? 0),
          notes: "Primary LLM inference for holistic SEO recommendations.",
        },
      ],
    };
  } catch {
    return null;
  }
}

function openAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);
}

async function callOpenAIModel(input: SignalSnapshot): Promise<MLInsightResult | null> {
  if (!openAIConfigured()) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: buildPrompt(input),
          },
        ],
      }),
    });

    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = payload.choices?.[0]?.message?.content ?? "";
    const parsed = parseModelJson(text);
    if (!parsed) return null;

    return {
      ...parsed,
      modelSource: "ensemble",
      modelsUsed: [
        {
          id: "openai-primary",
          name: `OpenAI ${process.env.OPENAI_MODEL}`,
          status: "active",
          score: parsed.kpis.overall,
          notes: "Cross-model reasoning for SEO recommendation quality.",
        },
      ],
    };
  } catch (error) {
    console.error("[callOpenAIModel]", error);
    return null;
  }
}

export async function generateMLInsights(input: SignalSnapshot): Promise<MLInsightResult> {
  const heuristic = heuristicInsights(input);
  const rulesScore = rulesEngineScore(input);
  const openAI = await callOpenAIModel(input);

  if (!bedrockConfigured()) {
    if (openAI) {
      const overall = clampScore(openAI.kpis.overall * 0.6 + heuristic.kpis.overall * 0.25 + rulesScore * 0.15);
      return {
        summary: `${openAI.summary} Ensemble confidence improved using OpenAI + heuristic + rules validation.`,
        recommendations: Array.from(new Set([...openAI.recommendations, ...heuristic.recommendations])).slice(0, 6),
        kpis: {
          technical: clampScore(openAI.kpis.technical * 0.65 + heuristic.kpis.technical * 0.35),
          functional: clampScore(openAI.kpis.functional * 0.65 + heuristic.kpis.functional * 0.35),
          user: clampScore(openAI.kpis.user * 0.65 + heuristic.kpis.user * 0.35),
          seo: clampScore(openAI.kpis.seo * 0.65 + heuristic.kpis.seo * 0.35),
          overall,
        },
        modelSource: "ensemble",
        modelsUsed: [
          ...openAI.modelsUsed,
          ...heuristic.modelsUsed,
          {
            id: "rules-engine-v1",
            name: "Deterministic Rules Engine",
            status: "active",
            score: rulesScore,
            notes: "Fast checks for indexability, metadata, structure, and performance.",
          },
        ],
      };
    }

    return {
      ...heuristic,
      summary: `${heuristic.summary} Ensemble mode: heuristic + rules engine fallback.`,
      modelsUsed: [
        ...heuristic.modelsUsed,
        {
          id: "rules-engine-v1",
          name: "Deterministic Rules Engine",
          status: "active",
          score: rulesScore,
          notes: "Fast checks for indexability, metadata, structure, and performance.",
        },
      ],
    };
  }

  try {
    const command = new ConverseCommand({
      modelId: process.env.AWS_BEDROCK_MODEL_ID,
      messages: [
        {
          role: "user",
          content: [{ text: buildPrompt(input) }],
        },
      ],
      inferenceConfig: {
        maxTokens: 700,
        temperature: 0.2,
      },
    });

    const response = await getClient().send(command);
    const text = response.output?.message?.content?.[0]?.text ?? "";
    const parsed = parseModelJson(text);
    if (parsed) {
      const bedrockWeight = openAI ? 0.4 : 0.5;
      const openAIWeight = openAI ? 0.25 : 0;
      const heuristicWeight = openAI ? 0.2 : 0.3;
      const rulesWeight = 0.15;

      const combinedOverall = clampScore(
        parsed.kpis.overall * bedrockWeight +
          (openAI?.kpis.overall ?? 0) * openAIWeight +
          heuristic.kpis.overall * heuristicWeight +
          rulesScore * rulesWeight,
      );

      const mergedRecommendations = Array.from(
        new Set([...parsed.recommendations, ...(openAI?.recommendations ?? []), ...heuristic.recommendations]),
      ).slice(0, 7);

      return {
        summary: `${parsed.summary} Ensemble confidence improved using Bedrock${openAI ? " + OpenAI" : ""} + heuristic + rules validation.`,
        recommendations: mergedRecommendations,
        kpis: {
          technical: clampScore(parsed.kpis.technical * 0.55 + (openAI?.kpis.technical ?? 0) * (openAI ? 0.2 : 0) + heuristic.kpis.technical * 0.25),
          functional: clampScore(parsed.kpis.functional * 0.55 + (openAI?.kpis.functional ?? 0) * (openAI ? 0.2 : 0) + heuristic.kpis.functional * 0.25),
          user: clampScore(parsed.kpis.user * 0.55 + (openAI?.kpis.user ?? 0) * (openAI ? 0.2 : 0) + heuristic.kpis.user * 0.25),
          seo: clampScore(parsed.kpis.seo * 0.55 + (openAI?.kpis.seo ?? 0) * (openAI ? 0.2 : 0) + heuristic.kpis.seo * 0.25),
          overall: combinedOverall,
        },
        modelSource: openAI ? "ensemble" : "aws-bedrock",
        modelsUsed: [
          ...parsed.modelsUsed,
          ...(openAI?.modelsUsed ?? []),
          {
            id: "heuristic-seo-v1",
            name: "Heuristic SEO Baseline",
            status: "active",
            score: heuristic.kpis.overall,
            notes: "Used for cross-check and score stabilization.",
          },
          {
            id: "rules-engine-v1",
            name: "Deterministic Rules Engine",
            status: "active",
            score: rulesScore,
            notes: "Applied for explainable failure-point detection.",
          },
        ],
      };
    }

    return {
      ...heuristic,
      summary: `${heuristic.summary} Bedrock response parsing failed, fallback ensemble kept active${openAI ? " with OpenAI" : ""}.`,
      modelsUsed: [
        ...(openAI?.modelsUsed ?? []),
        ...heuristic.modelsUsed,
        {
          id: "aws-bedrock-primary",
          name: "AWS Bedrock Inference",
          status: "fallback",
          score: heuristic.kpis.overall,
          notes: "Model output was unavailable or invalid JSON.",
        },
        {
          id: "rules-engine-v1",
          name: "Deterministic Rules Engine",
          status: "active",
          score: rulesScore,
          notes: "Maintains consistent checks when LLM output degrades.",
        },
      ],
    };
  } catch (error) {
    console.error("[generateMLInsights]", error);
    return {
      ...heuristic,
      summary: `${heuristic.summary} Bedrock unavailable, running resilient fallback stack${openAI ? " with OpenAI" : ""}.`,
      modelSource: openAI ? "ensemble" : "heuristic",
      modelsUsed: [
        ...(openAI?.modelsUsed ?? []),
        ...heuristic.modelsUsed,
        {
          id: "aws-bedrock-primary",
          name: "AWS Bedrock Inference",
          status: "fallback",
          score: heuristic.kpis.overall,
          notes: "Request failed; check AWS credentials, region, model ID, and permissions.",
        },
        {
          id: "rules-engine-v1",
          name: "Deterministic Rules Engine",
          status: "active",
          score: rulesScore,
          notes: "Ensures actionable output despite model unavailability.",
        },
      ],
    };
  }
}
