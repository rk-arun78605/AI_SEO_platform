import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const runtime = "nodejs";

type FeedbackBody = {
  siteUrl: string;
  modelSource: "aws-bedrock" | "heuristic";
  kpis: {
    technical: number;
    functional: number;
    user: number;
    seo: number;
    overall: number;
  };
  userRating: number;
  acceptedRecommendations?: string[];
  notes?: string;
};

function envReady(): boolean {
  return Boolean(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.MODEL_FEEDBACK_TABLE_NAME,
  );
}

export async function POST(request: Request) {
  if (!envReady()) {
    return NextResponse.json(
      { error: "Feedback storage is not configured" },
      { status: 500 },
    );
  }

  let body: FeedbackBody;
  try {
    body = (await request.json()) as FeedbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.siteUrl || !body.kpis || !body.modelSource || !body.userRating) {
    return NextResponse.json(
      { error: "siteUrl, modelSource, kpis and userRating are required" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const feedbackId = randomUUID();

  const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: process.env.AWS_REGION }),
    { marshallOptions: { removeUndefinedValues: true } },
  );

  const item = {
    pk: `FEEDBACK#${feedbackId}`,
    sk: now,
    feedbackId,
    siteUrl: body.siteUrl,
    modelSource: body.modelSource,
    kpis: body.kpis,
    userRating: body.userRating,
    acceptedRecommendations: body.acceptedRecommendations ?? [],
    notes: body.notes ?? "",
    createdAt: now,
  };

  try {
    await client.send(
      new PutCommand({
        TableName: process.env.MODEL_FEEDBACK_TABLE_NAME,
        Item: item,
      }),
    );

    return NextResponse.json({ ok: true, feedbackId }, { status: 201 });
  } catch (error) {
    console.error("[/api/model-feedback]", error);
    return NextResponse.json({ error: "Failed to store model feedback" }, { status: 500 });
  }
}
