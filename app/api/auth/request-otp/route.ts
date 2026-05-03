import { NextResponse } from "next/server";
import { createOtp } from "@/lib/otp-store";

export const runtime = "nodejs";

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  let body: { email?: string; website?: string };
  try {
    body = (await request.json()) as { email?: string; website?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = sanitize(body.email).toLowerCase();
  const website = sanitize(body.website);
  const websiteHost = hostFromWebsite(website);

  if (!email || !websiteHost) {
    return NextResponse.json({ error: "email and website are required" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const { otp, expiresAt } = createOtp(email, websiteHost);

  // NOTE: Integrate with email provider (SES/SendGrid) to deliver OTP in production.
  // For now, OTP preview is returned only outside production for testing.
  return NextResponse.json({
    ok: true,
    websiteHost,
    expiresAt: new Date(expiresAt).toISOString(),
    ...(process.env.NODE_ENV !== "production" ? { otpPreview: otp } : {}),
  });
}
