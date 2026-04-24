"use client";

import React, { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lead { name: string; email: string; phone: string; website: string; }

// ─── Module definitions (from wireframe) ─────────────────────────────────────
const MODULES = [
  { id: "model-feedback",         label: "Model Feedback" },
  { id: "core-web-vitals",        label: "Core Web Vitals" },
  { id: "core-web-vitals-detail", label: "Core Web Vitals Detail" },
  { id: "keyword-planner",        label: "Keyword Planner" },
  { id: "keyword-planner-detail", label: "Keyword Planner Detail" },
  { id: "content-studio",         label: "Content Studio" },
  { id: "content-studio-detail",  label: "Content Studio Detail" },
  { id: "eeat",                   label: "E.E.A.T" },
  { id: "eeat-detail",            label: "E.E.A.T Detail" },
  { id: "optimization-panel",     label: "Optimization Panel" },
  { id: "optimization-detail",    label: "Optimization Panel Detail" },
  { id: "analytics",              label: "Analytics" },
  { id: "uiux",                   label: "UI/UX Detail" },
  { id: "backlinking",            label: "Backlinking Detail" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  neon: "#00FF41",
  neonDim: "rgba(0,255,65,0.5)",
  neonBg: "rgba(0,255,65,0.08)",
  neonBorder: "1px solid rgba(0,255,65,0.35)",
  surface: "#0a0a0a",
  surface2: "#111",
  inputStyle: {
    width: "100%", padding: "10px 14px",
    background: "#000", border: "1px solid rgba(0,255,65,0.35)",
    color: "#fff", fontSize: "0.8rem", letterSpacing: "0.05em",
    outline: "none", fontFamily: "'JetBrains Mono', monospace",
    transition: "border-color 0.2s, box-shadow 0.2s",
  } as React.CSSProperties,
  labelStyle: {
    color: "rgba(0,255,65,0.7)", fontSize: "0.65rem",
    letterSpacing: "0.12em", marginBottom: "6px", display: "block",
  } as React.CSSProperties,
  btnPrimary: {
    width: "100%", padding: "13px",
    background: "#00FF41", color: "#000",
    border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.15em",
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: "0 0 20px rgba(0,255,65,0.4)",
    transition: "box-shadow 0.2s, opacity 0.2s",
  } as React.CSSProperties,
};

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, max = 100, color = "#00FF41" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.72rem" }}>{label}</span>
        <span style={{ color, fontSize: "0.72rem", fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "3px", boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

// ─── Module panel content ─────────────────────────────────────────────────────
function ModuleContent({ id, url }: { id: string; url: string }) {
  const domain = url ? url.replace(/https?:\/\//, "").replace(/\/$/, "") : "example.com";

  switch (id) {
    case "model-feedback": return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          {[["OVERALL HEALTH", "74", "/100", "#00FF41"], ["PERFORMANCE", "81", "/100", "#00FF41"], ["SEO SCORE", "69", "/100", "#ffaa00"], ["ISSUES FOUND", "23", " total", "#ff4444"]].map(([k, v, u, c]) => (
            <div key={k} style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", letterSpacing: "0.12em", marginBottom: "8px" }}>{k}</div>
              <div style={{ color: c as string, fontSize: "1.8rem", fontWeight: 700 }}>{v}<span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>{u}</span></div>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "12px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>AI DIAGNOSTIC SUMMARY</div>
          {[["On-page optimization needs improvement — meta descriptions missing on 7 pages", "warn"],
            ["Page speed is within acceptable range — LCP 2.1s (target: &lt;2.5s)", "ok"],
            ["Core Web Vitals: 2 of 3 metrics passing — CLS issue detected on mobile", "warn"],
            ["Backlink profile is thin — only 142 referring domains vs 500+ for top competitors", "fail"],
            ["Content freshness score is low — 40% of pages not updated in 18+ months", "warn"],
          ].map(([msg, type], i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
              <span style={{ color: type === "ok" ? "#00FF41" : type === "warn" ? "#ffaa00" : "#ff4444", fontSize: "0.7rem", marginTop: "2px" }}>
                {type === "ok" ? "✓" : type === "warn" ? "▲" : "✗"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.72rem" }} dangerouslySetInnerHTML={{ __html: msg }} />
            </div>
          ))}
        </div>
        <ScoreBar label="Technical SEO" value={78} />
        <ScoreBar label="Content Quality" value={62} color="#ffaa00" />
        <ScoreBar label="Link Authority" value={34} color="#ff4444" />
        <ScoreBar label="User Experience" value={81} />
      </div>
    );

    case "core-web-vitals": return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {[
            ["LCP", "2.1s", "PASS", "#00FF41", "Largest Contentful Paint", "< 2.5s"],
            ["FID", "48ms", "PASS", "#00FF41", "First Input Delay", "< 100ms"],
            ["CLS", "0.18", "FAIL", "#ff4444", "Cumulative Layout Shift", "< 0.1"],
          ].map(([name, val, status, color, desc, target]) => (
            <div key={name as string} style={{ background: "#0a0a0a", border: `1px solid ${color}`, padding: "20px", textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", letterSpacing: "0.12em" }}>{name}</div>
              <div style={{ color: color as string, fontSize: "2.5rem", fontWeight: 700, margin: "8px 0", textShadow: `0 0 15px ${color}` }}>{val}</div>
              <div style={{ color: color as string, fontSize: "0.65rem", letterSpacing: "0.15em", marginBottom: "8px" }}>{status}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6rem" }}>{desc}</div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.58rem" }}>Target: {target}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>MOBILE vs DESKTOP</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {["MOBILE", "DESKTOP"].map((device, di) => (
              <div key={device}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", marginBottom: "10px" }}>{device}</div>
                {[["LCP", di === 0 ? "2.8s" : "2.1s", di === 0 ? "#ffaa00" : "#00FF41"],
                  ["FID", di === 0 ? "62ms" : "48ms", "#00FF41"],
                  ["CLS", di === 0 ? "0.22" : "0.18", "#ff4444"],
                ].map(([m, v, c]) => (
                  <div key={m as string} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>{m}</span>
                    <span style={{ color: c as string, fontSize: "0.7rem", fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    case "core-web-vitals-detail": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>CLS ISSUE DETAIL — ELEMENTS CAUSING SHIFT</div>
          {[["Hero banner image", "0.08", "Add explicit width/height attributes"],
            ["Ad slot #sidebar-1", "0.06", "Reserve space with min-height"],
            ["Font swap (Google Fonts)", "0.04", "Use font-display: swap + preload"],
          ].map(([el, score, fix]) => (
            <div key={el as string} style={{ display: "grid", gridTemplateColumns: "1fr auto 2fr", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>{el}</span>
              <span style={{ color: "#ff4444", fontSize: "0.8rem", fontWeight: 700 }}>{score}</span>
              <span style={{ color: "rgba(0,255,65,0.6)", fontSize: "0.65rem" }}>{fix}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>LCP RESOURCE CHAIN</div>
          {[["HTML fetch", "120ms"], ["Hero image request", "340ms"], ["Hero image load", "1,640ms"], ["LCP element painted", "2,100ms"]].map(([step, time]) => (
            <div key={step as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.1)", marginBottom: "4px" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}>{step}</span>
              <span style={{ color: "#00FF41", fontSize: "0.7rem" }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    );

    case "keyword-planner": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>TOP KEYWORD OPPORTUNITIES</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}>
                {["KEYWORD", "VOLUME", "DIFFICULTY", "POSITION", "OPPORTUNITY"].map(h => (
                  <th key={h} style={{ color: "rgba(0,255,65,0.7)", padding: "8px 10px", textAlign: "left", letterSpacing: "0.08em", fontSize: "0.62rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[["seo analysis tool", "18,200", "42", "11", "HIGH"],
                ["website seo checker", "9,800", "38", "14", "HIGH"],
                ["ai seo platform", "4,400", "35", "6", "MEDIUM"],
                ["keyword rank tracker", "12,100", "61", "—", "MEDIUM"],
                ["technical seo audit", "7,200", "55", "22", "HIGH"],
                ["backlink analysis free", "5,900", "44", "—", "HIGH"],
              ].map(([kw, vol, diff, pos, opp]) => (
                <tr key={kw as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ color: "#fff", padding: "9px 10px" }}>{kw}</td>
                  <td style={{ color: "#00FF41", padding: "9px 10px" }}>{vol}</td>
                  <td style={{ color: Number(diff) > 50 ? "#ffaa00" : "#00FF41", padding: "9px 10px" }}>{diff}</td>
                  <td style={{ color: pos === "—" ? "rgba(255,255,255,0.3)" : "#fff", padding: "9px 10px" }}>{pos}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ color: opp === "HIGH" ? "#00FF41" : "#ffaa00", fontSize: "0.62rem", border: `1px solid ${opp === "HIGH" ? "rgba(0,255,65,0.4)" : "rgba(255,170,0,0.4)"}`, padding: "2px 7px" }}>{opp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {[["RANKING KEYWORDS", "147", "#00FF41"], ["TOP 10 POSITIONS", "23", "#00FF41"], ["KEYWORD GAPS", "89", "#ffaa00"]].map(([k, v, c]) => (
            <div key={k as string} style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", marginBottom: "8px" }}>{k}</div>
              <div style={{ color: c as string, fontSize: "2rem", fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    );

    case "keyword-planner-detail": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>LONG-TAIL KEYWORD CLUSTERS</div>
          {[["how to do seo audit for website", "1,400", "22", "Content Gap"],
            ["best free seo tools for small business", "2,800", "31", "Content Gap"],
            ["technical seo checklist 2025", "1,900", "28", "Content Gap"],
            ["on page seo optimization tips", "3,200", "45", "Can Rank"],
            ["seo competitor analysis tool free", "2,100", "38", "Can Rank"],
          ].map(([kw, vol, diff, action]) => (
            <div key={kw as string} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1.5fr", gap: "10px", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: "0.7rem" }}>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>{kw}</span>
              <span style={{ color: "#00FF41" }}>{vol}/mo</span>
              <span style={{ color: Number(diff) > 40 ? "#ffaa00" : "#00FF41" }}>KD {diff}</span>
              <span style={{ color: action === "Content Gap" ? "#818cf8" : "#00FF41", border: `1px solid ${action === "Content Gap" ? "rgba(129,140,248,0.3)" : "rgba(0,255,65,0.3)"}`, padding: "2px 7px", fontSize: "0.62rem" }}>{action}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>SERP FEATURE OPPORTUNITIES</div>
          {[["Featured Snippet", "8 keywords eligible", "#00FF41"], ["People Also Ask", "15 keywords eligible", "#00FF41"], ["Knowledge Panel", "Not applicable", "rgba(255,255,255,0.3)"], ["Image Pack", "4 keywords eligible", "#ffaa00"]].map(([feat, status, c]) => (
            <div key={feat as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}>{feat}</span>
              <span style={{ color: c as string, fontSize: "0.7rem" }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    );

    case "content-studio": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>CONTENT QUALITY ANALYSIS</div>
          <ScoreBar label="Overall Content Score" value={68} />
          <ScoreBar label="Readability (Flesch)" value={72} />
          <ScoreBar label="Keyword Density" value={55} color="#ffaa00" />
          <ScoreBar label="Content Freshness" value={40} color="#ff4444" />
          <ScoreBar label="Semantic Coverage" value={63} color="#ffaa00" />
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>AI CONTENT RECOMMENDATIONS</div>
          {["Add FAQ sections to 12 service pages (boosts featured snippet eligibility)",
            "Update 8 blog posts older than 18 months with 2024-2025 statistics",
            "Homepage word count is 320 — competitors average 850+ words",
            "Missing semantic keywords: 'tools', 'automation', 'AI-powered' on key pages",
            "Add internal links from blog posts to service pages (avg 1.2 links, needs 3+)",
          ].map((rec, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#00FF41", fontSize: "0.7rem" }}>→</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    );

    case "content-studio-detail": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>HEADING STRUCTURE ANALYSIS</div>
          {[["Homepage H1", "1 found", "✓", "#00FF41"], ["About H1", "0 found", "✗ Missing H1", "#ff4444"], ["Services H1", "2 found", "✗ Multiple H1s", "#ff4444"], ["Blog H2 tags", "Avg 4.2 per post", "✓ Good", "#00FF41"], ["H2 Keyword Usage", "42% include target KW", "▲ Improve to 65%+", "#ffaa00"]].map(([page, count, status, c]) => (
            <div key={page as string} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 2fr", gap: "10px", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{page}</span>
              <span style={{ color: "#fff" }}>{count}</span>
              <span style={{ color: c as string }}>{status}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>META TAG AUDIT</div>
          {[["Title Tag", "22/28 pages optimized", 78], ["Meta Description", "15/28 pages present", 53], ["OG Tags", "8/28 pages", 28], ["Schema Markup", "3 types detected", 60]].map(([tag, status, pct]) => (
            <div key={tag as string} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}>{tag}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>{status}</span>
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: Number(pct) > 60 ? "#00FF41" : Number(pct) > 40 ? "#ffaa00" : "#ff4444", borderRadius: "2px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    case "eeat": return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          {[["EXPERTISE", "72", "#00FF41"], ["EXPERIENCE", "58", "#ffaa00"], ["AUTHORITATIVENESS", "45", "#ffaa00"], ["TRUSTWORTHINESS", "81", "#00FF41"]].map(([k, v, c]) => (
            <div key={k as string} style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.58rem", letterSpacing: "0.1em", marginBottom: "8px" }}>{k}</div>
              <div style={{ color: c as string, fontSize: "2.2rem", fontWeight: 700 }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem" }}>/100</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>AI E.E.A.T ASSESSMENT</div>
          {["No author bio pages detected — Google's quality raters look for author credentials",
            "About Us page exists but lacks team credentials and certifications",
            "No case studies or testimonials with verifiable details",
            "Privacy Policy and Terms of Service are present — positive trust signal",
            "Contact page with physical address and phone number — boosts trustworthiness",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: i < 3 ? "#ffaa00" : "#00FF41", fontSize: "0.7rem" }}>{i < 3 ? "▲" : "✓"}</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );

    case "eeat-detail": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>AUTHORITATIVENESS SIGNALS</div>
          {[["Author bylines on blog posts", "Partially", "#ffaa00"], ["Author schema markup", "Missing", "#ff4444"], ["Author social profiles linked", "Missing", "#ff4444"], ["Industry mentions/citations", "12 found", "#00FF41"], ["Award badges / certifications", "0 displayed", "#ff4444"]].map(([sig, status, c]) => (
            <div key={sig as string} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{sig}</span>
              <span style={{ color: c as string }}>{status}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>TRUST SIGNALS</div>
          <ScoreBar label="SSL Certificate" value={100} />
          <ScoreBar label="HTTPS Usage" value={100} />
          <ScoreBar label="Privacy Policy Quality" value={75} />
          <ScoreBar label="Reviews/Testimonials" value={40} color="#ffaa00" />
          <ScoreBar label="Security Badges" value={20} color="#ff4444" />
        </div>
      </div>
    );

    case "optimization-panel": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>QUICK WIN OPTIMIZATIONS (High Impact, Low Effort)</div>
          {[["Add meta descriptions to 13 missing pages", "HIGH", "EASY"],
            ["Compress 24 images (saves 1.2MB page weight)", "HIGH", "EASY"],
            ["Fix 7 broken internal links (404 errors)", "HIGH", "EASY"],
            ["Add alt text to 31 images", "MEDIUM", "EASY"],
            ["Create XML sitemap and submit to GSC", "MEDIUM", "EASY"],
          ].map(([task, impact, effort]) => (
            <div key={task as string} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", gap: "10px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: "0.7rem" }}>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>{task}</span>
              <span style={{ color: impact === "HIGH" ? "#00FF41" : "#ffaa00", border: `1px solid ${impact === "HIGH" ? "rgba(0,255,65,0.3)" : "rgba(255,170,0,0.3)"}`, padding: "2px 6px", fontSize: "0.6rem", textAlign: "center" }}>{impact}</span>
              <span style={{ color: "#818cf8", border: "1px solid rgba(129,140,248,0.3)", padding: "2px 6px", fontSize: "0.6rem", textAlign: "center" }}>{effort}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>TECHNICAL FIXES NEEDED</div>
          {[["Eliminate render-blocking resources (3 found)", "HIGH"], ["Enable Gzip/Brotli compression", "HIGH"], ["Implement browser caching headers", "MEDIUM"], ["Minify CSS and JavaScript files", "MEDIUM"], ["Upgrade to HTTP/2", "LOW"]].map(([fix, priority]) => (
            <div key={fix as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem" }}>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{fix}</span>
              <span style={{ color: priority === "HIGH" ? "#ff4444" : priority === "MEDIUM" ? "#ffaa00" : "rgba(255,255,255,0.3)", fontSize: "0.62rem" }}>{priority}</span>
            </div>
          ))}
        </div>
      </div>
    );

    case "optimization-detail": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>SCHEMA MARKUP STATUS</div>
          {[["Organization", "Present", "#00FF41"], ["Website", "Present", "#00FF41"], ["BreadcrumbList", "Missing", "#ff4444"], ["Product/Service", "Missing", "#ff4444"], ["FAQ", "Missing", "#ff4444"], ["Review/Rating", "Missing", "#ff4444"]].map(([schema, status, c]) => (
            <div key={schema as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{schema} Schema</span>
              <span style={{ color: c as string }}>{status}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>CANONICALIZATION CHECK</div>
          {[["Canonical tags", "Present on 26/28 pages", "#00FF41"], ["WWW vs non-WWW redirect", "Properly configured", "#00FF41"], ["HTTPS redirect", "301 redirect in place", "#00FF41"], ["Trailing slash consistency", "2 inconsistencies found", "#ffaa00"], ["Duplicate content risk", "Low (3 near-duplicate pages)", "#ffaa00"]].map(([check, result, c]) => (
            <div key={check as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.7rem" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{check}</span>
              <span style={{ color: c as string }}>{result}</span>
            </div>
          ))}
        </div>
      </div>
    );

    case "analytics": return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          {[["ORGANIC TRAFFIC", "3,842", "+18%", "#00FF41"], ["AVG POSITION", "14.2", "-2.1", "#00FF41"], ["CLICK-THROUGH RATE", "3.8%", "+0.4%", "#00FF41"], ["IMPRESSIONS", "101,200", "+23%", "#00FF41"]].map(([k, v, change, c]) => (
            <div key={k as string} style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", marginBottom: "6px" }}>{k}</div>
              <div style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 700 }}>{v}</div>
              <div style={{ color: c as string, fontSize: "0.65rem", marginTop: "4px" }}>{change} vs last month</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>TOP PERFORMING PAGES (ORGANIC)</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}>
                {["PAGE", "CLICKS", "IMPRESSIONS", "CTR", "AVG POS"].map(h => (
                  <th key={h} style={{ color: "rgba(0,255,65,0.7)", padding: "8px", textAlign: "left", fontSize: "0.62rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[["Homepage", "842", "22,100", "3.8%", "8.4"],
                ["/blog/seo-tips", "621", "18,400", "3.4%", "11.2"],
                ["/services", "318", "9,800", "3.2%", "14.1"],
                ["/blog/keyword-research", "289", "7,200", "4.0%", "9.8"],
                ["/pricing", "201", "5,400", "3.7%", "12.3"],
              ].map(([page, clicks, impr, ctr, pos]) => (
                <tr key={page as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ color: "#00FF41", padding: "8px" }}>{page}</td>
                  <td style={{ color: "#fff", padding: "8px" }}>{clicks}</td>
                  <td style={{ color: "rgba(255,255,255,0.5)", padding: "8px" }}>{impr}</td>
                  <td style={{ color: "#00FF41", padding: "8px" }}>{ctr}</td>
                  <td style={{ color: "rgba(255,255,255,0.7)", padding: "8px" }}>{pos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    case "uiux": return (
      <div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>UX SIGNAL SCORES</div>
          <ScoreBar label="Mobile Responsiveness" value={88} />
          <ScoreBar label="Page Load Experience" value={72} color="#ffaa00" />
          <ScoreBar label="Navigation Clarity" value={65} color="#ffaa00" />
          <ScoreBar label="CTA Visibility" value={55} color="#ffaa00" />
          <ScoreBar label="Form Usability" value={80} />
          <ScoreBar label="Accessibility (WCAG)" value={48} color="#ff4444" />
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>UX ISSUES AFFECTING SEO</div>
          {["Interstitial pop-up appears on mobile within 2s of landing — Google penalty risk",
            "Text is too small on mobile — 12px on 4 pages (Google recommends 16px min)",
            "Tap targets overlapping in navigation menu on small screens",
            "No breadcrumb navigation — makes deep pages harder to understand",
            "Accessibility: 8 images missing alt text, 3 form inputs missing labels",
          ].map((issue, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#ff4444", fontSize: "0.7rem" }}>!</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>{issue}</span>
            </div>
          ))}
        </div>
      </div>
    );

    case "backlinking": return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          {[["REFERRING DOMAINS", "142", "#00FF41"], ["TOTAL BACKLINKS", "891", "#00FF41"], ["DOMAIN RATING", "28", "#ffaa00"], ["TOXIC LINKS", "14", "#ff4444"]].map(([k, v, c]) => (
            <div key={k as string} style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", marginBottom: "6px" }}>{k}</div>
              <div style={{ color: c as string, fontSize: "2rem", fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px", marginBottom: "12px" }}>
          <div style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>TOP REFERRING DOMAINS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}>
                {["DOMAIN", "DR", "LINKS", "TYPE", "STATUS"].map(h => (
                  <th key={h} style={{ color: "rgba(0,255,65,0.7)", padding: "8px", textAlign: "left", fontSize: "0.62rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[["techradar.com", "88", "3", "Editorial", "DO-FOLLOW"],
                ["searchenginejournal.com", "82", "1", "Citation", "DO-FOLLOW"],
                ["reddit.com", "91", "12", "Community", "NO-FOLLOW"],
                ["medium.com", "78", "7", "Blog", "NO-FOLLOW"],
                ["g2.com", "85", "2", "Review", "DO-FOLLOW"],
              ].map(([domain, dr, links, type, status]) => (
                <tr key={domain as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ color: "#00FF41", padding: "8px" }}>{domain}</td>
                  <td style={{ color: "#fff", padding: "8px" }}>{dr}</td>
                  <td style={{ color: "rgba(255,255,255,0.6)", padding: "8px" }}>{links}</td>
                  <td style={{ color: "rgba(255,255,255,0.5)", padding: "8px" }}>{type}</td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ color: status === "DO-FOLLOW" ? "#00FF41" : "rgba(255,255,255,0.3)", fontSize: "0.62rem" }}>{status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: "#0a0a0a", border: S.neonBorder, padding: "16px" }}>
          <div style={{ color: "#ff4444", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "12px" }}>TOXIC LINKS DETECTED (14)</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginBottom: "8px" }}>
            14 potentially harmful backlinks detected from spam domains. Recommend disavow file submission via Google Search Console.
          </div>
          <button style={{ ...S.btnPrimary, width: "auto", padding: "8px 20px", fontSize: "0.7rem", background: "transparent", border: "1px solid #ff4444", color: "#ff4444", boxShadow: "0 0 10px rgba(255,68,68,0.2)" }}>
            GENERATE DISAVOW FILE
          </button>
        </div>
      </div>
    );

    default: return <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Select a module from the sidebar.</div>;
  }
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function Page() {
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [lead, setLead] = useState<Lead>({ name: "", email: "", phone: "", website: "" });
  const [scanUrl, setScanUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const [scannedUrl, setScannedUrl] = useState("");
  const [activeModule, setActiveModule] = useState("model-feedback");
  const [leadError, setLeadError] = useState("");
  const scanRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name || !lead.email || !lead.phone || !lead.website) {
      setLeadError("Please fill in all fields.");
      return;
    }
    setLeadError("");
    setLeadSubmitted(true);
    setTimeout(() => scanRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl) return;
    setIsScanning(true);
    setScanProgress(0);
    setShowDashboard(false);
    const iv = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(iv);
          setIsScanning(false);
          setScannedUrl(scanUrl);
          setShowDashboard(true);
          setTimeout(() => dashRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
          return 100;
        }
        return prev + 1.5;
      });
    }, 45);
  };

  const sectionPad: React.CSSProperties = { padding: "80px 40px", maxWidth: "1280px", margin: "0 auto" };

  return (
    <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'JetBrains Mono', monospace" }}>
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#000", borderBottom: "2px solid #00FF41",
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", border: "2px solid #00FF41", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 10px #00FF41" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="2,12 6,6 10,16 14,8 18,14 22,10" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ color: "#00FF41", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.1em", textShadow: "0 0 10px #00FF41" }}>NEURAL SEO</div>
            <div style={{ color: "rgba(0,255,65,0.5)", fontSize: "0.58rem", letterSpacing: "0.15em" }}>AI ANALYSIS ENGINE v2.4.1</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: "2rem" }}>
          {["HOME", "FEATURES", "PRICING"].map(item => (
            <a key={item} href={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
              style={{ color: "rgba(0,255,65,0.6)", fontSize: "0.72rem", letterSpacing: "0.15em", textDecoration: "none" }}>
              {item}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 6px #00FF41" }} />
          <span style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.15em" }}>SYSTEM ONLINE</span>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        paddingTop: "64px", minHeight: "100vh",
        background: "#000",
        backgroundImage: "linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px), linear-gradient(to right, rgba(0,255,65,0.04) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ ...sectionPad, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", width: "100%" }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid rgba(0,255,65,0.4)", padding: "6px 14px", marginBottom: "28px" }}>
              <span style={{ color: "#00FF41", fontSize: "0.65rem" }}>⚡</span>
              <span style={{ color: "#00FF41", fontSize: "0.65rem", letterSpacing: "0.15em" }}>FREE SEO EVALUATION</span>
            </div>
            <h1 style={{ fontSize: "3.2rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              DOMINATE<br />
              <span style={{ color: "#00FF41", textShadow: "0 0 20px rgba(0,255,65,0.5)" }}>SEARCH RESULTS</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "28px" }}>
              AI-powered SEO analysis that reveals hidden opportunities. Real-time monitoring. Predictive insights. Automated optimization.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["CORE WEB VITALS ANALYSIS", "KEYWORD INTELLIGENCE", "CONTENT OPTIMIZATION", "E.E.A.T SCORING"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#00FF41", fontSize: "0.65rem" }}>■</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Lead Form */}
          {leadSubmitted ? (
            <div style={{ background: "#0a0a0a", border: "1px solid #00FF41", padding: "32px", boxShadow: "0 0 30px rgba(0,255,65,0.2)", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✓</div>
              <div style={{ color: "#00FF41", fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "8px" }}>REQUEST RECEIVED</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Scroll down to scan your website now.</div>
              <button onClick={() => scanRef.current?.scrollIntoView({ behavior: "smooth" })}
                style={{ ...S.btnPrimary, marginTop: "20px", width: "auto", padding: "10px 30px" }}>
                GO TO SCANNER ↓
              </button>
            </div>
          ) : (
            <div style={{ background: "#0a0a0a", border: "1px solid rgba(0,255,65,0.35)", padding: "32px", boxShadow: "0 0 30px rgba(0,255,65,0.1)" }}>
              <div style={{ color: "#00FF41", fontSize: "0.75rem", letterSpacing: "0.15em", marginBottom: "6px" }}>GET FREE AUDIT</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "24px", borderBottom: "1px solid rgba(0,255,65,0.15)", paddingBottom: "16px" }}>COMPREHENSIVE SITE ANALYSIS</div>
              <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[["NAME*", "name", "text", "Enter your name"],
                  ["EMAIL*", "email", "email", "your@email.com"],
                  ["PHONE*", "phone", "tel", "+1 (555) 000-0000"],
                  ["WEBSITE URL*", "website", "url", "https://yoursite.com"],
                ].map(([label, field, type, placeholder]) => (
                  <div key={field}>
                    <label style={S.labelStyle}>{label}</label>
                    <input
                      type={type} placeholder={placeholder}
                      value={lead[field as keyof Lead]}
                      onChange={e => setLead(prev => ({ ...prev, [field]: e.target.value }))}
                      style={S.inputStyle}
                    />
                  </div>
                ))}
                {leadError && <div style={{ color: "#ff4444", fontSize: "0.65rem" }}>{leadError}</div>}
                <button type="submit" style={S.btnPrimary}>
                  ⚡ SUBMIT REQUEST
                </button>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.62rem", textAlign: "center", letterSpacing: "0.08em" }}>
                  NO CREDIT CARD REQUIRED • 100% FREE ANALYSIS
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(0,255,65,0.2)", borderBottom: "1px solid rgba(0,255,65,0.2)", padding: "20px 40px", display: "flex", justifyContent: "center", gap: "80px" }}>
        {[["127,492", "SITES ANALYZED"], ["+347%", "AVG IMPROVEMENT"], ["12,847", "ACTIVE USERS"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ color: "#00FF41", fontSize: "1.8rem", fontWeight: 700, textShadow: "0 0 10px rgba(0,255,65,0.5)" }}>{v}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6rem", letterSpacing: "0.15em", marginTop: "4px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── URL SCANNER ───────────────────────────────────────── */}
      <section ref={scanRef} style={{ padding: "80px 40px", background: "#000", textAlign: "center" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase" }}>
            ANALYZE YOUR WEBSITE
          </h2>
          <p style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "40px" }}>
            ENTER URL FOR COMPREHENSIVE AI-POWERED SEO ANALYSIS
          </p>
          <form onSubmit={handleScan} style={{ display: "flex", gap: "0", marginBottom: "20px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(0,255,65,0.5)", fontSize: "0.8rem" }}>⌕</span>
              <input type="url" value={scanUrl} onChange={e => setScanUrl(e.target.value)}
                placeholder="HTTPS://EXAMPLE.COM"
                style={{ ...S.inputStyle, paddingLeft: "44px", height: "52px", fontSize: "0.85rem", letterSpacing: "0.08em" }}
              />
            </div>
            <button type="submit" disabled={isScanning || !leadSubmitted}
              onClick={e => { if (!leadSubmitted) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
              style={{
                padding: "0 32px", background: "#00FF41", color: "#000", border: "none",
                fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.15em", cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: "0 0 20px rgba(0,255,65,0.4)", opacity: isScanning ? 0.7 : 1,
              }}>
              {isScanning ? "SCANNING..." : "SCAN NOW"}
            </button>
          </form>
          {!leadSubmitted && (
            <div style={{ color: "rgba(255,170,0,0.8)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
              ▲ Please fill in the free audit form above first
            </div>
          )}

          {/* Progress bar */}
          {isScanning && (
            <div style={{ marginTop: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#00FF41", fontSize: "0.65rem", letterSpacing: "0.1em" }}>SCANNING {scanUrl}</span>
                <span style={{ color: "#00FF41", fontSize: "0.65rem" }}>{Math.round(scanProgress)}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(0,255,65,0.1)", border: "1px solid rgba(0,255,65,0.3)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent, rgba(0,255,65,0.3), transparent)", animation: "scan-move 1.2s ease-in-out infinite" }} />
                <div style={{ height: "100%", width: `${scanProgress}%`, background: "#00FF41", boxShadow: "0 0 10px #00FF41", transition: "width 0.1s" }} />
              </div>
              <div style={{ marginTop: "12px", color: "rgba(0,255,65,0.6)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
                {scanProgress < 20 ? "CRAWLING PAGES..." : scanProgress < 40 ? "ANALYZING CORE WEB VITALS..." : scanProgress < 60 ? "RUNNING KEYWORD ANALYSIS..." : scanProgress < 80 ? "CHECKING E.E.A.T SIGNALS..." : "COMPILING RESULTS..."}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── RESULTS DASHBOARD ─────────────────────────────────── */}
      {showDashboard && (
        <section ref={dashRef} style={{ padding: "0 0 80px", background: "#000" }}>
          <div style={{ background: "#0a0a0a", borderTop: "2px solid #00FF41", borderBottom: "1px solid rgba(0,255,65,0.2)", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <span style={{ color: "#00FF41", fontSize: "0.7rem", letterSpacing: "0.12em" }}>ANALYSIS COMPLETE</span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem" }}>URL: {scannedUrl}</span>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <span style={{ color: "rgba(0,255,65,0.6)", fontSize: "0.65rem" }}>LEAD: {lead.name}</span>
              <span style={{ color: "rgba(0,255,65,0.6)", fontSize: "0.65rem" }}>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: "flex", position: "relative" }}>
            {/* Sidebar */}
            <div style={{
              width: "240px", flexShrink: 0,
              background: "#050505", borderRight: "1px solid rgba(0,255,65,0.2)",
              minHeight: "calc(100vh - 100px)", padding: "20px 0",
              position: "sticky", top: "64px", alignSelf: "flex-start",
            }}>
              <div style={{ padding: "8px 20px", color: "rgba(0,255,65,0.4)", fontSize: "0.58rem", letterSpacing: "0.15em", marginBottom: "8px" }}>ANALYSIS MODULES</div>
              {MODULES.map(mod => (
                <button key={mod.id} onClick={() => setActiveModule(mod.id)}
                  style={{
                    display: "block", width: "100%", padding: "10px 20px",
                    background: activeModule === mod.id ? "rgba(0,255,65,0.1)" : "transparent",
                    borderLeft: activeModule === mod.id ? "2px solid #00FF41" : "2px solid transparent",
                    border: "none", borderLeft: activeModule === mod.id ? "2px solid #00FF41" : "2px solid transparent",
                    color: activeModule === mod.id ? "#00FF41" : "rgba(255,255,255,0.45)",
                    fontSize: "0.68rem", letterSpacing: "0.06em",
                    textAlign: "left", cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: "all 0.15s",
                  }}>
                  {mod.label}
                </button>
              ))}
            </div>

            {/* Main content */}
            <div style={{ flex: 1, padding: "28px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ color: "#00FF41", fontSize: "0.8rem", letterSpacing: "0.12em", fontWeight: 700 }}>
                    {MODULES.find(m => m.id === activeModule)?.label.toUpperCase()}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.62rem", marginTop: "2px" }}>{scannedUrl}</div>
                </div>
                <button style={{ ...S.btnPrimary, width: "auto", padding: "8px 20px", fontSize: "0.62rem" }}>
                  EXPORT PDF
                </button>
              </div>
              <div style={{ borderTop: "1px solid rgba(0,255,65,0.15)", paddingTop: "20px" }}>
                <ModuleContent id={activeModule} url={scannedUrl} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ borderTop: "2px solid #00FF41", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#000" }}>
        <div>
          <div style={{ color: "#00FF41", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.1em" }}>NEURAL SEO</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", marginTop: "2px" }}>AI-POWERED ANALYSIS ENGINE</div>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          {["REAL-TIME MONITORING", "PREDICTIVE ANALYTICS", "AUTOMATED OPTIMIZATION"].map(item => (
            <span key={item} style={{ color: "rgba(0,255,65,0.5)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>{item}</span>
          ))}
        </div>
        <div style={{ textAlign: "right", color: "rgba(255,255,255,0.25)", fontSize: "0.6rem" }}>
          <div>© 2026 NEURAL SEO LABS</div>
          <div>ALL SYSTEMS OPERATIONAL</div>
        </div>
      </footer>

      <style>{`
        @keyframes scan-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        button:hover { opacity: 0.85; }
        input:focus { border-color: #00FF41 !important; box-shadow: 0 0 8px rgba(0,255,65,0.3) !important; }
      `}</style>
    </div>
  );
}
