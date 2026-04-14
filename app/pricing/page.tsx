"use client";

import { motion } from "framer-motion";
import { Check, Zap, ArrowRight, Star } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import Link from "next/link";

const plans = [
  {
    name: "Trial",
    price: "$0",
    period: "14 days",
    desc: "Full platform access for your team to evaluate",
    badge: null,
    color: "slate",
    features: [
      "All 7 AI modules",
      "1 website project",
      "Up to 500 keywords",
      "Weekly reports",
      "Community support",
      "No credit card required",
    ],
    cta: "Start Free Trial",
    ctaHref: "/dashboard",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "per month",
    desc: "For solo founders and small blogs",
    badge: null,
    color: "brand",
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
    ctaHref: "/dashboard",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$149",
    period: "per month",
    desc: "For growing businesses serious about SEO",
    badge: "Most Popular",
    color: "brand",
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
    ctaHref: "/dashboard",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$399",
    period: "per month",
    desc: "For agencies managing multiple clients",
    badge: null,
    color: "violet",
    features: [
      "Everything in Growth",
      "Unlimited projects",
      "White-label reports",
      "Client portal access",
      "Custom AI model training",
      "Dedicated account manager",
      "SLA guarantee (99.9%)",
      "Custom integrations",
      "Onboarding & training",
    ],
    cta: "Contact Sales",
    ctaHref: "/dashboard",
    highlight: false,
  },
];

const faqs = [
  {
    q: "How does the 14-day trial work?",
    a: "You get full access to all 7 AI modules, unlimited projects, and all features for 14 days. No credit card required. After the trial, choose a plan or your account pauses — your data is kept for 30 days.",
  },
  {
    q: "Can I change plans at any time?",
    a: "Yes. Upgrade immediately, downgrade at the end of your billing cycle. No cancellation fees.",
  },
  {
    q: "What counts as a 'keyword'?",
    a: "Any search term tracked in your rank monitoring dashboard. Keyword research and discovery do not count against your limit.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are GDPR/CCPA compliant and never share your data with third parties.",
  },
  {
    q: "What integrations are supported?",
    a: "GA4, Google Search Console, Ahrefs, SEMrush, Moz, WordPress, Shopify, Webflow, HubSpot, and any CMS via our REST API.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
};

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Badge variant="brand" className="mb-4">
            <Zap className="w-3.5 h-3.5" /> Simple Pricing
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-bold mb-4"
        >
          Invest in Growth,
          <br />
          <span className="gradient-text">Not SEO Agencies</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg"
        >
          Replace a $15k/month SEO agency with AI that works 24/7. Start free, no credit card required.
        </motion.p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative"
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-brand text-white shadow-lg shadow-brand/30">
                  <Star className="w-3 h-3" fill="currentColor" />
                  {plan.badge}
                </span>
              </div>
            )}
            <div
              className={cn(
                "h-full rounded-2xl p-6 flex flex-col border transition-all duration-300",
                plan.highlight
                  ? "bg-gradient-to-b from-brand/10 to-violet-900/10 border-brand/40 shadow-2xl shadow-brand/20"
                  : "bg-surface border-white/6 hover:border-white/12"
              )}
            >
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-slate-100">{plan.price}</span>
                  <span className="text-slate-500 text-sm pb-1">/{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm">{plan.desc}</p>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={cn(
                  "flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all",
                  plan.highlight
                    ? "bg-gradient-brand text-white shadow-lg shadow-brand/30 hover:opacity-90"
                    : "border border-white/10 text-slate-300 hover:border-brand/40 hover:bg-brand/5"
                )}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="max-w-4xl mx-auto mb-24">
        <h2 className="text-2xl font-bold text-center mb-10">What&apos;s Included</h2>
        <Card>
          <div className="grid grid-cols-5 gap-4 text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4 pb-4 border-b border-white/5">
            <span className="col-span-2">Feature</span>
            {plans.map((p) => (
              <span key={p.name} className="text-center">{p.name}</span>
            ))}
          </div>
          {[
            { feature: "AI Modules", values: ["All 7", "All 7", "All 7", "All 7"] },
            { feature: "Projects", values: ["1", "3", "10", "Unlimited"] },
            { feature: "Keywords", values: ["500", "2,000", "Unlimited", "Unlimited"] },
            { feature: "Content Briefs/mo", values: ["10", "10", "50", "Unlimited"] },
            { feature: "Technical Audit", values: ["Weekly", "Weekly", "Daily", "Real-time"] },
            { feature: "Self-Learning Engine", values: ["—", "—", "✓", "✓"] },
            { feature: "API Access", values: ["—", "—", "✓", "✓"] },
            { feature: "White-label", values: ["—", "—", "—", "✓"] },
            { feature: "Custom AI Training", values: ["—", "—", "—", "✓"] },
          ].map((row) => (
            <div key={row.feature} className="grid grid-cols-5 gap-4 py-3 border-b border-white/5 last:border-0">
              <span className="col-span-2 text-sm text-slate-300">{row.feature}</span>
              {row.values.map((val, j) => (
                <span key={j} className={cn("text-center text-sm", val === "—" ? "text-slate-600" : plans[j].highlight ? "text-brand font-semibold" : "text-slate-300")}>
                  {val}
                </span>
              ))}
            </div>
          ))}
        </Card>
      </div>

      {/* FAQs */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Card>
                <h3 className="font-semibold text-slate-100 mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
