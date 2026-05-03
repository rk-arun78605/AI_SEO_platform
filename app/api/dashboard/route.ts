// app/api/dashboard/route.ts
// Single endpoint that combines Google Search Console + PageSpeed Insights data
// into the shape the dashboard page needs.
//
// GET /api/dashboard?siteUrl=https://example.com/
//
// When credentials are not configured, returns empty live payload.

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, searchAnalytics, SearchRow } from "@/lib/gsc";
import { runPageSpeed, parseAudit } from "@/lib/pagespeed";
import type { DashboardPayload } from "@/lib/types";

/* ─── Utilities ─────────────────────────────────────────────────── */

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10);
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtPct(n: number, decimals = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── Empty fallback ────────────────────────────────────────────── */

function emptyPayload(
  siteUrl: string,
  dataStatus: DashboardPayload["dataStatus"] = "error",
  dataMessage = "Unable to load analytics data.",
): DashboardPayload {
  return {
    isDemo: false,
    siteUrl,
    lastUpdated: new Date().toISOString(),
    dataStatus,
    dataMessage,
    kpis: [
      { label: "Organic Traffic", value: "0", change: "0%", up: false },
      { label: "Keywords Top 10", value: "0", change: "0%", up: false },
      { label: "Avg. Position", value: "—", change: "0 pts", up: false },
      { label: "Click-Through Rate", value: "0.0%", change: "0.0%", up: false },
    ],
    trafficData: [],
    rankingData: [],
    keywordsData: [],
    auditData: [
      { name: "Passed", value: 0, color: "#10b981" },
      { name: "Warnings", value: 0, color: "#f59e0b" },
      { name: "Failed", value: 0, color: "#ef4444" },
    ],
    contentItems: [],
    yoyChange: "0%",
  };
}

/* ─── Route handler ─────────────────────────────────────────────── */

export async function GET(request: NextRequest) {
  const siteUrl =
    request.nextUrl.searchParams.get("siteUrl") ??
    process.env.NEXT_PUBLIC_DEFAULT_SITE_URL ??
    "";

  const token = await getAccessToken();

  // Return empty payload when credentials are missing or no site is configured
  if (!token || !siteUrl) {
    return NextResponse.json(
      emptyPayload(
        siteUrl || "unconfigured-site",
        "missing-gsc-auth",
        "Google Search Console credentials are missing, invalid, or this site is not configured for access.",
      ),
    );
  }

  try {
    const today = iso(0);
    const d28   = iso(28);
    const d56   = iso(56);
    const d365  = iso(365);

    // Fire all GSC queries in parallel
    const [trafficRes, kwCurrRes, kwPrevRes, trendRes, pagesRes] = await Promise.allSettled([

      // 12-month daily traffic (bucketed into months client-side)
      searchAnalytics(token, siteUrl, {
        startDate: d365, endDate: today,
        dimensions: ["date"], rowLimit: 5000,
      }),

      // Top 50 queries — current 28-day window (for keywords table + KPIs)
      searchAnalytics(token, siteUrl, {
        startDate: d28, endDate: today,
        dimensions: ["query"], rowLimit: 50,
        orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
      }),

      // Top 100 queries — previous 28-day window (for position-change delta)
      searchAnalytics(token, siteUrl, {
        startDate: d56, endDate: d28,
        dimensions: ["query"], rowLimit: 100,
      }),

      // Daily data for 8-week ranking trend
      searchAnalytics(token, siteUrl, {
        startDate: d56, endDate: today,
        dimensions: ["date"], rowLimit: 500,
      }),

      // Top 4 pages by clicks (content section)
      searchAnalytics(token, siteUrl, {
        startDate: d28, endDate: today,
        dimensions: ["page"], rowLimit: 4,
        orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
      }),
    ]);

    // PageSpeed (can run in parallel with GSC but we fire it after to avoid flooding)
    const psi   = await runPageSpeed(siteUrl);
    const audit = parseAudit(psi);

    /* ── 1. Traffic chart (12 months) ─────────────────────────── */
    const rawTrafficRows: SearchRow[] =
      trafficRes.status === "fulfilled" ? (trafficRes.value.rows ?? []) : [];

    // Sum clicks per calendar month
    const monthMap = new Map<string, number>(); // "YYYY-M" → clicks
    for (const row of rawTrafficRows) {
      const d = new Date(row.keys[0]);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + row.clicks);
    }

    const trafficData: DashboardPayload["trafficData"] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      trafficData.push({ month: MONTH_NAMES[d.getMonth()], organic: monthMap.get(key) ?? 0, paid: 0 });
    }

    /* ── 2. KPIs (current vs previous 28-day period) ────────────── */
    const currRows: SearchRow[] = kwCurrRes.status === "fulfilled" ? (kwCurrRes.value.rows ?? []) : [];
    const prevRows: SearchRow[] = kwPrevRes.status === "fulfilled" ? (kwPrevRes.value.rows ?? []) : [];
    const pageRows: SearchRow[] = pagesRes.status === "fulfilled" ? (pagesRes.value.rows ?? []) : [];

    const sum = (rows: SearchRow[], field: keyof Pick<SearchRow,"clicks"|"impressions"|"ctr"|"position">) =>
      rows.reduce((s, r) => s + r[field], 0);

    const currClicks   = sum(currRows, "clicks");
    const prevClicks   = sum(prevRows, "clicks");
    const currTop10    = currRows.filter((r) => r.position <= 10).length;
    const prevTop10    = prevRows.filter((r) => r.position <= 10).length;
    const currAvgPos   = currRows.length ? sum(currRows, "position") / currRows.length : 0;
    const prevAvgPos   = prevRows.length ? sum(prevRows, "position") / prevRows.length : 0;
    const currCtrPct   = currRows.length ? (sum(currRows, "ctr") / currRows.length) * 100 : 0;
    const prevCtrPct   = prevRows.length ? (sum(prevRows, "ctr") / prevRows.length) * 100 : 0;

    const trafficChg   = prevClicks  > 0 ? ((currClicks  - prevClicks)  / prevClicks)  * 100 : 0;
    const top10Chg     = prevTop10   > 0 ? ((currTop10   - prevTop10)   / prevTop10)   * 100 : 0;
    const posChg       = currAvgPos  - prevAvgPos; // negative = improved
    const ctrChg       = currCtrPct  - prevCtrPct;

    const kpis: DashboardPayload["kpis"] = [
      {
        label: "Organic Traffic",
        value: fmtCompact(currClicks),
        change: fmtPct(trafficChg),
        up: trafficChg >= 0,
      },
      {
        label: "Keywords Top 10",
        value: currTop10.toLocaleString(),
        change: fmtPct(top10Chg),
        up: top10Chg >= 0,
      },
      {
        label: "Avg. Position",
        value: currAvgPos > 0 ? currAvgPos.toFixed(1) : "—",
        change: posChg !== 0 ? `${posChg > 0 ? "+" : ""}${posChg.toFixed(1)} pts` : "0 pts",
        up: posChg <= 0, // lower position number = better
      },
      {
        label: "Click-Through Rate",
        value: `${currCtrPct.toFixed(1)}%`,
        change: `${ctrChg >= 0 ? "+" : ""}${ctrChg.toFixed(1)}%`,
        up: ctrChg >= 0,
      },
    ];

    /* ── 3. Keywords table with position change ─────────────────── */
    const prevPosMap = new Map<string, number>();
    for (const row of prevRows) prevPosMap.set(row.keys[0], row.position);

    const keywordsData: DashboardPayload["keywordsData"] = currRows.slice(0, 6).map((row) => {
      const prev   = prevPosMap.get(row.keys[0]);
      const change = prev != null ? Math.round(prev - row.position) : 0; // positive = improved
      return { name: row.keys[0], vol: row.impressions, pos: Math.round(row.position), change };
    });

    /* ── 4. 8-week ranking trend ────────────────────────────────── */
    const trendRows: SearchRow[] = trendRes.status === "fulfilled" ? (trendRes.value.rows ?? []) : [];
    trendRows.sort((a, b) => a.keys[0].localeCompare(b.keys[0]));

    const gscSettled = [trafficRes, kwCurrRes, kwPrevRes, trendRes, pagesRes];
    const gscRejectedCount = gscSettled.filter((r) => r.status === "rejected").length;
    const gscRowsAvailable =
      rawTrafficRows.length + currRows.length + prevRows.length + trendRows.length + pageRows.length > 0;

    const dataStatus: DashboardPayload["dataStatus"] =
      gscRejectedCount === gscSettled.length || !gscRowsAvailable
        ? "no-gsc-access-or-data"
        : "ok";

    const dataMessage =
      dataStatus === "ok"
        ? ""
        : "No Google Search Console rows were returned for this website. Share the exact property with your service account or connect via OAuth, then re-scan.";

    const buckets: { sum: number; cnt: number }[] = Array.from({ length: 8 }, () => ({ sum: 0, cnt: 0 }));
    trendRows.forEach((row, i) => {
      const idx = Math.min(Math.floor((i / Math.max(trendRows.length, 1)) * 8), 7);
      buckets[idx].sum += row.position;
      buckets[idx].cnt++;
    });

    const rankingData: DashboardPayload["rankingData"] = buckets.map((b, i) => ({
      week: `W${i + 1}`,
      avg:  b.cnt > 0 ? parseFloat((b.sum / b.cnt).toFixed(1)) : 0,
    }));

    /* ── 5. Audit donut ────────────────────────────────────────── */
    const auditData: DashboardPayload["auditData"] = audit
      ? [
          { name: "Passed",   value: audit.passed,   color: "#10b981" },
          { name: "Warnings", value: audit.warnings, color: "#f59e0b" },
          { name: "Failed",   value: audit.failed,   color: "#ef4444" },
        ]
      : emptyPayload(siteUrl).auditData;

    /* ── 6. Top pages (content section) ────────────────────────── */
    const perfScore = audit?.score ?? 70;

    const contentItems: DashboardPayload["contentItems"] = pageRows.length
      ? pageRows.map((row) => {
          const path = row.keys[0].replace(/^https?:\/\/[^/]+/, "") || "/";
          return { title: path, score: perfScore, status: "Live", traffic: fmtCompact(row.clicks) };
        })
      : emptyPayload(siteUrl).contentItems;

    /* ── 7. YoY change badge ────────────────────────────────────── */
    // Compare last 6 months vs same 6-month window 1 year ago
    const sixMonthsAgoMs = Date.now() - 182 * 86_400_000;
    const oneYearAgoMs   = Date.now() - 365 * 86_400_000;

    const recentHalf = rawTrafficRows
      .filter((r) => new Date(r.keys[0]).getTime() >= sixMonthsAgoMs)
      .reduce((s, r) => s + r.clicks, 0);
    const prevHalf = rawTrafficRows
      .filter((r) => {
        const t = new Date(r.keys[0]).getTime();
        return t >= oneYearAgoMs && t < sixMonthsAgoMs;
      })
      .reduce((s, r) => s + r.clicks, 0);

    const yoyChange = prevHalf > 0 ? fmtPct(((recentHalf - prevHalf) / prevHalf) * 100, 0) : "+—";

    return NextResponse.json({
      isDemo: false,
      siteUrl,
      lastUpdated: new Date().toISOString(),
      dataStatus,
      dataMessage,
      kpis,
      trafficData,
      rankingData,
      keywordsData,
      auditData,
      contentItems,
      yoyChange,
    } satisfies DashboardPayload);

  } catch (err) {
    console.error("[/api/dashboard]", err);
    // On any error return empty live payload so the UI stays functional without fake data
    return NextResponse.json(
      emptyPayload(siteUrl, "error", "Analytics pipeline failed for this URL. Please retry scan."),
    );
  }
}
