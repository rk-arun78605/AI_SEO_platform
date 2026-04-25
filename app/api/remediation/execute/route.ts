import { NextResponse } from "next/server";
import { getAccessToken, submitSitemap } from "@/lib/gsc";

export const runtime = "nodejs";

type ExecuteBody = {
  actionId: string;
  siteUrl: string;
  payload?: Record<string, unknown>;
};

function normalizeUrl(raw: string): string {
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
  return raw;
}

export async function POST(request: Request) {
  let body: ExecuteBody;
  try {
    body = (await request.json()) as ExecuteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.actionId || !body.siteUrl) {
    return NextResponse.json({ error: "actionId and siteUrl are required" }, { status: 400 });
  }

  const siteUrl = normalizeUrl(body.siteUrl);

  if (body.actionId === "submit-sitemap") {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        {
          error:
            "Search Console credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, and grant property access to service account.",
        },
        { status: 500 },
      );
    }

    const sitemapUrl = String(body.payload?.sitemapUrl ?? `${siteUrl.replace(/\/$/, "")}/sitemap.xml`);

    try {
      await submitSitemap(token, siteUrl, sitemapUrl);
      return NextResponse.json({ ok: true, message: `Sitemap submitted: ${sitemapUrl}` });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to submit sitemap" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ error: `Unsupported actionId: ${body.actionId}` }, { status: 400 });
}
