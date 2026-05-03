import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";
import { createSessionToken } from "@/lib/otp-session";

export const runtime = "nodejs";

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hostFromWebsite(url: string): string | null {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: { email?: string; website?: string; otp?: string };
  try {
    body = (await request.json()) as { email?: string; website?: string; otp?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = sanitize(body.email).toLowerCase();
  const website = sanitize(body.website);
  const otp = sanitize(body.otp);
  const websiteHost = hostFromWebsite(website);

  if (!email || !websiteHost || !otp) {
    return NextResponse.json({ error: "email, website and otp are required" }, { status: 400 });
  }

  const result = verifyOtp(email, websiteHost, otp);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason ?? "OTP verification failed" }, { status: 400 });
  }

  const sessionToken = createSessionToken(email, websiteHost);
  return NextResponse.json({
    ok: true,
    sessionToken,
    websiteHost,
    expiresInHours: 168,
  });
}
