import { NextResponse } from "next/server";
import { getConnector } from "@/lib/integration-store";

export const runtime = "nodejs";

type Connector = {
  id: "gsc" | "ga4" | "meta" | "youtube";
  label: string;
  connected: boolean;
  description: string;
  connectUrl: string;
  note?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = (url.searchParams.get("userId") ?? "").trim().toLowerCase();
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const [gscRecord, ga4Record, metaRecord, youtubeRecord] = await Promise.all([
    getConnector(userId, "gsc").catch(() => null),
    getConnector(userId, "ga4").catch(() => null),
    getConnector(userId, "meta").catch(() => null),
    getConnector(userId, "youtube").catch(() => null),
  ]);

  const connectors: Connector[] = [
    {
      id: "gsc",
      label: "Google Search Console",
      connected: Boolean(gscRecord?.connected),
      description: "Search query performance, indexing coverage, and sitemap submission.",
      connectUrl: `/api/integrations/google/start?provider=gsc&userId=${encodeURIComponent(userId)}`,
      note: gscRecord?.connected ? `Connected at ${gscRecord.connectedAt ?? "unknown time"}` : "Connect your Google account for real property-level data.",
    },
    {
      id: "ga4",
      label: "Google Analytics 4",
      connected: Boolean(ga4Record?.connected),
      description: "User engagement, conversions, and channel attribution.",
      connectUrl: `/api/integrations/google/start?provider=ga4&userId=${encodeURIComponent(userId)}`,
      note: ga4Record?.connected ? `Connected at ${ga4Record.connectedAt ?? "unknown time"}` : "Connect your Google account to map GA4 properties.",
    },
    {
      id: "meta",
      label: "Meta / Facebook",
      connected: Boolean(metaRecord?.connected),
      description: "Facebook/Instagram campaign traffic and paid-social ROI signals.",
      connectUrl: "https://developers.facebook.com/docs/marketing-api",
      note: metaRecord?.connected ? `Connected at ${metaRecord.connectedAt ?? "unknown time"}` : "Meta OAuth connector can be added in next step.",
    },
    {
      id: "youtube",
      label: "YouTube Analytics",
      connected: Boolean(youtubeRecord?.connected),
      description: "Video-driven demand signals and organic assist journeys.",
      connectUrl: `/api/integrations/google/start?provider=youtube&userId=${encodeURIComponent(userId)}`,
      note: youtubeRecord?.connected ? `Connected at ${youtubeRecord.connectedAt ?? "unknown time"}` : "Connect your Google account to link YouTube analytics.",
    },
  ];

  return NextResponse.json({
    connectedCount: connectors.filter((c) => c.connected).length,
    total: connectors.length,
    connectors,
  });
}
