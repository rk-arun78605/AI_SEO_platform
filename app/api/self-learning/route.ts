import { NextRequest, NextResponse } from "next/server";
import { listRecentSnapshots } from "../../../lib/scan-history";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId  = request.nextUrl.searchParams.get("userId")  ?? "";
  const siteUrl = request.nextUrl.searchParams.get("siteUrl") ?? "";

  if (!userId || !siteUrl) {
    return NextResponse.json({ ok:false, error:"userId and siteUrl required" }, { status:400 });
  }

  try {
    const all  = await listRecentSnapshots(userId, 20);
    const snaps = all.filter(s => s.siteUrl === siteUrl)
                     .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (snaps.length < 2) {
      return NextResponse.json({ ok:true, data:{ has_history:false, scan_count:snaps.length, message:"Scan this site at least twice to unlock learning insights" } });
    }

    const first  = snaps[0];
    const latest = snaps[snaps.length - 1];

    const delta = {
      technical:  latest.kpis.technical  - first.kpis.technical,
      seo:        latest.kpis.seo        - first.kpis.seo,
      functional: latest.kpis.functional - first.kpis.functional,
      user:       latest.kpis.user       - first.kpis.user,
      overall:    latest.kpis.overall    - first.kpis.overall,
    };

    const trend = delta.overall > 5 ? "improving" : delta.overall < -5 ? "declining" : "stable";

    const insights: string[] = [];
    if (delta.technical > 5)  insights.push("Technical score improved — recent fixes are working");
    if (delta.seo > 5)        insights.push("SEO signals strengthened since first scan");
    if (delta.technical < -5) insights.push("Technical score dropped — check for new crawl errors");
    if (delta.seo < -5)       insights.push("SEO signals weakened — review metadata and keyword coverage");
    if (Math.abs(delta.overall) < 3) insights.push("Scores stable — focus on content expansion and link building");

    const recommendation =
      trend === "improving" ? "Keep momentum — focus on link building and content depth" :
      trend === "declining" ? "Prioritise technical fixes before adding new content" :
      "Run a competitor gap analysis to find your next win";

    return NextResponse.json({ ok:true, data:{
      has_history:   true,
      scan_count:    snaps.length,
      first_scan:    first.createdAt,
      latest_scan:   latest.createdAt,
      trend,
      delta,
      history:       snaps.map(s => ({ date:s.createdAt, overall:s.kpis.overall, technical:s.kpis.technical, seo:s.kpis.seo })),
      insights,
      adaptive_recommendation: recommendation,
    }});
  } catch(e) {
    console.error("[self-learning]", e);
    return NextResponse.json({ ok:false, error:"Self-learning data unavailable" }, { status:500 });
  }
}
