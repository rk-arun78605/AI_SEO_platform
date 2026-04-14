"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Search, FileText, Shield, Zap,
  ArrowUpRight, ArrowDownRight, Eye, MousePointerClick, Target,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ─── Mock data ──────────────────────────────────────────────── */
const trafficData = [
  { month: "Jan", organic: 12400, paid: 3200 },
  { month: "Feb", organic: 14200, paid: 3100 },
  { month: "Mar", organic: 13800, paid: 2900 },
  { month: "Apr", organic: 17500, paid: 3400 },
  { month: "May", organic: 21000, paid: 3200 },
  { month: "Jun", organic: 19800, paid: 3600 },
  { month: "Jul", organic: 24300, paid: 3800 },
  { month: "Aug", organic: 28900, paid: 4100 },
  { month: "Sep", organic: 32400, paid: 4300 },
  { month: "Oct", organic: 38700, paid: 4500 },
  { month: "Nov", organic: 42100, paid: 4200 },
  { month: "Dec", organic: 51200, paid: 4700 },
];

const rankingData = [
  { week: "W1", avg: 18 },
  { week: "W2", avg: 16 },
  { week: "W3", avg: 14 },
  { week: "W4", avg: 11 },
  { week: "W5", avg: 9 },
  { week: "W6", avg: 7.5 },
  { week: "W7", avg: 6 },
  { week: "W8", avg: 4.8 },
];

const keywordsData = [
  { name: "AI SEO platform", vol: 8100, pos: 3, change: 2 },
  { name: "automated seo tool", vol: 5400, pos: 5, change: -1 },
  { name: "seo automation software", vol: 4900, pos: 7, change: 4 },
  { name: "rank tracking AI", vol: 3600, pos: 2, change: 1 },
  { name: "content optimization AI", vol: 6700, pos: 4, change: 3 },
  { name: "technical seo audit tool", vol: 2900, pos: 1, change: 0 },
];

const auditData = [
  { name: "Passed", value: 68, color: "#10b981" },
  { name: "Warnings", value: 9, color: "#f59e0b" },
  { name: "Failed", value: 3, color: "#ef4444" },
];

const contentItems = [
  { title: "How AI is Revolutionizing SEO", score: 94, status: "Published", traffic: "4.2k" },
  { title: "Complete Guide to Technical SEO", score: 88, status: "Draft", traffic: "—" },
  { title: "Keyword Research in 2026", score: 91, status: "Published", traffic: "2.8k" },
  { title: "E-E-A-T: What It Means for Rankings", score: 76, status: "Review", traffic: "—" },
];

const kpis = [
  { label: "Organic Traffic", value: "51.2K", change: "+32%", up: true, icon: Eye },
  { label: "Keywords Top 10", value: "1,847", change: "+18%", up: true, icon: Target },
  { label: "Avg. Position", value: "4.8", change: "-2.1", up: true, icon: TrendingUp },
  { label: "Click-Through Rate", value: "5.4%", change: "+0.8%", up: true, icon: MousePointerClick },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06 } }),
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-20 pb-24 px-4 bg-[rgb(4_4_14)]">
      {/* Header bar */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="accent" className="text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
              Live Demo
            </Badge>
            <span className="text-slate-500 text-sm">| Last updated 2 min ago</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">SEO Command Center</h1>
          <p className="text-slate-400 text-sm">rankflowai.com · Dec 2025 overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs hover:border-brand/30 hover:text-slate-200 transition-all">
            Last 12 months
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-gradient-brand text-white text-xs font-semibold shadow-lg shadow-brand/20 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Run Full Audit
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 font-medium">{kpi.label}</span>
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-100 mb-1">{kpi.value}</p>
                  <p className={cn("text-xs flex items-center gap-1 font-medium", kpi.up ? "text-accent" : "text-red-400")}>
                    {kpi.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {kpi.change} vs last period
                  </p>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-brand/5 blur-xl" />
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Traffic chart + Ranking chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-slate-100">Organic Traffic Growth</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Jan–Dec 2025</p>
                </div>
                <Badge variant="accent">+312% YoY</Badge>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="gradOrganic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "#0d0d1f", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#f8fafc" }} />
                  <Area type="monotone" dataKey="organic" stroke="#6366f1" strokeWidth={2} fill="url(#gradOrganic)" name="Organic" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-slate-100">Avg. Position</h2>
                  <p className="text-slate-500 text-xs mt-0.5">8-week trend</p>
                </div>
                <Badge variant="brand">↓ 13 pts</Badge>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={rankingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis reversed tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0d0d1f", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#f8fafc" }} />
                  <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} name="Avg Position" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Keywords + Technical Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Keyword table */}
          <motion.div custom={6} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-brand" />
                  <h2 className="font-semibold text-slate-100">Top Keywords</h2>
                </div>
                <Badge variant="muted">6 of 1,847</Badge>
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-4 text-xs text-slate-500 font-medium uppercase tracking-wider pb-2 border-b border-white/5">
                  <span className="col-span-2">Keyword</span>
                  <span className="text-center">Volume</span>
                  <span className="text-center">Position</span>
                </div>
                {keywordsData.map((kw) => (
                  <div key={kw.name} className="grid grid-cols-4 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/2 rounded transition-colors">
                    <span className="col-span-2 text-sm text-slate-300 truncate pr-2">{kw.name}</span>
                    <span className="text-center text-sm text-slate-400">{kw.vol.toLocaleString()}</span>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={cn("text-sm font-semibold", kw.pos <= 3 ? "text-accent" : kw.pos <= 10 ? "text-amber-400" : "text-slate-400")}>
                        #{kw.pos}
                      </span>
                      {kw.change !== 0 && (
                        <span className={cn("text-xs", kw.change > 0 ? "text-accent" : "text-red-400")}>
                          {kw.change > 0 ? `↑${kw.change}` : `↓${Math.abs(kw.change)}`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Technical Audit donut */}
          <motion.div custom={7} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <Shield className="w-4 h-4 text-slate-400" />
                <h2 className="font-semibold text-slate-100">Technical Audit</h2>
              </div>
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={auditData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                      {auditData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0d0d1f", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#f8fafc" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {auditData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-slate-400">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500">80 total checks · Last run 14 min ago</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Content Studio */}
        <motion.div custom={8} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-4 h-4 text-violet-400" />
              <h2 className="font-semibold text-slate-100">Content AI Studio</h2>
              <Badge variant="muted" className="ml-auto">4 articles</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {contentItems.map((item) => (
                <div key={item.title} className="bg-surface-2 rounded-xl p-4 border border-white/5 hover:border-violet-500/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      item.status === "Published" ? "bg-accent/10 text-accent-400" :
                      item.status === "Draft" ? "bg-white/5 text-slate-400" :
                      "bg-amber-500/10 text-amber-400"
                    )}>
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-500">{item.traffic} visits</span>
                  </div>
                  <p className="text-sm text-slate-200 font-medium leading-snug mb-3">{item.title}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-brand transition-all"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className={cn("text-xs font-bold", item.score >= 90 ? "text-accent" : item.score >= 75 ? "text-amber-400" : "text-red-400")}>
                      {item.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">SEO Score</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Demo disclaimer */}
        <div className="text-center pt-4">
          <p className="text-slate-600 text-xs">
            This is a live demo with simulated data. Sign up to connect your real website.
          </p>
        </div>
      </div>
    </div>
  );
}
