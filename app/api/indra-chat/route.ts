import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY not set. Add it in cPanel → Setup Node.js App → Environment Variables." },
      { status: 503 },
    );
  }

  let body: { message?: string; context?: Record<string, unknown>; history?: Array<{role:string;content:string}> };
  try { body = await request.json(); }
  catch { return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 }); }

  const { message = "", context = {}, history = [] } = body;
  if (!message.trim()) return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 });

  const ctxLines: string[] = [];
  if (context.siteUrl)       ctxLines.push(`Website: ${context.siteUrl}`);
  if (context.primaryTopic)  ctxLines.push(`Primary topic: ${context.primaryTopic}`);
  if (context.topKeywords)   ctxLines.push(`Top keywords: ${(context.topKeywords as string[]).slice(0,6).join(", ")}`);
  if (context.kpis) {
    const k = context.kpis as Record<string,number>;
    ctxLines.push(`Scores — Technical: ${k.technical}/100 | SEO: ${k.seo}/100 | UX: ${k.user}/100 | Overall: ${k.overall}/100`);
  }
  if (context.issues) ctxLines.push(`Issues found: ${(context.issues as unknown[]).length}`);
  if (context.summary) ctxLines.push(`AI Summary: ${context.summary}`);

  const systemPrompt = `You are INDRA — an elite AI SEO analyst with 20 years of experience built into the IndraSEO platform.

${ctxLines.length ? `CURRENT SCAN DATA:\n${ctxLines.join("\n")}` : "No scan data yet. Encourage the user to scan their website."}

YOUR PERSONALITY:
- Direct and precise — no fluff, no padding
- Translate all SEO jargon into plain English
- Always reference the user's actual scan data when available
- End every response with one clear, specific action the user can take right now
- Use the terminal/cyberpunk tone of the platform — sharp, technical, confident
- Keep responses under 150 words unless the user asks for detail

NEVER say "I cannot", "As an AI", or give generic advice that ignores the scan data.`;

  // Build messages array with history
  const messages = [
    ...history.slice(-8).map((h) => ({ role: h.role as "user"|"assistant", content: h.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":    "application/json",
        "x-api-key":       apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system:     systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ ok: false, error: `Anthropic API error: ${errText}` }, { status: 500 });
    }

    const data = await res.json() as { content?: Array<{text:string}> };
    const reply = data.content?.[0]?.text?.trim() ?? "";
    return NextResponse.json({ ok: true, reply });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
