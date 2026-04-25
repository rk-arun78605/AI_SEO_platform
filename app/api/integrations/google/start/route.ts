import { NextResponse } from "next/server";

export const runtime = "nodejs";

const scopesByProvider: Record<string, string[]> = {
  gsc: ["https://www.googleapis.com/auth/webmasters"],
  ga4: ["https://www.googleapis.com/auth/analytics.readonly"],
  youtube: ["https://www.googleapis.com/auth/yt-analytics.readonly"],
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = (url.searchParams.get("provider") ?? "").trim().toLowerCase();
  const userId = (url.searchParams.get("userId") ?? "").trim().toLowerCase();

  if (!provider || !scopesByProvider[provider]) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  let clientId: string;
  let redirectUri: string;
  try {
    clientId = required("GOOGLE_OAUTH_CLIENT_ID");
    redirectUri = required("GOOGLE_OAUTH_REDIRECT_URI");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "OAuth config missing" }, { status: 500 });
  }

  const state = Buffer.from(JSON.stringify({ provider, userId, t: Date.now() })).toString("base64url");
  const scope = scopesByProvider[provider].join(" ");
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
