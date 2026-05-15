import { NextResponse } from "next/server";
import { createOtp } from "../../../../lib/otp-store";
import { sendOtpEmail } from "../../../../lib/email";

export const runtime = "nodejs";

const OTP_EXPIRES_MINUTES = 10;

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

  const email      = sanitize(body.email).toLowerCase();
  const website    = sanitize(body.website);
  const websiteHost = hostFromWebsite(website);

  if (!email || !websiteHost) {
    return NextResponse.json({ error: "email and website are required" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const { otp, expiresAt } = createOtp(email, websiteHost);

  // Send OTP via email
  const { sent, error: emailError } = await sendOtpEmail(email, otp, OTP_EXPIRES_MINUTES);

  if (!sent) {
    console.warn(`[OTP] Email not sent to ${email}: ${emailError}`);
    // In dev/non-configured env, still allow login by returning OTP in response
    if (!process.env.SMTP_HOST) {
      return NextResponse.json({
        ok: true,
        websiteHost,
        expiresAt: new Date(expiresAt).toISOString(),
        warning: "SMTP not configured — OTP shown here for testing only",
        otpPreview: otp,
      });
    }
    // SMTP configured but send failed — return error
    return NextResponse.json(
      { error: `Failed to send OTP email: ${emailError}` },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    websiteHost,
    expiresAt: new Date(expiresAt).toISOString(),
    message: `OTP sent to ${email}. Check your inbox.`,
  });
}
