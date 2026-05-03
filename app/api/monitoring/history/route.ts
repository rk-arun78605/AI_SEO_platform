import { NextRequest, NextResponse } from "next/server";
import { listRecentSnapshots } from "@/lib/scan-history";

export const runtime = "nodejs";

type MetricKey = "technical" | "functional" | "user" | "seo" | "overall";

const METRIC_KEYS: MetricKey[] = ["technical", "functional", "user", "seo", "overall"];

export async function GET(request: NextRequest) {
  const userId = (request.nextUrl.searchParams.get("userId") ?? "").trim().toLowerCase();
  const siteUrl = (request.nextUrl.searchParams.get("siteUrl") ?? "").trim();
  const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "25");
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 100)) : 25;

  if (!userId || !siteUrl) {
    return NextResponse.json({ error: "userId and siteUrl are required" }, { status: 400 });
  }

  try {
    const snapshotsDesc = await listRecentSnapshots(userId, siteUrl, limit);
    const snapshots = [...snapshotsDesc].reverse();

    const points = snapshots.map((row, index) => {
      const prev = index > 0 ? snapshots[index - 1] : null;
      const delta = {
        technical: prev ? row.kpis.technical - prev.kpis.technical : 0,
        functional: prev ? row.kpis.functional - prev.kpis.functional : 0,
        user: prev ? row.kpis.user - prev.kpis.user : 0,
        seo: prev ? row.kpis.seo - prev.kpis.seo : 0,
        overall: prev ? row.kpis.overall - prev.kpis.overall : 0,
      };

      const droppedMetrics = METRIC_KEYS.filter((k) => delta[k] < 0);

      return {
        createdAt: row.createdAt,
        siteUrl: row.siteUrl,
        kpis: row.kpis,
        delta,
        droppedMetrics,
      };
    });

    return NextResponse.json({
      ok: true,
      points,
      latestAt: points.length ? points[points.length - 1].createdAt : null,
    });
  } catch (error) {
    console.error("[/api/monitoring/history]", error);
    return NextResponse.json({ error: "Failed to load monitoring history" }, { status: 500 });
  }
}
