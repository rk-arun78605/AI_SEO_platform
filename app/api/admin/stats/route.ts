import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("x-admin-secret") ?? request.nextUrl.searchParams.get("secret") ?? "";
  return auth === secret;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Pull leads from DynamoDB
  let leads: unknown[] = [];
  let scans: unknown[] = [];
  try {
    const { DynamoDBClient, ScanCommand } = await import("@aws-sdk/client-dynamodb");
    const { unmarshall } = await import("@aws-sdk/util-dynamodb");
    const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

    // Leads table
    try {
      const leadsRes = await client.send(new ScanCommand({ TableName: "indraseo-leads", Limit: 200 }));
      leads = (leadsRes.Items ?? []).map(i => unmarshall(i));
    } catch { leads = []; }

    // Scan history table
    try {
      const scansRes = await client.send(new ScanCommand({ TableName: "indraseo-scan-history", Limit: 500 }));
      scans = (scansRes.Items ?? []).map(i => unmarshall(i));
    } catch { scans = []; }

  } catch { /* DynamoDB not available — return empty */ }

  // Compute basic stats
  const uniqueUsers   = new Set((scans as Array<{userId?:string}>).map(s => s.userId).filter(Boolean)).size;
  const totalScans    = scans.length;
  const totalLeads    = leads.length;
  const recentLeads   = (leads as Array<{submittedAt?:string; createdAt?:string}>)
    .sort((a,b) => new Date(b.submittedAt ?? b.createdAt ?? 0).getTime() - new Date(a.submittedAt ?? a.createdAt ?? 0).getTime())
    .slice(0, 50);
  const recentScans   = (scans as Array<{createdAt?:string}>)
    .sort((a,b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 50);

  return NextResponse.json({ ok: true, stats: { totalLeads, totalScans, uniqueUsers }, leads: recentLeads, scans: recentScans });
}
