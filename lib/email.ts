/**
 * lib/email.ts — SMTP email sender using nodemailer
 *
 * Required env vars (set in cPanel → Setup Node.js App → Environment Variables):
 *   SMTP_HOST   — mail server hostname  e.g. mail.indraseo.com  or  smtp.gmail.com
 *   SMTP_PORT   — 465 (SSL) | 587 (TLS/STARTTLS) | 25 (plain, no auth)
 *   SMTP_USER   — sender email address  e.g. noreply@indraseo.com
 *   SMTP_PASS   — email account password
 *   FROM_EMAIL  — "From" display  e.g. "IndraSEO <noreply@indraseo.com>"
 *
 * If SMTP_HOST is not set the function logs the OTP to console (dev fallback).
 */

import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,          // true for SSL/465, false for STARTTLS/587
    auth: user && pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized: false },
  });
}

function otpEmailHtml(otp: string, email: string, expiresMinutes = 10): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Courier New',monospace;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 20px;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid rgba(0,255,65,0.35);max-width:480px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#000;padding:20px 28px;border-bottom:2px solid #00FF41;">
    <div style="color:#00FF41;font-weight:700;font-size:1.1rem;letter-spacing:0.1em;text-shadow:0 0 10px #00FF41;">
      NEURAL SEO — INDRA
    </div>
    <div style="color:rgba(0,255,65,0.5);font-size:0.6rem;letter-spacing:0.15em;margin-top:3px;">
      AI ANALYSIS ENGINE — AUTHENTICATION
    </div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px 28px;">
    <p style="color:rgba(255,255,255,0.6);font-size:0.8rem;line-height:1.7;margin-top:0;">
      Authentication request received for <strong style="color:#fff;">${email}</strong>.<br>
      Use the code below to complete your sign-in.
    </p>

    <!-- OTP Box -->
    <div style="text-align:center;margin:28px 0;">
      <div style="background:#000;border:2px solid #00FF41;display:inline-block;padding:18px 36px;
                  box-shadow:0 0 20px rgba(0,255,65,0.3);">
        <div style="font-size:2.4rem;font-weight:900;letter-spacing:0.3em;color:#00FF41;
                    text-shadow:0 0 20px rgba(0,255,65,0.6);">${otp}</div>
        <div style="font-size:0.6rem;color:rgba(0,255,65,0.5);letter-spacing:0.2em;margin-top:6px;">
          ONE-TIME PASSWORD
        </div>
      </div>
    </div>

    <p style="color:rgba(255,255,255,0.4);font-size:0.72rem;text-align:center;line-height:1.6;">
      This code expires in <strong style="color:rgba(255,255,255,0.7);">${expiresMinutes} minutes</strong>.<br>
      If you did not request this, ignore this email.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 28px;border-top:1px solid rgba(0,255,65,0.15);text-align:center;">
    <div style="color:rgba(255,255,255,0.2);font-size:0.6rem;letter-spacing:0.1em;">
      © 2026 INDRA SEO LABS &bull; AUTO-GENERATED &bull; DO NOT REPLY
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  expiresMinutes = 10,
): Promise<{ sent: boolean; error?: string }> {
  const transport = getTransport();

  if (!transport) {
    // Dev fallback — log to console when SMTP not configured
    console.warn(`[IndraSEO OTP] No SMTP configured. OTP for ${toEmail}: ${otp}`);
    return { sent: false, error: "SMTP not configured — OTP logged to server console" };
  }

  const from = process.env.FROM_EMAIL?.trim() || process.env.SMTP_USER?.trim() || "noreply@indraseo.com";

  try {
    await transport.sendMail({
      from,
      to:      toEmail,
      subject: `IndraSEO — Your verification code: ${otp}`,
      html:    otpEmailHtml(otp, toEmail, expiresMinutes),
      text:    `Your IndraSEO verification code is: ${otp}\n\nExpires in ${expiresMinutes} minutes.`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[IndraSEO OTP email error]", err);
    return { sent: false, error: String(err) };
  }
}
