import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const runtime = "nodejs";

function missingEnvVars(): string[] {
  if (process.env.LEADS_TABLE_NAME && !process.env.AWS_REGION) {
    return ["AWS_REGION"];
  }
  return [];
}

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
  "getnada.com",
  "maildrop.cc",
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

function normalizePhone(value: string): string {
  return value.replace(/[^0-9+]/g, "");
}

function isJunkPhone(value: string): boolean {
  const phone = normalizePhone(value).replace(/^\+/, "");
  if (phone.length < 8 || phone.length > 15) return true;
  if (/^(\d)\1{7,14}$/.test(phone)) return true;

  const ascending = "0123456789";
  const descending = "9876543210";
  if (ascending.includes(phone) || descending.includes(phone)) return true;

  return false;
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

  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "Disposable email domains are not allowed" },
      { status: 400 },
    );
  }

  if (isJunkPhone(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid mobile number" },
      { status: 400 },
    );
  }

  if (!isUrl(website)) {
    return NextResponse.json(
      { error: "Website must be a valid http/https URL" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const leadId = randomUUID();

  if (!process.env.LEADS_TABLE_NAME) {
    console.warn("[/api/leads] LEADS_TABLE_NAME is not configured; accepting lead without persistence");
    return NextResponse.json(
      {
        ok: true,
        leadId,
        persisted: false,
        warning: "Lead storage is not configured",
      },
      { status: 202 },
    );
  }

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
    phone: normalizePhone(phone),
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

    const awsErrorName =
      typeof error === "object" && error !== null && "name" in error
        ? String((error as { name?: unknown }).name)
        : "";

    if (awsErrorName === "ResourceNotFoundException") {
      return NextResponse.json(
        {
          ok: true,
          leadId,
          persisted: false,
          warning: "Lead table not found",
        },
        { status: 202 },
      );
    }

    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 },
    );
  }
}
