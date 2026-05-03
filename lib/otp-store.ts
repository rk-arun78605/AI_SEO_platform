import { createHash, randomInt } from "node:crypto";

type OtpRecord = {
  otpHash: string;
  expiresAt: number;
  attempts: number;
};

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const store = new Map<string, OtpRecord>();

function key(email: string, websiteHost: string): string {
  return `${email.toLowerCase()}::${websiteHost.toLowerCase()}`;
}

function hashOtp(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createOtp(email: string, websiteHost: string): { otp: string; expiresAt: number } {
  const otp = String(randomInt(100000, 999999));
  const expiresAt = Date.now() + OTP_TTL_MS;
  store.set(key(email, websiteHost), {
    otpHash: hashOtp(otp),
    expiresAt,
    attempts: 0,
  });
  return { otp, expiresAt };
}

export function verifyOtp(email: string, websiteHost: string, otp: string): { ok: boolean; reason?: string } {
  const k = key(email, websiteHost);
  const record = store.get(k);
  if (!record) return { ok: false, reason: "OTP not requested" };
  if (Date.now() > record.expiresAt) {
    store.delete(k);
    return { ok: false, reason: "OTP expired" };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(k);
    return { ok: false, reason: "Too many attempts" };
  }

  record.attempts += 1;
  if (record.otpHash !== hashOtp(otp)) {
    store.set(k, record);
    return { ok: false, reason: "Invalid OTP" };
  }

  store.delete(k);
  return { ok: true };
}
