import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const runtime = "nodejs";

const requiredEnv = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "LEADS_TABLE_NAME",
] as const;

function missingEnvVars(): string[] {
  return requiredEnv.filter((name) => !process.env[name]);
}

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const missing = missingEnvVars();
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing server env vars: ${missing.join(", ")}` },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const name = sanitize(input.name);
  const email = sanitize(input.email);
  const phone = sanitize(input.phone);
  const website = sanitize(input.website);

  if (!name || !email || !phone || !website) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  if (!isUrl(website)) {
    return NextResponse.json(
      { error: "Website must be a valid http/https URL" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const leadId = randomUUID();

  const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
  const docClient = DynamoDBDocumentClient.from(ddb, {
    marshallOptions: { removeUndefinedValues: true },
  });

  const item = {
    pk: `LEAD#${leadId}`,
    sk: now,
    leadId,
    name,
    email: email.toLowerCase(),
    phone,
    website,
    source: "homepage-free-audit",
    createdAt: now,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.LEADS_TABLE_NAME,
        Item: item,
      }),
    );

    return NextResponse.json({ ok: true, leadId }, { status: 201 });
  } catch (error) {
    console.error("[/api/leads]", error);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 },
    );
  }
}
