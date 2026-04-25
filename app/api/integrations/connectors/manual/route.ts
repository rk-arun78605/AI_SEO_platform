import { NextResponse } from "next/server";
import { upsertConnector } from "@/lib/integration-store";

export const runtime = "nodejs";

type Body = {
  userId: string;
  provider: "gsc" | "ga4" | "meta" | "youtube";
  secretKey: string;
  accountLabel?: string;
};

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hintFromSecret(secret: string): string {
  const clean = secret.replace(/\s+/g, "");
  if (clean.length <= 8) return "provided";
  return `••••${clean.slice(-4)}`;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const userId = sanitize(body.userId).toLowerCase();
  const provider = sanitize(body.provider) as Body["provider"];
  const secretKey = sanitize(body.secretKey);
  const accountLabel = sanitize(body.accountLabel);

  if (!userId || !provider || !secretKey) {
    return NextResponse.json(
      { ok: false, error: "userId, provider and secretKey are required" },
      { status: 400 },
    );
  }

  if (!["gsc", "ga4", "meta", "youtube"].includes(provider)) {
    return NextResponse.json({ ok: false, error: "Invalid provider" }, { status: 400 });
  }

  try {
    await upsertConnector({
      userId,
      provider,
      connected: true,
      authMode: "secret-key",
      connectedAt: new Date().toISOString(),
      accountLabel: accountLabel || "Manual Secret Key",
      credentialHint: hintFromSecret(secretKey),
    });

    return NextResponse.json({ ok: true, message: `${provider} connected with secret key` });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to save connector" },
      { status: 500 },
    );
  }
}
