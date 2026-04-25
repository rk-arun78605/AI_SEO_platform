// lib/gsc.ts
// Google Search Console API client using service-account JWT authentication.
// No external dependencies — uses the Web Crypto API available in Next.js 14+.
//
// Required env vars:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GSC_BASE  = "https://www.googleapis.com/webmasters/v3";
const SCOPE     = "https://www.googleapis.com/auth/webmasters";

// ── Helpers ──────────────────────────────────────────────────────

function strToBase64Url(str: string): string {
  // Works in both Node.js and Edge runtimes
  return Buffer.from(str).toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function bufToBase64Url(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function buildJWT(clientEmail: string, privateKeyPem: string): Promise<string> {
  const header  = strToBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now     = Math.floor(Date.now() / 1000);
  const payload = strToBase64Url(JSON.stringify({
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));

  const unsigned = `${header}.${payload}`;

  // Normalise PEM — env vars sometimes store \n as literal backslash-n
  const pem = privateKeyPem.replace(/\\n/g, "\n");
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const der = Buffer.from(b64, "base64");

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(unsigned),
  );

  return `${unsigned}.${bufToBase64Url(sig)}`;
}

// ── Token cache (module-level; invalidated when process restarts) ─

let _cache: { token: string; exp: number } | null = null;

export async function getAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !key || key === "placeholder") return null;

  const now = Date.now() / 1000;
  if (_cache && _cache.exp > now + 60) return _cache.token;

  try {
    const jwt = await buildJWT(email, key);
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.access_token) return null;
    _cache = { token: data.access_token, exp: now + (data.expires_in ?? 3600) };
    return data.access_token;
  } catch {
    return null;
  }
}

// ── Types ─────────────────────────────────────────────────────────

export interface SearchAnalyticsRequest {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
  orderBy?: { fieldName: string; sortOrder: "ASCENDING" | "DESCENDING" }[];
}

export interface SearchRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchAnalyticsResponse {
  rows?: SearchRow[];
}

// ── API call ──────────────────────────────────────────────────────

export async function searchAnalytics(
  token: string,
  siteUrl: string,
  body: SearchAnalyticsRequest,
): Promise<SearchAnalyticsResponse> {
  const encoded = encodeURIComponent(siteUrl);
  const res = await fetch(`${GSC_BASE}/sites/${encoded}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    // Cache individual GSC responses for 1 hour in Next.js data cache
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GSC ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

export async function submitSitemap(
  token: string,
  siteUrl: string,
  sitemapUrl: string,
): Promise<void> {
  const encodedSite = encodeURIComponent(siteUrl);
  const encodedMap = encodeURIComponent(sitemapUrl);

  const res = await fetch(`${GSC_BASE}/sites/${encodedSite}/sitemaps/${encodedMap}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sitemap submit failed ${res.status}: ${text.slice(0, 300)}`);
  }
}
