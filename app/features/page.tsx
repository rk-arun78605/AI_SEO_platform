"use client";

import { motion } from "framer-motion";
import {
  Brain, Search, FileText, Shield, TrendingUp, BarChart3, RefreshCw,
  CheckCircle, Zap, Database, Cpu, Globe,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";

const modules = [
  {
    id: "bi",
    icon: Brain,
    color: "indigo",
    name: "Business Intelligence Engine",
    tagline: "Your 24/7 SEO command center",
    description:
      "Connects every data source you care about — GA4, Google Search Console, Ahrefs, SEMrush, Moz. Cross-correlates signals to surface opportunities that no single tool can see alone.",
    capabilities: [
      "Auto-detects traffic drops with root cause analysis",
      "Competitor gap monitoring with alert triggers",
      "Revenue attribution per keyword and page",
      "Custom KPI dashboards with natural language queries",
      "Automated weekly/monthly PDF reports",
    ],
    tech: ["FastAPI", "PostgreSQL/TimescaleDB", "Redis", "Celery"],
  },
  {
    id: "keywords",
    icon: Search,
    color: "cyan",
    name: "Keyword Intelligence Engine",
    tagline: "Find keywords before your competitors",
    description:
      "AI-powered keyword discovery using KeyBERT extraction, spaCy NLP normalization, and agglomerative clustering. DistilBERT classifies intent; opportunity scorer ranks by estimated revenue impact.",
    capabilities: [
      "KeyBERT + spaCy for semantic keyword extraction",
      "DistilBERT intent classification (informational/commercial/transactional)",
      "Agglomerative clustering groups related keyword families",
      "Opportunity score = search_vol × (1 − saturation) × intent_weight",
      "Long-tail discovery from GSC queries + competitor gap analysis",
    ],
    tech: ["KeyBERT", "spaCy", "DistilBERT", "sentence-transformers"],
  },
  {
    id: "content",
    icon: FileText,
    color: "violet",
    name: "Content AI Studio",
    tagline: "From keyword to ranked article",
    description:
      "LangChain RAG pipeline retrieves top-10 SERP context, then GPT-4o generates comprehensive SEO briefs. A multi-dimension scorer grades every piece across 6 factors before publishing.",
    capabilities: [
      "RAG pipeline: retrieves top 10 SERP results as context",
      "GPT-4o generates structured briefs with H1/H2/H3 outlines",
      "Scores: E-E-A-T, keyword density, readability, schema, internal links",
      "Semantic gap detection vs. top-ranking competitor content",
      "Direct CMS push: WordPress, Shopify, Webflow, HubSpot",
    ],
    tech: ["LangChain v0.3", "GPT-4o", "Claude 3.5 Sonnet", "pgvector"],
  },
  {
    id: "audit",
    icon: Shield,
    color: "slate",
    name: "Technical SEO Auditor",
    tagline: "80+ automated checks, zero manual work",
    description:
      "Playwright-powered crawler runs 80+ technical checks on every page. Core Web Vitals measurement, structured data validation, mobile usability, and international SEO — fully automated.",
    capabilities: [
      "Core Web Vitals: LCP, CLS, FID measured in real browsers",
      "Crawlability: robots.txt, sitemap, canonical, redirect chains",
      "Structured data: JSON-LD schema validation against Schema.org",
      "Mobile usability, page speed, image optimization analysis",
      "Hreflang tag validation for international SEO",
    ],
    tech: ["Playwright", "Lighthouse CI", "Node.js", "PostgreSQL"],
  },
  {
    id: "ranking",
    icon: TrendingUp,
    color: "emerald",
    name: "Rank Prediction Engine",
    tagline: "Know your ranking before Google does",
    description:
      "XGBoost model trained on 28-feature vectors including domain authority, content quality score, backlink velocity, and technical health. Time-series cross-validation for accuracy.",
    capabilities: [
      "XGBoost with 28 ranking signal features",
      "SERP snapshot history in TimescaleDB hypertables",
      "Time-series k-fold cross-validation (no data leakage)",
      "SHAP explainability: understand WHY ranks change",
      "30-day rank trajectory forecasting with confidence intervals",
    ],
    tech: ["XGBoost", "TimescaleDB", "SHAP", "scikit-learn"],
  },
  {
    id: "analytics",
    icon: BarChart3,
    color: "amber",
    name: "Performance Analytics",
    tagline: "Revenue-first SEO reporting",
    description:
      "Page-level revenue attribution ties every SEO dollar to business outcomes. Continuous aggregates deliver instant dashboard queries. Real-time crawl budget monitoring prevents wasted spend.",
    capabilities: [
      "Page-level revenue attribution via first/last touch models",
      "TimescaleDB continuous aggregates (sub-100ms queries)",
      "Real-time crawl budget usage and waste detection",
      "Content decay alerts: flag pages losing ranking velocity",
      "Custom report builder with scheduled email delivery",
    ],
    tech: ["TimescaleDB", "Recharts", "WebSockets", "Redis"],
  },
  {
    id: "selflearn",
    icon: RefreshCw,
    color: "rose",
    name: "Self-Learning Engine",
    tagline: "Gets smarter with every ranking change",
    description:
      "PPO reinforcement learning agent observes outcomes from every content and optimization change. Algorithm update detector identifies Google core updates in real-time and triggers model retraining.",
    capabilities: [
      "PPO (Proximal Policy Optimization) reinforcement learning agent",
      "Implicit signal collection: ranking changes, CTR shifts, engagement",
      "Google algorithm update fingerprinting and auto-response",
      "Blue/green shadow deployment: validate new models before promoting",
      "Online calibration: continuous recalibration on streaming data",
    ],
    tech: ["PPO/RL", "Python 3.12", "MLflow", "Kafka"],
  },
];

const colorMap: Record<string, { icon: string; bg: string; border: string; glow: string }> = {
  indigo: { icon: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", glow: "shadow-indigo-500/20" },
  cyan:   { icon: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   glow: "shadow-cyan-500/20" },
  violet: { icon: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "shadow-violet-500/20" },
  slate:  { icon: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/20",  glow: "shadow-slate-500/20" },
  emerald:{ icon: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20",glow: "shadow-emerald-500/20" },
  amber:  { icon: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  glow: "shadow-amber-500/20" },
  rose:   { icon: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20",   glow: "shadow-rose-500/20" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Badge variant="brand" className="mb-4">
            <Cpu className="w-3.5 h-3.5" /> Platform Features
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-bold mb-4"
        >
          Every Tool You Need,
          <br />
          <span className="gradient-text">Powered by AI</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg"
        >
          Seven specialized AI agents that work as one unified platform. No
          stitching tools together. No manual workflows.
        </motion.p>
      </div>

      {/* Summary cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {[
          { icon: Zap, label: "7 AI Modules", sub: "Specialist agents" },
          { icon: CheckCircle, label: "80+ Checks", sub: "Technical audit" },
          { icon: Database, label: "5 Data Sources", sub: "GA4, GSC, Ahrefs..." },
          { icon: Globe, label: "Full Autonomy", sub: "No manual work" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className="text-center py-6">
                <Icon className="w-6 h-6 text-brand mx-auto mb-2" />
                <p className="font-bold text-slate-100">{item.label}</p>
                <p className="text-slate-500 text-xs mt-1">{item.sub}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Module deep-dives */}
      <div className="max-w-5xl mx-auto space-y-10">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          const c = colorMap[mod.color];
          const isEven = i % 2 === 0;
          return (
            <motion.div
              key={mod.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
            >
              <Card className={`overflow-hidden border ${c.border}`}>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${!isEven ? "md:flex-row-reverse" : ""}`}>
                  {/* Left: Info */}
                  <div className="flex flex-col justify-center">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${c.icon} ${c.bg} ${c.border}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="muted" className="mb-3 w-fit">Module {i + 1} of 7</Badge>
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">{mod.name}</h2>
                    <p className={`text-sm font-medium ${c.icon} mb-4`}>{mod.tagline}</p>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{mod.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {mod.tech.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-xs font-mono text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Capabilities */}
                  <div className="bg-surface-2 rounded-xl p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                      Key Capabilities
                    </p>
                    <ul className="space-y-3">
                      {mod.capabilities.map((cap) => (
                        <li key={cap} className="flex items-start gap-3 text-sm">
                          <CheckCircle className={`w-4 h-4 ${c.icon} shrink-0 mt-0.5`} />
                          <span className="text-slate-300 leading-relaxed">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
