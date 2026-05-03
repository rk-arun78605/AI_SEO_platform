import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, searchAnalytics } from "@/lib/gsc";

export const runtime = "nodejs";

type TestResult = {
  ok: boolean;
  testedSiteUrl: string;
  property: string;
  rows: number;
  note: string;
};

function normalizeInput(raw: string): URL | null {
  try {
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(normalized);
  } catch {
    return null;
  }
}

function candidateProperties(url: URL): string[] {
  const originSlash = `${url.origin}/`;
  const input = `${url.origin}${url.pathname === "/" ? "/" : url.pathname}`;
  const domain = `sc-domain:${url.hostname}`;

  const uniq = new Set<string>([input, originSlash, domain]);
  return Array.from(uniq);
}

export async function GET(request: NextRequest) {
  const siteUrlRaw = (request.nextUrl.searchParams.get("siteUrl") ?? "").trim();
  if (!siteUrlRaw) {
    return NextResponse.json({ ok: false, error: "siteUrl is required" }, { status: 400 });
  }

  const parsed = normalizeInput(siteUrlRaw);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: "Invalid siteUrl" }, { status: 400 });
  }

  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({
      ok: false,
      status: "missing-auth",
      testedSiteUrl: parsed.toString(),
      message: "GSC credentials are missing/invalid. Configure service account env vars or OAuth connector.",
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const d7 = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

  const candidates = candidateProperties(parsed);
  const failures: Array<{ property: string; error: string }> = [];

  for (const property of candidates) {
    try {
      const res = await searchAnalytics(token, property, {
        startDate: d7,
        endDate: today,
        dimensions: ["date"],
        rowLimit: 5,
      });

      const rows = res.rows?.length ?? 0;
      const payload: TestResult = {
        ok: true,
        testedSiteUrl: parsed.toString(),
        property,
        rows,
        note:
          rows > 0
            ? "Access OK and data rows found."
            : "Access OK, but no rows returned in selected window.",
      };
      return NextResponse.json(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      failures.push({ property, error: message.slice(0, 240) });
    }
  }

  return NextResponse.json({
    ok: false,
    status: "no-access",
    testedSiteUrl: parsed.toString(),
    message:
      "No matching GSC property access found. Share this property with your service account or connect OAuth for this account.",
    attempts: failures,
  });
}
