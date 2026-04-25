import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getDocClient, requireEnv } from "@/lib/dynamo";

export type ConnectorProvider = "gsc" | "ga4" | "meta" | "youtube";

export interface ConnectorRecord {
  userId: string;
  provider: ConnectorProvider;
  connected: boolean;
  connectedAt?: string;
  accountLabel?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

function tableName(): string {
  return requireEnv("CONNECTORS_TABLE_NAME");
}

export async function getConnector(userId: string, provider: ConnectorProvider): Promise<ConnectorRecord | null> {
  const doc = getDocClient();
  const result = await doc.send(
    new GetCommand({
      TableName: tableName(),
      Key: {
        pk: `USER#${userId}`,
        sk: `CONNECTOR#${provider}`,
      },
    }),
  );

  if (!result.Item) return null;
  return {
    userId,
    provider,
    connected: Boolean(result.Item.connected),
    connectedAt: result.Item.connectedAt,
    accountLabel: result.Item.accountLabel,
    accessToken: result.Item.accessToken,
    refreshToken: result.Item.refreshToken,
    expiresAt: result.Item.expiresAt,
  };
}

export async function upsertConnector(record: ConnectorRecord): Promise<void> {
  const doc = getDocClient();
  await doc.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        pk: `USER#${record.userId}`,
        sk: `CONNECTOR#${record.provider}`,
        provider: record.provider,
        connected: record.connected,
        connectedAt: record.connectedAt ?? new Date().toISOString(),
        accountLabel: record.accountLabel,
        accessToken: record.accessToken,
        refreshToken: record.refreshToken,
        expiresAt: record.expiresAt,
      },
    }),
  );
}
