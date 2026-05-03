import { createHmac, timingSafeEqual } from "node:crypto";

type SessionPayload = {
  email: string;
  websiteHost: string;
  exp: number;
};

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.OTP_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "local-dev-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionToken(email: string, websiteHost: string, ttlMs = DEFAULT_TTL_MS): string {
  const payload: SessionPayload = {
    email: email.toLowerCase(),
    websiteHost: websiteHost.toLowerCase(),
    exp: Date.now() + ttlMs,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  const expected = sign(encoded);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as SessionPayload;
    if (!payload.email || !payload.websiteHost || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
