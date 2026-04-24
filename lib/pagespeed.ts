// lib/pagespeed.ts
// Google PageSpeed Insights API v5 client.
//
// Required env var:
//   GOOGLE_PAGESPEED_API_KEY

const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export interface PSIAuditSummary {
  passed: number;
  warnings: number;
  failed: number;
  score: number;                                  // 0-100 performance score
  lcp: string;                                    // "2.1s" or "N/A"
  inp: string;                                    // "48ms" or "N/A"
  cls: string;                                    // "0.18" or "N/A"
  lcpStatus: "pass" | "warn" | "fail" | "unknown";
  inpStatus: "pass" | "warn" | "fail" | "unknown";
  clsStatus: "pass" | "warn" | "fail" | "unknown";
}

export async function runPageSpeed(url: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey || apiKey === "placeholder") return null;

  const params = new URLSearchParams({ url, key: apiKey, strategy: "mobile" });
  ["performance", "seo", "best-practices", "accessibility"].forEach((c) =>
    params.append("category", c),
  );

  try {
    const res = await fetch(`${PSI_BASE}?${params}`, {
      next: { revalidate: 3600 }, // cache PSI results for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function parseAudit(psi: Record<string, unknown> | null): PSIAuditSummary | null {
  if (!psi) return null;

  const lr = psi.lighthouseResult as Record<string, unknown> | undefined;
  if (!lr) return null;

  const audits = (lr.audits ?? {}) as Record<
    string,
    { score: number | null; scoreDisplayMode?: string }
  >;

  let passed = 0, warnings = 0, failed = 0;
  for (const audit of Object.values(audits)) {
    const mode = audit.scoreDisplayMode;
    if (mode === "notApplicable" || mode === "informative" || mode === "manual") continue;
    const score = audit.score ?? 0;
    if (score >= 0.9)       passed++;
    else if (score >= 0.5)  warnings++;
    else                    failed++;
  }

  const perfScore = Math.round(
    (((lr.categories as Record<string, { score: number }>)?.performance?.score) ?? 0) * 100,
  );

  // Field data (real-user metrics) — preferred
  const fieldMetrics = (psi.loadingExperience as Record<string, unknown> | undefined)
    ?.metrics as Record<string, { percentile?: number }> | undefined ?? {};

  const lcpField: number | null = fieldMetrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null;
  const inpField: number | null =
    fieldMetrics.INTERACTION_TO_NEXT_PAINT?.percentile ??
    fieldMetrics.FIRST_INPUT_DELAY_MS?.percentile ??
    null;
  const clsRaw: number | null = fieldMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile ?? null;
  // PSI returns CLS * 100 in field data
  const clsField: number | null = clsRaw != null ? clsRaw / 100 : null;

  // Lab data fallbacks (Lighthouse)
  const labAudits = audits as Record<string, { numericValue?: number }>;
  const lcpLab: number | null = labAudits["largest-contentful-paint"]?.numericValue ?? null;
  const clsLab: number | null = labAudits["cumulative-layout-shift"]?.numericValue ?? null;

  const lcpMs  = lcpField ?? lcpLab;
  const clsVal = clsField ?? clsLab;

  function lcpStatus(ms: number | null): PSIAuditSummary["lcpStatus"] {
    if (ms == null) return "unknown";
    return ms <= 2500 ? "pass" : ms <= 4000 ? "warn" : "fail";
  }
  function inpStatus(ms: number | null): PSIAuditSummary["inpStatus"] {
    if (ms == null) return "unknown";
    return ms <= 200 ? "pass" : ms <= 500 ? "warn" : "fail";
  }
  function clsStatus(val: number | null): PSIAuditSummary["clsStatus"] {
    if (val == null) return "unknown";
    return val <= 0.1 ? "pass" : val <= 0.25 ? "warn" : "fail";
  }

  return {
    passed,
    warnings,
    failed,
    score: perfScore,
    lcp:  lcpMs  != null ? `${(lcpMs  / 1000).toFixed(1)}s`  : "N/A",
    inp:  inpField != null ? `${inpField}ms` : "N/A",
    cls:  clsVal != null ? clsVal.toFixed(2) : "N/A",
    lcpStatus: lcpStatus(lcpMs),
    inpStatus: inpStatus(inpField),
    clsStatus: clsStatus(clsVal),
  };
}
