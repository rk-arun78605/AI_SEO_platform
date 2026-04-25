import { NextRequest, NextResponse } from "next/server";
import { parseAudit, runPageSpeed } from "@/lib/pagespeed";

export const runtime = "nodejs";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("siteUrl") ?? "";
  if (!raw) {
    return NextResponse.json({ ok: false, error: "siteUrl is required" }, { status: 400 });
  }

  const siteUrl = normalizeUrl(raw);
  try {
    // Validate URL before upstream call.
    new URL(siteUrl);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid siteUrl" }, { status: 400 });
  }

  const psi = await runPageSpeed(siteUrl);
  const summary = parseAudit(psi);
  if (!summary) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "PageSpeed data is unavailable. Configure GOOGLE_PAGESPEED_API_KEY or check API quota.",
      },
      { status: 500 },
    );
  }

  const lighthouse = (psi?.lighthouseResult as Record<string, unknown> | undefined) ?? {};
  const audits = (lighthouse.audits as Record<string, Record<string, unknown>> | undefined) ?? {};

  const opportunities = Object.entries(audits)
    .filter(([, audit]) => {
      const score = typeof audit.score === "number" ? audit.score : null;
      const mode = typeof audit.scoreDisplayMode === "string" ? audit.scoreDisplayMode : "";
      return mode !== "notApplicable" && mode !== "manual" && score !== null && score < 0.9;
    })
    .map(([id, audit]) => ({
      id,
      title: typeof audit.title === "string" ? audit.title : id,
      displayValue: typeof audit.displayValue === "string" ? audit.displayValue : "",
      score: typeof audit.score === "number" ? audit.score : 1,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(({ id, title, displayValue }) => ({ id, title, displayValue }));

  return NextResponse.json({
    ok: true,
    siteUrl,
    summary: {
      score: summary.score,
      passed: summary.passed,
      warnings: summary.warnings,
      failed: summary.failed,
      lcp: summary.lcp,
      inp: summary.inp,
      cls: summary.cls,
    },
    opportunities,
  });
}
