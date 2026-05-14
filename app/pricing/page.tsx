"use client";

import Link from "next/link";

const plans = [
  {
    name: "Trial",
    price: "$0",
    period: "14 days",
    desc: "Full platform access — no credit card required",
    badge: null,
    highlight: false,
    features: [
      "All 7 AI modules",
      "1 website project",
      "Up to 500 keywords",
      "Weekly reports",
      "Community support",
    ],
    cta: "Start Free Trial",
    ctaHref: "/",
  },
  {
    name: "Starter",
    price: "$49",
    period: "/ month",
    desc: "For solo founders and small blogs",
    badge: null,
    highlight: false,
    features: [
      "All 7 AI modules",
      "3 website projects",
      "Up to 2,000 keywords",
      "Daily rank tracking",
      "Content AI (10 briefs/mo)",
      "Technical audit (weekly)",
      "Email support",
    ],
    cta: "Get Started",
    ctaHref: "/",
  },
  {
    name: "Growth",
    price: "$149",
    period: "/ month",
    desc: "For businesses serious about SEO",
    badge: "Most Popular",
    highlight: true,
    features: [
      "Everything in Starter",
      "10 website projects",
      "Unlimited keywords",
      "Real-time rank tracking",
      "Content AI (50 briefs/mo)",
      "Technical audit (daily)",
      "Competitor intelligence",
      "Self-learning engine",
      "Priority support",
      "API access",
    ],
    cta: "Start Growth",
    ctaHref: "/",
  },
  {
    name: "Agency",
    price: "$399",
    period: "/ month",
    desc: "For agencies managing multiple clients",
    badge: null,
    highlight: false,
    features: [
      "Everything in Growth",
      "Unlimited projects",
      "White-label reports",
      "Client portal access",
      "Custom AI model training",
      "Dedicated account manager",
      "SLA guarantee (99.9%)",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    ctaHref: "/",
  },
];

const comparison = [
  { feature: "AI Modules",          values: ["All 7",   "All 7",   "All 7",      "All 7"]      },
  { feature: "Projects",             values: ["1",       "3",       "10",          "Unlimited"]  },
  { feature: "Keywords",             values: ["500",     "2,000",   "Unlimited",   "Unlimited"]  },
  { feature: "Content Briefs/mo",    values: ["10",      "10",      "50",          "Unlimited"]  },
  { feature: "Technical Audit",      values: ["Weekly",  "Weekly",  "Daily",       "Real-time"]  },
  { feature: "Self-Learning Engine", values: ["—",       "—",       "✓",           "✓"]          },
  { feature: "API Access",           values: ["—",       "—",       "✓",           "✓"]          },
  { feature: "White-label",          values: ["—",       "—",       "—",           "✓"]          },
  { feature: "Custom AI Training",   values: ["—",       "—",       "—",           "✓"]          },
];

const faqs = [
  { q: "How does the 14-day trial work?", a: "You get full access to all 7 AI modules for 14 days. No credit card required. After the trial, choose a plan or your account pauses — your data is kept for 30 days." },
  { q: "Can I change plans at any time?",  a: "Yes. Upgrade immediately, downgrade at the end of your billing cycle. No cancellation fees." },
  { q: "What counts as a 'keyword'?",      a: "Any search term tracked in your rank monitoring dashboard. Keyword research and discovery do not count against your limit." },
  { q: "Is my data secure?",              a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). GDPR/CCPA compliant. We never share your data with third parties." },
  { q: "What integrations are supported?", a: "GA4, Google Search Console, Ahrefs, SEMrush, Moz, WordPress, Shopify, Webflow, HubSpot, and any CMS via our REST API." },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", color: "#e2e8f0", fontFamily: "Inter, Segoe UI, sans-serif", paddingTop: 80 }}>

      {/* Header */}
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", padding: "48px 24px 56px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#6366f115", border: "1px solid #6366f130", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "#818cf8", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
          ⚡ Simple Pricing
        </div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>
          Invest in Growth,{" "}
          <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Not SEO Agencies
          </span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7 }}>
          Replace a $15k/month SEO agency with AI that works 24/7.
          Start free — no credit card required.
        </p>
      </div>

      {/* Plans grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 72px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{ position: "relative" }}>
            {plan.badge && (
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", zIndex: 2, boxShadow: "0 4px 16px #6366f140" }}>
                ★ {plan.badge}
              </div>
            )}
            <div style={{
              height: "100%",
              background: plan.highlight ? "linear-gradient(160deg,#0f1729,#1a1040)" : "#0a1628",
              border: plan.highlight ? "1px solid #6366f160" : "1px solid #1e3a5f",
              borderRadius: 16,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              boxShadow: plan.highlight ? "0 0 40px #6366f120" : "none",
              transition: "border-color 0.2s",
            }}>
              {/* Plan header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: plan.highlight ? "#818cf8" : "#64748b", marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 38, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: "#64748b", paddingBottom: 4 }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{plan.desc}</p>
              </div>

              {/* Features */}
              <ul style={{ flex: 1, listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#cbd5e1", lineHeight: 1.4 }}>
                    <span style={{ color: plan.highlight ? "#818cf8" : "#34d399", fontSize: 15, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.ctaHref} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                textDecoration: "none", transition: "opacity 0.2s",
                ...(plan.highlight
                  ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", boxShadow: "0 4px 20px #6366f140" }
                  : { background: "transparent", border: "1px solid #1e3a5f", color: "#94a3b8" }
                ),
              }}>
                {plan.cta} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Feature comparison */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 72px" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, marginBottom: 32, color: "#f1f5f9" }}>What&apos;s Included</h2>
        <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 16, overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "14px 20px", background: "#060d1a", borderBottom: "1px solid #1e3a5f" }}>
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Feature</span>
            {plans.map((p) => (
              <span key={p.name} style={{ fontSize: 11, color: p.highlight ? "#818cf8" : "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>{p.name}</span>
            ))}
          </div>
          {comparison.map((row, ri) => (
            <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: ri < comparison.length - 1 ? "1px solid #0d1f3c" : "none", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{row.feature}</span>
              {row.values.map((val, j) => (
                <span key={j} style={{ fontSize: 13, textAlign: "center", color: val === "—" ? "#334155" : plans[j].highlight ? "#818cf8" : "#cbd5e1", fontWeight: plans[j].highlight && val !== "—" ? 700 : 400 }}>
                  {val}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, marginBottom: 32, color: "#f1f5f9" }}>Frequently Asked</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq) => (
            <div key={faq.q} style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 24px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{faq.q}</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
