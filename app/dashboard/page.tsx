"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import type { DashboardPayload } from "../../lib/types";

/* ── helpers ─────────────────────────────────────────── */
const S = {
  page:     { minHeight:"100vh", background:"#060d1a", color:"#e2e8f0", fontFamily:"Inter, Segoe UI, sans-serif", paddingTop:80, paddingBottom:80 },
  wrap:     { maxWidth:1200, margin:"0 auto", padding:"0 24px" },
  card:     { background:"#0a1628", border:"1px solid #1e3a5f", borderRadius:16, padding:"24px 28px", marginBottom:0 },
  label:    { fontSize:11, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:1.5, color:"#475569" },
  h2:       { fontSize:"1.05rem", fontWeight:700, color:"#f1f5f9", margin:0 },
  muted:    { fontSize:13, color:"#64748b", lineHeight:1.6 },
  row:      { display:"flex", alignItems:"center", gap:12 },
  grid2:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 },
  grid3:    { display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 },
  grid4:    { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16 },
  pill:     (c:string) => ({ display:"inline-flex", alignItems:"center", gap:5, background:`${c}18`, border:`1px solid ${c}35`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, color:c }),
  bar:      (w:number, c:string) => ({ height:8, borderRadius:4, background:`${c}25`, overflow:"hidden" as const, position:"relative" as const }),
  barFill:  (w:number, c:string) => ({ height:"100%", width:`${Math.min(100,w)}%`, background:c, borderRadius:4 }),
  scoreClr: (s:number) => s>=80?"#22c55e":s>=60?"#f59e0b":s>=40?"#f97316":"#ef4444",
  posClr:   (p:number) => p<=3?"#22c55e":p<=10?"#f59e0b":"#ef4444",
  posLabel: (p:number) => p<=3?"🥇 Top 3 on Google":p<=10?"📄 Page 1 of Google":"📑 Page 2+",
  grade:    (s:number) => s>=90?"A":s>=80?"B":s>=70?"C":s>=50?"D":"F",
};

function StatCard({ icon, title, subtitle, value, change, up, explain }: {
  icon:string; title:string; subtitle:string; value:string; change:string; up:boolean; explain:string;
}) {
  return (
    <div style={{ ...S.card }}>
      <div style={{ ...S.row, marginBottom:14 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <div>
          <div style={S.h2}>{title}</div>
          <div style={{ fontSize:11, color:"#475569", marginTop:1 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ fontSize:"2.2rem", fontWeight:900, color:"#f1f5f9", lineHeight:1, marginBottom:6 }}>{value}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
        <span style={{ fontSize:13, color: up?"#22c55e":"#ef4444", fontWeight:700 }}>
          {up?"▲":"▼"} {change}
        </span>
        <span style={{ fontSize:11, color:"#475569" }}>vs last month</span>
      </div>
      <div style={{ fontSize:12, color:"#64748b", background:"#060d1a", borderRadius:8, padding:"8px 10px", lineHeight:1.5 }}>
        💡 {explain}
      </div>
    </div>
  );
}

function SectionHeader({ emoji, title, subtitle }: { emoji:string; title:string; subtitle:string }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ ...S.row, marginBottom:4 }}>
        <span style={{ fontSize:20 }}>{emoji}</span>
        <h2 style={S.h2}>{title}</h2>
      </div>
      <p style={{ ...S.muted, marginLeft:32 }}>{subtitle}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_DEFAULT_SITE_URL ?? "";
    const url = `/api/dashboard${siteUrl ? `?siteUrl=${encodeURIComponent(siteUrl)}` : ""}`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<DashboardPayload>; })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
        <div style={{ color:"#64748b", fontSize:14 }}>Analysing your website…</div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
        <div style={{ color:"#ef4444", fontSize:14, marginBottom:8 }}>Could not load your data</div>
        <div style={{ color:"#475569", fontSize:12, marginBottom:16 }}>{error}</div>
        <button onClick={() => window.location.reload()} style={{ background:"#6366f1", color:"#fff", border:"none", borderRadius:8, padding:"8px 20px", fontSize:13, cursor:"pointer" }}>Try Again</button>
      </div>
    </div>
  );

  const { trafficData, rankingData, keywordsData, auditData, contentItems, yoyChange } = data;
  const kpis = data.kpis;
  const totalChecks = auditData.reduce((s,a) => s+a.value, 0);
  const passed = auditData.find(a => a.name==="Passed")?.value ?? 0;
  const healthScore = totalChecks > 0 ? Math.round((passed/totalChecks)*100) : 0;
  const healthColor = S.scoreClr(healthScore);
  const trafficNow = trafficData.slice(-3).reduce((s,d) => s+d.organic, 0);
  const trafficPrev = trafficData.slice(-6,-3).reduce((s,d) => s+d.organic, 0);
  const trafficTrend = trafficPrev > 0 ? ((trafficNow-trafficPrev)/trafficPrev*100).toFixed(0) : "0";
  const top3kws = keywordsData.filter(k => k.pos <= 3).length;
  const page1kws = keywordsData.filter(k => k.pos <= 10).length;
  const lastUpdated = data.lastUpdated ? `${Math.round((Date.now()-new Date(data.lastUpdated).getTime())/60_000)} min ago` : "just now";

  // Narrative headline
  const headline =
    Number(trafficTrend) > 10 ? "📈 Your website is growing — more people are finding you on Google" :
    Number(trafficTrend) > 0  ? "➡️ Your website is stable — holding steady on Google" :
    Number(trafficTrend) > -10? "⚠️ Slight dip in visitors — let's look at what to improve" :
                                 "📉 Fewer people are finding you — action needed";

  const healthNarrative =
    healthScore >= 80 ? "Your website is in great technical shape — Google can crawl and understand it easily." :
    healthScore >= 60 ? "Your website has a few technical issues that could be affecting how Google ranks you." :
    healthScore >= 40 ? "Several technical problems are making it harder for Google to rank your site." :
                        "Your website has significant technical issues that need urgent attention.";

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* ── STORY HEADLINE ──────────────────────────────── */}
        <div style={{ ...S.card, marginBottom:28, background:"linear-gradient(135deg,#0d1f3c,#0a1628)", border:"1px solid #1e3a5f" }}>
          <div style={{ ...S.row, justifyContent:"space-between", flexWrap:"wrap" as const, gap:12 }}>
            <div>
              <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#f1f5f9", marginBottom:6 }}>{headline}</div>
              <div style={{ fontSize:13, color:"#64748b" }}>
                {data.siteUrl || "Your website"} · Updated {lastUpdated}
              </div>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" as const }}>
              <span style={S.pill("#22c55e")}>✓ Health {healthScore}%</span>
              <span style={S.pill("#818cf8")}>⟳ {yoyChange} this year</span>
              <span style={S.pill(data.dataStatus==="ok"?"#22c55e":"#f59e0b")}>
                {data.dataStatus==="ok"?"● Live Data":"● Demo Data"}
              </span>
            </div>
          </div>
          {data.dataMessage && (
            <div style={{ marginTop:14, padding:"10px 14px", background:"#0f1f3a", borderRadius:10, fontSize:12, color:"#94a3b8", borderLeft:"3px solid #6366f1" }}>
              ℹ️ {data.dataMessage}
            </div>
          )}
        </div>

        {/* ── SECTION 1: HOW MANY PEOPLE FIND YOU ─────────── */}
        <div style={{ marginBottom:28 }}>
          <SectionHeader emoji="👥" title="How Many People Find You on Google?" subtitle="Think of this as your monthly 'foot traffic' — how many visitors Google sends to your website." />
          <div style={S.grid4}>
            <StatCard icon="👁️" title="Monthly Visitors" subtitle="People who clicked your site in Google" value={kpis[0]?.value ?? "—"} change={kpis[0]?.change ?? "0%"} up={kpis[0]?.up ?? false} explain="This is how many people found your site through Google search — not paid ads." />
            <StatCard icon="🏆" title="Top 10 Rankings" subtitle="Search terms where you're on page 1" value={kpis[1]?.value ?? "—"} change={kpis[1]?.change ?? "0%"} up={kpis[1]?.up ?? false} explain="Being on page 1 of Google is where 90% of clicks happen. More here = more visitors." />
            <StatCard icon="📍" title="Average Position" subtitle="Where you typically appear in search results" value={kpis[2]?.value ?? "—"} change={kpis[2]?.change ?? "0 pts"} up={kpis[2]?.up ?? false} explain="Position #1 = first result. Lower number is better. Anything above #10 is page 1." />
            <StatCard icon="🖱️" title="Click Rate" subtitle="Of people who see you, how many click?" value={kpis[3]?.value ?? "—"} change={kpis[3]?.change ?? "0%"} up={kpis[3]?.up ?? false} explain="If 100 people see your site in Google and 5 click — that's a 5% click rate. Higher is better." />
          </div>
        </div>

        {/* ── SECTION 2: TRAFFIC STORY ─────────────────────── */}
        <div style={{ ...S.card, marginBottom:28 }}>
          <SectionHeader emoji="📈" title="Your Visitor Trend — The Last 12 Months" subtitle="This chart shows how your monthly Google visitors have grown (or dipped) over the year. Rising = Google likes you more." />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trafficData} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gOrganic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background:"#0d1117", border:"1px solid #1e3a5f", borderRadius:8, color:"#f8fafc", fontSize:12 }} formatter={(v:number) => [`${v.toLocaleString()} visitors`, "Monthly Visitors"]} />
              <Area type="monotone" dataKey="organic" stroke="#6366f1" strokeWidth={2.5} fill="url(#gOrganic)" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, padding:"10px 14px", background:"#060d1a", borderRadius:10 }}>
            <div style={{ fontSize:12, color:"#64748b" }}>
              <strong style={{ color:"#f1f5f9" }}>{trafficNow.toLocaleString()}</strong> visitors (last 3 months)
            </div>
            <div style={{ fontSize:12, color: Number(trafficTrend)>=0?"#22c55e":"#ef4444", fontWeight:700 }}>
              {Number(trafficTrend)>=0?"▲":"▼"} {Math.abs(Number(trafficTrend))}% vs previous 3 months
            </div>
          </div>
        </div>

        {/* ── SECTION 3: WHAT PEOPLE SEARCH FOR ──────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:20, marginBottom:28 }}>
          <div style={S.card}>
            <SectionHeader emoji="🔍" title="What People Type to Find You" subtitle="These are the exact words people search on Google that lead them to your site. The higher the position, the better." />
            <div style={{ overflowX:"auto" as const }}>
              <table style={{ width:"100%", borderCollapse:"collapse" as const, fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #1e3a5f" }}>
                    {["Search Term","Monthly Searches","Your Position","What It Means","Change"].map(h => (
                      <th key={h} style={{ padding:"8px 10px", color:"#475569", fontWeight:700, fontSize:11, textTransform:"uppercase" as const, letterSpacing:0.8, textAlign:"left" as const, whiteSpace:"nowrap" as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keywordsData.length ? keywordsData.map(kw => (
                    <tr key={kw.name} style={{ borderBottom:"1px solid #0d1f3c" }}>
                      <td style={{ padding:"10px", color:"#e2e8f0", fontWeight:500, maxWidth:160, overflow:"hidden" as const, textOverflow:"ellipsis" as const, whiteSpace:"nowrap" as const }}>{kw.name}</td>
                      <td style={{ padding:"10px", color:"#94a3b8", textAlign:"right" as const }}>{kw.vol.toLocaleString()}</td>
                      <td style={{ padding:"10px", textAlign:"center" as const }}>
                        <span style={{ fontWeight:900, color: S.posClr(kw.pos), fontSize:16 }}>#{kw.pos}</span>
                      </td>
                      <td style={{ padding:"10px" }}>
                        <span style={{ fontSize:11, color: S.posClr(kw.pos) }}>{S.posLabel(kw.pos)}</span>
                      </td>
                      <td style={{ padding:"10px", textAlign:"center" as const }}>
                        {kw.change !== 0 && (
                          <span style={{ fontSize:12, fontWeight:700, color: kw.change>0?"#22c55e":"#ef4444" }}>
                            {kw.change>0?`↑${kw.change}`:`↓${Math.abs(kw.change)}`}
                          </span>
                        )}
                        {kw.change === 0 && <span style={{ color:"#334155" }}>—</span>}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ padding:"24px", textAlign:"center" as const, color:"#475569" }}>No keyword data yet. Connect Google Search Console to see your rankings.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:14, display:"flex", gap:16, flexWrap:"wrap" as const }}>
              <span style={S.pill("#22c55e")}>🥇 Top 3: {top3kws} terms</span>
              <span style={S.pill("#f59e0b")}>📄 Page 1: {page1kws} terms</span>
            </div>
          </div>

          {/* Technical Health */}
          <div style={S.card}>
            <SectionHeader emoji="🏥" title="Website Health Check" subtitle="Like a doctor's report for your site. Green = healthy, Red = needs fixing." />
            <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", marginBottom:20 }}>
              <div style={{ width:120, height:120, borderRadius:"50%", border:`6px solid ${healthColor}`, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", background:"#060d1a", marginBottom:10 }}>
                <span style={{ fontSize:"2rem", fontWeight:900, color:healthColor }}>{S.grade(healthScore)}</span>
                <span style={{ fontSize:11, color:"#64748b" }}>{healthScore}% healthy</span>
              </div>
              <p style={{ fontSize:12, color:"#94a3b8", textAlign:"center" as const, lineHeight:1.6 }}>{healthNarrative}</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
              {auditData.map(item => (
                <div key={item.name}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{item.name}</span>
                    <span style={{ fontSize:12, fontWeight:700, color: item.name==="Passed"?"#22c55e":item.name==="Warnings"?"#f59e0b":"#ef4444" }}>{item.value} checks</span>
                  </div>
                  <div style={S.bar(totalChecks>0?(item.value/totalChecks)*100:0, item.color)}>
                    <div style={S.barFill(totalChecks>0?(item.value/totalChecks)*100:0, item.color)} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, padding:"10px 12px", background:"#060d1a", borderRadius:8, fontSize:11, color:"#64748b" }}>
              ℹ️ These {totalChecks} checks cover speed, security, mobile-friendliness, and how Google reads your pages.
            </div>
          </div>
        </div>

        {/* ── SECTION 4: YOUR TOP PAGES ───────────────────── */}
        {contentItems.length > 0 && (
          <div style={{ ...S.card, marginBottom:28 }}>
            <SectionHeader emoji="📄" title="Your Best-Performing Pages" subtitle="These pages bring you the most visitors from Google. Higher SEO score = better chance of ranking higher." />
            <div style={S.grid4}>
              {contentItems.map((item, i) => {
                const sc = item.score;
                const clr = S.scoreClr(sc);
                return (
                  <div key={item.title} style={{ background:"#060d1a", border:"1px solid #1e3a5f", borderRadius:12, padding:"16px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ fontSize:11, color:"#475569", fontWeight:700 }}>Page #{i+1}</span>
                      <span style={{ fontSize:12, color:"#94a3b8" }}>🧑‍💻 {item.traffic} visitors</span>
                    </div>
                    <p style={{ fontSize:13, color:"#e2e8f0", fontWeight:600, lineHeight:1.4, marginBottom:12 }}>{item.title}</p>
                    <div style={{ marginBottom:6 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, color:"#475569" }}>SEO Score</span>
                        <span style={{ fontSize:13, fontWeight:900, color:clr }}>{sc}/100</span>
                      </div>
                      <div style={S.bar(sc, clr)}>
                        <div style={S.barFill(sc, clr)} />
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:clr, marginTop:6 }}>
                      {sc>=90?"🏆 Excellent — top Google material":sc>=75?"✅ Good — some room to improve":"⚠️ Needs improvement to rank higher"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION 5: WHAT TO DO NEXT ──────────────────── */}
        <div style={S.card}>
          <SectionHeader emoji="🎯" title="What Should You Do Next?" subtitle="Based on your data, here are the top 3 actions that will get you more visitors from Google." />
          <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
            {[
              healthScore < 60 && {
                priority:"High", color:"#ef4444", icon:"🔧",
                action:"Fix technical website errors",
                why:`Your site passed only ${healthScore}% of technical checks. Google may be struggling to properly read and rank your pages.`,
                how:"Run a full technical audit from the scan — the report will show exactly which pages have problems.",
              },
              page1kws < 3 && {
                priority:"High", color:"#ef4444", icon:"📝",
                action:"Create content around your top search terms",
                why:`Only ${page1kws} of your keywords are on Google's first page. More targeted content = more page 1 rankings.`,
                how:"Use the Content Studio (below) to generate SEO-optimised articles for your best keyword opportunities.",
              },
              Number(trafficTrend) < 0 && {
                priority:"Medium", color:"#f59e0b", icon:"📈",
                action:"Investigate your traffic drop",
                why:"Your visitor numbers have dipped recently. This could be a Google algorithm update, technical issue, or competitor gaining ground.",
                how:"Check if any specific pages lost traffic and review recent changes to those pages.",
              },
              top3kws > 0 && {
                priority:"Opportunity", color:"#22c55e", icon:"🚀",
                action:"Build on your top-3 rankings",
                why:`You already rank in the top 3 for ${top3kws} search term(s). These bring the most clicks — make sure those pages are perfect.`,
                how:"Ensure your #1-3 ranking pages load fast, have clear CTAs, and answer the search intent completely.",
              },
              {
                priority:"Always", color:"#818cf8", icon:"🔗",
                action:"Get other websites to link to you",
                why:"Links from other websites are like votes of confidence. Google ranks sites with more quality links higher.",
                how:"Reach out to industry blogs, local directories, and partners to get your site mentioned and linked.",
              },
            ].filter(Boolean).slice(0, 4).map((item: unknown, i) => {
              const it = item as { priority:string; color:string; icon:string; action:string; why:string; how:string; };
              return (
                <div key={i} style={{ display:"flex", gap:16, padding:"16px 18px", background:"#060d1a", borderRadius:12, border:`1px solid ${it.color}25` }}>
                  <div style={{ fontSize:24, flexShrink:0, paddingTop:2 }}>{it.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase" as const, letterSpacing:1, color:it.color, background:`${it.color}15`, padding:"2px 8px", borderRadius:20 }}>{it.priority}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>{it.action}</span>
                    </div>
                    <p style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6, marginBottom:6 }}><strong style={{ color:"#64748b" }}>Why:</strong> {it.why}</p>
                    <p style={{ fontSize:12, color:"#64748b", lineHeight:1.6 }}><strong>How:</strong> {it.how}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── GLOSSARY ─────────────────────────────────────── */}
        <details style={{ marginTop:24 }}>
          <summary style={{ cursor:"pointer", fontSize:13, color:"#475569", padding:"10px 0", userSelect:"none" as const }}>📖 New to SEO? Click here for a quick glossary of terms</summary>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginTop:12 }}>
            {[
              ["Organic Traffic","Visitors who find you via Google — not paid ads. Free, long-term traffic."],
              ["Position / Ranking","Where you appear in Google search results. #1 = top of the page."],
              ["Click-Through Rate","% of people who see your site in Google and actually click on it."],
              ["Technical SEO","Whether your website is properly structured so Google can read & rank it."],
              ["Keywords","The words and phrases people type into Google to find websites like yours."],
              ["Impressions","How many times your site appeared in Google search results (even without a click)."],
            ].map(([term, def]) => (
              <div key={term} style={{ background:"#060d1a", border:"1px solid #1e3a5f", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#818cf8", marginBottom:4 }}>{term}</div>
                <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>{def}</div>
              </div>
            ))}
          </div>
        </details>

      </div>
    </div>
  );
}
