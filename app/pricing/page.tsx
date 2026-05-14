"use client";

import { useState } from "react";
import Link from "next/link";

const NEON = "#00FF41";
const NEON_DIM = "rgba(0,255,65,0.6)";
const NEON_BG  = "rgba(0,255,65,0.07)";
const NEON_BDR = "1px solid rgba(0,255,65,0.3)";
const GOLD     = "#ffaa00";
const SURFACE  = "#0a0a0a";
const SURFACE2 = "#111";

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono','Courier New',monospace" };

const plans = [
  {
    name: "TRIAL",
    price: "$0",
    period: "14 DAYS",
    desc: "Full platform access — evaluate with no commitment",
    badge: null,
    highlight: false,
    accentColor: NEON_DIM,
    features: [
      "All 7 AI modules",
      "1 website project",
      "500 tracked keywords",
      "Weekly scan reports",
      "Community support",
      "No credit card required",
    ],
    cta: "INITIALISE FREE TRIAL",
    ctaHref: "/",
  },
  {
    name: "STARTER",
    price: "$49",
    period: "/ MONTH",
    desc: "For solo founders and small blogs",
    badge: null,
    highlight: false,
    accentColor: NEON_DIM,
    features: [
      "All 7 AI modules",
      "3 website projects",
      "2,000 tracked keywords",
      "Daily rank tracking",
      "Content AI (10 briefs/mo)",
      "Technical audit — weekly",
      "Email support",
    ],
    cta: "ACTIVATE STARTER",
    ctaHref: "/",
  },
  {
    name: "GROWTH",
    price: "$149",
    period: "/ MONTH",
    desc: "For businesses serious about organic traffic",
    badge: "MOST POPULAR",
    highlight: true,
    accentColor: NEON,
    features: [
      "Everything in Starter",
      "10 website projects",
      "Unlimited keywords",
      "Real-time rank tracking",
      "Content AI (50 briefs/mo)",
      "Technical audit — daily",
      "Competitor intelligence",
      "Self-learning engine",
      "Priority support",
      "Full API access",
    ],
    cta: "ACTIVATE GROWTH",
    ctaHref: "/",
  },
  {
    name: "AGENCY",
    price: "$399",
    period: "/ MONTH",
    desc: "For agencies managing multiple clients",
    badge: null,
    highlight: false,
    accentColor: GOLD,
    features: [
      "Everything in Growth",
      "Unlimited projects",
      "White-label reports",
      "Client portal access",
      "Custom AI model training",
      "Dedicated account manager",
      "99.9% SLA guarantee",
      "Custom integrations",
      "Onboarding & training",
    ],
    cta: "CONTACT SALES",
    ctaHref: "/",
  },
];

const comparison = [
  { feature: "AI Modules",           values: ["All 7",  "All 7",  "All 7",      "All 7"]     },
  { feature: "Projects",             values: ["1",      "3",      "10",          "∞"]         },
  { feature: "Keywords",             values: ["500",    "2,000",  "∞",           "∞"]         },
  { feature: "Content Briefs / mo",  values: ["10",     "10",     "50",          "∞"]         },
  { feature: "Technical Audit",      values: ["Weekly", "Weekly", "Daily",       "Real-time"] },
  { feature: "Self-Learning Engine", values: ["—",      "—",      "✓",           "✓"]         },
  { feature: "API Access",           values: ["—",      "—",      "✓",           "✓"]         },
  { feature: "White-label Reports",  values: ["—",      "—",      "—",           "✓"]         },
  { feature: "Custom AI Training",   values: ["—",      "—",      "—",           "✓"]         },
  { feature: "SLA Guarantee",        values: ["—",      "—",      "—",           "99.9%"]     },
];

const faqs = [
  { q: "HOW DOES THE 14-DAY TRIAL WORK?",     a: "You get full access to all 7 AI modules for 14 days. No credit card required. After the trial your account pauses — all data is preserved for 30 days." },
  { q: "CAN I CHANGE PLANS AT ANY TIME?",      a: "Yes. Upgrade takes effect immediately. Downgrades apply at the end of your billing cycle. No cancellation fees." },
  { q: "WHAT COUNTS AS A 'KEYWORD'?",         a: "Any search term you actively track in the rank monitoring dashboard. Keyword research and discovery queries do not count against your limit." },
  { q: "IS MY DATA SECURE?",                  a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). GDPR and CCPA compliant. We never share your data with third parties." },
  { q: "WHAT INTEGRATIONS ARE SUPPORTED?",   a: "GA4, Google Search Console, Ahrefs, SEMrush, Moz, WordPress, Shopify, Webflow, HubSpot, and any CMS via the REST API." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", ...mono, paddingTop: 80, paddingBottom: 80 }}>

      {/* ── HEADER ────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 56px", textAlign: "center" }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: NEON_DIM, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ display: "inline-block", width: 40, height: 1, background: NEON_DIM }} />
          PRICING MATRIX v2.4
          <span style={{ display: "inline-block", width: 40, height: 1, background: NEON_DIM }} />
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em" }}>
          INVEST IN{" "}
          <span style={{ color: NEON, textShadow: `0 0 20px ${NEON}` }}>
            GROWTH
          </span>
          {" "}— NOT AGENCIES
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 28px", letterSpacing: "0.04em" }}>
          Replace a $15,000/month SEO agency with an AI system that runs 24/7.
          Start free — no credit card required.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: NEON_BDR, padding: "6px 16px", fontSize: "0.65rem", letterSpacing: "0.2em", color: NEON_DIM }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: NEON, boxShadow: `0 0 6px ${NEON}` }} />
          ALL PLANS INCLUDE 14-DAY FREE TRIAL
        </div>
      </div>

      {/* ── PLANS ─────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 72px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 2 }}>
        {plans.map((plan, pi) => (
          <div key={plan.name} style={{ position: "relative" }}>
            {plan.badge && (
              <div style={{ position: "absolute", top: -1, left: 0, right: 0, zIndex: 2, display: "flex", justifyContent: "center" }}>
                <div style={{ background: NEON, color: "#000", fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.2em", padding: "4px 14px" }}>
                  ★ {plan.badge}
                </div>
              </div>
            )}
            <div style={{
              height: "100%",
              background: plan.highlight ? "rgba(0,255,65,0.04)" : SURFACE,
              border: plan.highlight ? `2px solid ${NEON}` : "1px solid rgba(255,255,255,0.07)",
              padding: "28px 24px 24px",
              display: "flex",
              flexDirection: "column",
              boxShadow: plan.highlight ? `0 0 40px rgba(0,255,65,0.1), inset 0 0 40px rgba(0,255,65,0.02)` : "none",
              marginTop: plan.badge ? 18 : 0,
            }}>
              {/* Plan name */}
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: plan.accentColor, marginBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.05)`, paddingBottom: 14 }}>
                {plan.name} ──────
              </div>

              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: "2.8rem", fontWeight: 900, color: plan.highlight ? NEON : "#fff", lineHeight: 1, textShadow: plan.highlight ? `0 0 30px rgba(0,255,65,0.5)` : "none" }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", paddingBottom: 6, letterSpacing: "0.1em" }}>
                    {plan.period}
                  </span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 6, letterSpacing: "0.04em", lineHeight: 1.5 }}>{plan.desc}</p>
              </div>

              {/* Features */}
              <ul style={{ flex: 1, listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", letterSpacing: "0.03em", lineHeight: 1.5 }}>
                    <span style={{ color: plan.accentColor, flexShrink: 0 }}>▸</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.ctaHref} style={{
                display: "block", textAlign: "center", padding: "12px",
                fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.2em",
                textDecoration: "none", transition: "all 0.2s",
                ...(plan.highlight
                  ? { background: NEON, color: "#000", boxShadow: `0 0 20px rgba(0,255,65,0.4)` }
                  : plan.accentColor === GOLD
                  ? { background: "transparent", border: `1px solid ${GOLD}`, color: GOLD }
                  : { background: "transparent", border: NEON_BDR, color: NEON_DIM }
                ),
              }}>
                {plan.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── COMPARISON TABLE ──────────────────────── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: NEON_DIM, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "inline-block", width: 24, height: 1, background: NEON_DIM }} />
          FEATURE MATRIX
        </div>
        <div style={{ border: NEON_BDR, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", background: SURFACE2, borderBottom: NEON_BDR }}>
            <div style={{ padding: "12px 16px", fontSize: "0.6rem", letterSpacing: "0.2em", color: NEON_DIM }}>FEATURE</div>
            {plans.map(p => (
              <div key={p.name} style={{ padding: "12px 8px", fontSize: "0.6rem", letterSpacing: "0.15em", color: p.highlight ? NEON : "rgba(255,255,255,0.3)", textAlign: "center" }}>{p.name}</div>
            ))}
          </div>
          {/* Rows */}
          {comparison.map((row, ri) => (
            <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderBottom: ri < comparison.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ padding: "11px 16px", fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.03em" }}>{row.feature}</div>
              {row.values.map((val, j) => (
                <div key={j} style={{ padding: "11px 8px", textAlign: "center", fontSize: "0.72rem", color: val === "—" ? "rgba(255,255,255,0.15)" : plans[j].highlight ? NEON : "rgba(255,255,255,0.6)", fontWeight: val === "✓" || plans[j].highlight ? 700 : 400 }}>
                  {val}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQs ──────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: NEON_DIM, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "inline-block", width: 24, height: 1, background: NEON_DIM }} />
          FREQUENTLY ASKED
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((faq, i) => (
            <div key={faq.q} style={{ border: "1px solid rgba(255,255,255,0.07)", background: SURFACE }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ ...mono, fontSize: "0.7rem", letterSpacing: "0.1em", color: openFaq === i ? NEON : "rgba(255,255,255,0.7)", fontWeight: 700 }}>
                  {faq.q}
                </span>
                <span style={{ color: NEON_DIM, fontSize: "0.9rem", marginLeft: 12, flexShrink: 0 }}>
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 16px", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, letterSpacing: "0.03em", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ paddingTop: 14 }}>{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ────────────────────────────── */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ border: NEON_BDR, padding: "40px 32px", background: NEON_BG }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: NEON_DIM, marginBottom: 16 }}>READY TO START?</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: NEON, textShadow: `0 0 30px rgba(0,255,65,0.4)`, marginBottom: 12 }}>
            14 DAYS FREE. NO CARD.
          </h2>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: 24, lineHeight: 1.7, letterSpacing: "0.04em" }}>
            Start your free trial and see real data from your website in minutes.
          </p>
          <Link href="/" style={{ display: "inline-block", background: NEON, color: "#000", padding: "14px 32px", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.2em", textDecoration: "none", boxShadow: `0 0 30px rgba(0,255,65,0.4)` }}>
            INITIALISE FREE TRIAL →
          </Link>
        </div>
      </div>

    </div>
  );
}
