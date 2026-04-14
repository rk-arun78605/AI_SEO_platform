"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  FileText,
  TrendingUp,
  BarChart3,
  Shield,
  RefreshCw,
  Zap,
  Brain,
  ArrowRight,
  Star,
  Check,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";

const stats = [
  { value: "7", label: "AI Modules" },
  { value: "80+", label: "SEO Checks" },
  { value: "<3 min", label: "Full Audit" },
  { value: "30-day", label: "Self-Learning" },
  { value: "100%", label: "Autonomous" },
];

const modules = [
  { icon: Brain, color: "brand", title: "Business Intelligence Engine", desc: "Connects GA4, GSC, Ahrefs, SEMrush. Auto-detects traffic drops, opportunity gaps, and competitor moves 24/7.", badge: "Core" },
  { icon: Search, color: "cyan", title: "Keyword Intelligence", desc: "KeyBERT extraction + spaCy normalization + agglomerative clustering. DistilBERT intent classifier with opportunity scoring.", badge: "AI" },
  { icon: FileText, color: "violet", title: "Content AI Studio", desc: "LangChain RAG pipeline generates SEO briefs. Multi-dimension scorer: E-E-A-T, keyword density, readability, schema.", badge: "AI" },
  { icon: Shield, color: "slate", title: "Technical Auditor", desc: "80+ checks via Playwright: Core Web Vitals, crawlability, structured data, mobile usability, international SEO.", badge: "Checks" },
  { icon: TrendingUp, color: "emerald", title: "Rank Predictor", desc: "XGBoost model trained on 28 features. SERP snapshot TimescaleDB hypertables. Time-series cross-validation.", badge: "ML" },
  { icon: BarChart3, color: "amber", title: "Performance Analytics", desc: "Page-level revenue attribution. Continuous aggregates for instant queries. Real-time crawl budget monitoring.", badge: "Analytics" },
  { icon: RefreshCw, color: "rose", title: "Self-Learning Engine", desc: "PPO reinforcement learning. Auto-detects Google algorithm updates. Blue/green shadow model deployment.", badge: "RL" },
];

const colorMap: Record<string, string> = {
  brand: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  slate: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const pipelineSteps = [
  { num: "01", title: "Collect", desc: "Ingest data from GA4, GSC, Ahrefs, crawlers, SERP APIs" },
  { num: "02", title: "Analyze", desc: "AI models detect patterns, rank opportunities by revenue impact" },
  { num: "03", title: "Act", desc: "Auto-generate briefs, optimization tasks pushed to your CMS" },
  { num: "04", title: "Learn", desc: "Measure outcomes, retrain models, adapt to algorithm changes" },
];

const testimonials = [
  { name: "Sarah Chen", role: "Head of SEO, TechCorp", text: "RankFlow AI increased our organic traffic by 340% in 6 months. The self-learning engine caught a Google update before we even noticed.", stars: 5 },
  { name: "Marcus Webb", role: "Digital Marketing Lead", text: "The keyword intelligence module identified 2,400 untapped keywords we had zero visibility into. Incredible ROI.", stars: 5 },
  { name: "Priya Sharma", role: "CEO, E-commerce Brand", text: "Replaced our $15k/month SEO agency with RankFlow AI. Better results, full transparency, fraction of the cost.", stars: 5 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07, ease: "easeOut" } }),
};

export default function HomePage() {
  return (
    <div className="grid-bg min-h-screen">
      {/* HERO */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="brand" className="mb-6 text-sm px-4 py-1.5">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered SEO Automation Platform
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Your Autonomous<br />
            <span className="gradient-text">SEO Growth Engine</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            7 AI modules working 24/7 to find keywords, generate content, fix technical issues, predict rankings, and adapt to Google updates — completely autonomously.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/dashboard" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold bg-gradient-brand text-white shadow-xl shadow-brand/30 hover:opacity-90 transition-opacity text-base">
              <Zap className="w-4 h-4" /> See Live Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-white/10 text-slate-300 hover:border-brand/40 hover:text-white hover:bg-brand/5 transition-all text-base">
              View Pricing
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-slate-500 text-sm">
            Trusted by 1,200+ growth teams · No credit card required
          </motion.p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
                <p className="text-3xl font-bold gradient-text">{s.value}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Platform Modules</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">7 Modules, One Platform</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Each module is a specialist AI agent. Together they form a complete autonomous SEO operation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              const colorClass = colorMap[mod.color];
              return (
                <motion.div key={mod.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card hover className="h-full">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-100 text-sm leading-snug">{mod.title}</h3>
                      <Badge variant="muted" className="shrink-0 text-xs">{mod.badge}</Badge>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{mod.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="brand" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The 4-Step AI Loop</h2>
            <p className="text-slate-400 text-lg">A continuous intelligence cycle that never stops improving</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
            {pipelineSteps.map((step, i) => (
              <motion.div key={step.num} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-brand mx-auto mb-4 flex items-center justify-center shadow-xl shadow-brand/30">
                  <span className="text-2xl font-bold text-white/90">{step.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-8">Built with enterprise-grade technology</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Next.js 14","FastAPI","PostgreSQL","TimescaleDB","Redis","GPT-4o","LangChain","XGBoost","DistilBERT","KeyBERT","spaCy","Kafka","Docker","AWS ECS"].map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs font-mono bg-surface hover:border-brand/30 hover:text-slate-300 transition-all cursor-default">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 bg-surface/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4"><Star className="w-3 h-3" /> Customer Stories</Badge>
            <h2 className="text-4xl font-bold mb-4">Results That Speak</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />)}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 pt-5 border-t border-white/5">
                    <p className="font-semibold text-slate-100 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{t.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-surface-2 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial-brand opacity-50" />
            <div className="relative z-10">
              <Badge variant="brand" className="mb-6"><Zap className="w-3.5 h-3.5" /> Get Started Free</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Start Growing Today</h2>
              <p className="text-slate-400 text-lg mb-8">14-day free trial · No credit card · Full access to all 7 modules</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                <Link href="/pricing" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold bg-gradient-brand text-white shadow-xl shadow-brand/30 hover:opacity-90 transition-opacity">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/dashboard" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-white/10 text-slate-300 hover:border-brand/40 hover:bg-brand/5 transition-all">
                  See Live Demo
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {["No credit card","Cancel anytime","GDPR compliant","99.9% uptime SLA"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Check className="w-3.5 h-3.5 text-accent" />{item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
