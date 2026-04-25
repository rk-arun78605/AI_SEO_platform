import { NextResponse } from "next/server";
import { upsertConnector } from "@/lib/integration-store";

export const runtime = "nodejs";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code") ?? "";
  const stateRaw = requestUrl.searchParams.get("state") ?? "";

  if (!code || !stateRaw) {
    return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
  }

  let state: { provider: "gsc" | "ga4" | "youtube"; userId: string; t: number };
  try {
    state = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf-8"));
  } catch {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  let tokenData: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  try {
    const body = new URLSearchParams({
      code,
      client_id: required("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: required("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: required("GOOGLE_OAUTH_REDIRECT_URI"),
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    tokenData = (await tokenRes.json()) as typeof tokenData;
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.json({ error: "Token exchange failed", detail: tokenData }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "OAuth exchange failed" }, { status: 500 });
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : undefined;

  await upsertConnector({
    userId: state.userId,
    provider: state.provider,
    connected: true,
    connectedAt: new Date().toISOString(),
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    accountLabel: "Google Account",
  });

  const redirectUrl = new URL("/", requestUrl.origin);
  redirectUrl.searchParams.set("connected", state.provider);
  return NextResponse.redirect(redirectUrl.toString());
}
