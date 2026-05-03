import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getDocClient, requireEnv } from "@/lib/dynamo";

export interface ScanSnapshot {
  userId: string;
  siteUrl: string;
  kpis: {
    technical: number;
    functional: number;
    user: number;
    seo: number;
    overall: number;
  };
  topKeywords: string[];
  modelSource: string;
  createdAt?: string;
}

function tableName(): string {
  return requireEnv("SCAN_HISTORY_TABLE_NAME");
}

function siteKey(url: string): string {
  return url.replace(/\/$/, "").toLowerCase();
}

export async function getLatestSnapshot(userId: string, siteUrl: string): Promise<ScanSnapshot | null> {
  const doc = getDocClient();
  const result = await doc.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}#SITE#${siteKey(siteUrl)}`,
      },
      ScanIndexForward: false,
      Limit: 1,
    }),
  );

  const item = result.Items?.[0];
  if (!item) return null;

  return {
    userId,
    siteUrl,
    kpis: item.kpis,
    topKeywords: item.topKeywords ?? [],
    modelSource: item.modelSource ?? "unknown",
    createdAt: item.createdAt,
  };
}

export async function saveSnapshot(snapshot: ScanSnapshot): Promise<void> {
  const doc = getDocClient();
  const createdAt = snapshot.createdAt ?? new Date().toISOString();
  await doc.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        pk: `USER#${snapshot.userId}#SITE#${siteKey(snapshot.siteUrl)}`,
        sk: createdAt,
        createdAt,
        siteUrl: snapshot.siteUrl,
        modelSource: snapshot.modelSource,
        kpis: snapshot.kpis,
        topKeywords: snapshot.topKeywords,
      },
    }),
  );
}

export async function listRecentSnapshots(
  userId: string,
  siteUrl: string,
  limit = 25,
): Promise<ScanSnapshot[]> {
  const doc = getDocClient();
  const result = await doc.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}#SITE#${siteKey(siteUrl)}`,
      },
      ScanIndexForward: false,
      Limit: Math.max(1, Math.min(limit, 100)),
    }),
  );

  return (result.Items ?? []).map((item) => ({
    userId,
    siteUrl,
    kpis: item.kpis,
    topKeywords: item.topKeywords ?? [],
    modelSource: item.modelSource ?? "unknown",
    createdAt: item.createdAt,
  }));
}
