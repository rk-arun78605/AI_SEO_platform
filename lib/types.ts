// lib/types.ts
// Shared TypeScript types for the dashboard data pipeline.

export interface KpiItem {
  label: string;
  value: string;
  change: string;
  up: boolean;
}

export interface TrafficPoint {
  month: string;   // "Jan" – "Dec"
  organic: number; // total clicks (GSC) or 0 in demo
  paid: number;    // always 0 — GSC does not track paid traffic
}

export interface RankingPoint {
  week: string; // "W1" – "W8"
  avg: number;  // average position (lower is better)
}

export interface KeywordRow {
  name: string;
  vol: number;    // GSC impressions (used as search-volume proxy)
  pos: number;    // average position (rounded)
  change: number; // position change vs previous period (positive = improved)
}

export interface AuditSlice {
  name: "Passed" | "Warnings" | "Failed";
  value: number;
  color: string;
}

export interface ContentItem {
  title: string;   // page path or article title
  score: number;   // 0-100 (PSI performance score or derived)
  status: string;  // "Live", "Published", "Draft", "Review"
  traffic: string; // formatted e.g. "4.2k" or "—"
}

export interface DashboardPayload {
  isDemo: boolean;
  siteUrl: string;
  lastUpdated: string; // ISO 8601
  kpis: KpiItem[];
  trafficData: TrafficPoint[];
  rankingData: RankingPoint[];
  keywordsData: KeywordRow[];
  auditData: AuditSlice[];
  contentItems: ContentItem[];
  yoyChange: string; // e.g. "+312%"
}
