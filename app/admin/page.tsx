"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NEON  = "#00FF41";
const GOLD  = "#ffaa00";
const RED   = "#ff4444";
const mono  = "'JetBrains Mono','Courier New',monospace";
const S_card: React.CSSProperties = { background: "#0a0a0a", border: "1px solid rgba(0,255,65,0.25)", padding: "20px 24px" };

interface Lead { name?:string; email?:string; phone?:string; website?:string; submittedAt?:string; createdAt?:string; }
interface Scan  { userId?:string; siteUrl?:string; createdAt?:string; kpis?:{overall?:number;technical?:number;seo?:number}; }
interface Stats { totalLeads:number; totalScans:number; uniqueUsers:number; }

export default function AdminPage() {
  const [secret, setSecret]   = useState("");
  const [authed, setAuthed]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [stats, setStats]     = useState<Stats | null>(null);
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [scans, setScans]     = useState<Scan[]>([]);
  const [tab, setTab]         = useState<"overview"|"leads"|"scans">("overview");
  const [testUrl, setTestUrl] = useState("");

  const login = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/admin/stats?secret=${encodeURIComponent(secret)}`);
      const data = await res.json() as { ok:boolean; stats?:Stats; leads?:Lead[]; scans?:Scan[]; error?:string };
      if (!data.ok) { setError(data.error ?? "Wrong password"); setLoading(false); return; }
      setStats(data.stats ?? { totalLeads:0, totalScans:0, uniqueUsers:0 });
      setLeads(data.leads ?? []);
      setScans(data.scans ?? []);
      setAuthed(true);
    } catch { setError("Connection error"); }
    setLoading(false);
  };

  const fmt = (ts?:string) => {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"2-digit", hour:"2-digit", minute:"2-digit" }); }
    catch { return ts; }
  };

  // ── Login gate ────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:mono }}>
      <div style={{ width:380, border:`1px solid rgba(0,255,65,0.35)`, background:"#0a0a0a", padding:"36px 32px" }}>
        <div style={{ fontSize:"0.6rem", letterSpacing:"0.25em", color:NEON, marginBottom:24 }}>
          INDRA OWNER CONSOLE v1.0
        </div>
        <div style={{ fontSize:"1.4rem", fontWeight:900, color:"#fff", marginBottom:8 }}>OWNER ACCESS</div>
        <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.35)", marginBottom:28, lineHeight:1.6 }}>
          Enter your admin secret to access platform metrics, lead data, and scan history.
        </p>
        <label style={{ fontSize:"0.6rem", letterSpacing:"0.15em", color:"rgba(0,255,65,0.6)", display:"block", marginBottom:8 }}>ADMIN SECRET</label>
        <input
          type="password"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="••••••••••••"
          style={{ width:"100%", background:"#000", border:"1px solid rgba(0,255,65,0.3)", color:"#fff", padding:"10px 14px", fontSize:"0.8rem", fontFamily:mono, outline:"none", marginBottom:16, boxSizing:"border-box" }}
        />
        {error && <div style={{ color:RED, fontSize:"0.7rem", marginBottom:12 }}>✕ {error}</div>}
        <button
          onClick={login}
          disabled={loading || !secret}
          style={{ width:"100%", background:NEON, color:"#000", border:"none", padding:"12px", fontSize:"0.7rem", fontWeight:900, letterSpacing:"0.2em", cursor:"pointer", fontFamily:mono, opacity: loading||!secret ? 0.6:1 }}
        >
          {loading ? "AUTHENTICATING..." : "AUTHENTICATE →"}
        </button>
        <div style={{ marginTop:20, fontSize:"0.6rem", color:"rgba(255,255,255,0.2)", textAlign:"center" }}>
          Set ADMIN_SECRET in cPanel → Setup Node.js App → Environment Variables
        </div>
      </div>
    </div>
  );

  // ── Main admin panel ──────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#000", color:"#fff", fontFamily:mono, paddingTop:80, paddingBottom:80 }}>

      {/* Header */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:"0.6rem", letterSpacing:"0.25em", color:NEON, marginBottom:6 }}>INDRA OWNER CONSOLE</div>
            <h1 style={{ fontSize:"1.6rem", fontWeight:900, margin:0 }}>Platform Overview</h1>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {(["overview","leads","scans"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: tab===t?NEON:"transparent", color: tab===t?"#000":NEON, border:`1px solid rgba(0,255,65,0.35)`, padding:"6px 14px", fontSize:"0.6rem", letterSpacing:"0.15em", fontWeight:900, cursor:"pointer", fontFamily:mono }}>
                {t.toUpperCase()}
              </button>
            ))}
            <Link href="/" style={{ border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)", padding:"6px 14px", fontSize:"0.6rem", letterSpacing:"0.1em", textDecoration:"none" }}>
              ← BACK TO SITE
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>

        {/* ── OVERVIEW TAB ──────────────────── */}
        {tab === "overview" && (
          <>
            {/* KPI Cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:28 }}>
              {[
                { label:"TOTAL LEADS",    value: stats?.totalLeads  ?? 0, icon:"👥", color:NEON  },
                { label:"TOTAL SCANS",    value: stats?.totalScans  ?? 0, icon:"🔍", color:"#38bdf8" },
                { label:"UNIQUE USERS",   value: stats?.uniqueUsers ?? 0, icon:"🧑‍💻", color:GOLD  },
              ].map(k => (
                <div key={k.label} style={S_card}>
                  <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:"rgba(255,255,255,0.3)", marginBottom:10 }}>{k.label}</div>
                  <div style={{ fontSize:"2.4rem", fontWeight:900, color:k.color, textShadow:`0 0 20px ${k.color}50` }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Test Scan */}
            <div style={{ ...S_card, marginBottom:28, border:`1px solid rgba(255,170,0,0.4)` }}>
              <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:GOLD, marginBottom:12 }}>⚡ OWNER TEST SCAN — NO LEAD FORM REQUIRED</div>
              <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.45)", marginBottom:16, lineHeight:1.6 }}>
                Scan any website instantly as the owner. Results open on the main page without going through the lead capture form.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <input
                  value={testUrl}
                  onChange={e => setTestUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{ flex:1, background:"#000", border:`1px solid rgba(255,170,0,0.35)`, color:"#fff", padding:"10px 14px", fontSize:"0.78rem", fontFamily:mono, outline:"none" }}
                />
                <a
                  href={testUrl ? `/?testUrl=${encodeURIComponent(testUrl)}&adminSecret=${encodeURIComponent(secret)}` : "#"}
                  style={{ background: testUrl?GOLD:"rgba(255,170,0,0.2)", color:"#000", border:"none", padding:"10px 20px", fontSize:"0.65rem", fontWeight:900, letterSpacing:"0.15em", cursor:"pointer", fontFamily:mono, textDecoration:"none", display:"flex", alignItems:"center" }}
                >
                  SCAN NOW →
                </a>
              </div>
            </div>

            {/* Recent activity split */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div style={S_card}>
                <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:NEON, marginBottom:14 }}>RECENT LEADS</div>
                {leads.slice(0,6).map((l,i) => (
                  <div key={i} style={{ paddingBottom:10, marginBottom:10, borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"0.72rem" }}>
                    <div style={{ color:"#fff", fontWeight:700 }}>{l.name ?? "—"}</div>
                    <div style={{ color:"rgba(255,255,255,0.4)" }}>{l.email ?? "—"}</div>
                    <div style={{ color:"rgba(0,255,65,0.5)", fontSize:"0.62rem" }}>{l.website ?? "—"} · {fmt(l.submittedAt ?? l.createdAt)}</div>
                  </div>
                ))}
                {leads.length === 0 && <div style={{ color:"rgba(255,255,255,0.2)", fontSize:"0.72rem" }}>No leads yet.</div>}
                {leads.length > 6 && <button onClick={()=>setTab("leads")} style={{ color:NEON, background:"none", border:"none", fontSize:"0.65rem", cursor:"pointer", letterSpacing:"0.1em", fontFamily:mono }}>VIEW ALL {leads.length} →</button>}
              </div>
              <div style={S_card}>
                <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:"#38bdf8", marginBottom:14 }}>RECENT SCANS</div>
                {scans.slice(0,6).map((s,i) => (
                  <div key={i} style={{ paddingBottom:10, marginBottom:10, borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"0.72rem" }}>
                    <div style={{ color:"#fff", fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.siteUrl ?? "—"}</div>
                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.62rem" }}>{s.userId ?? "anonymous"}</div>
                    <div style={{ display:"flex", gap:8, marginTop:3 }}>
                      {s.kpis?.overall != null && <span style={{ color: s.kpis.overall>=70?NEON:s.kpis.overall>=50?GOLD:RED, fontSize:"0.62rem" }}>Overall {s.kpis.overall}</span>}
                      <span style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.62rem" }}>{fmt(s.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {scans.length === 0 && <div style={{ color:"rgba(255,255,255,0.2)", fontSize:"0.72rem" }}>No scan history yet.</div>}
                {scans.length > 6 && <button onClick={()=>setTab("scans")} style={{ color:"#38bdf8", background:"none", border:"none", fontSize:"0.65rem", cursor:"pointer", letterSpacing:"0.1em", fontFamily:mono }}>VIEW ALL {scans.length} →</button>}
              </div>
            </div>
          </>
        )}

        {/* ── LEADS TAB ─────────────────────── */}
        {tab === "leads" && (
          <div style={S_card}>
            <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:NEON, marginBottom:16 }}>ALL LEADS ({leads.length})</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.72rem" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(0,255,65,0.2)" }}>
                    {["Name","Email","Phone","Website","Submitted"].map(h => (
                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:"rgba(0,255,65,0.5)", fontSize:"0.6rem", letterSpacing:"0.15em", fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"9px 12px", color:"#fff", fontWeight:600 }}>{l.name ?? "—"}</td>
                      <td style={{ padding:"9px 12px", color:"rgba(255,255,255,0.6)" }}>{l.email ?? "—"}</td>
                      <td style={{ padding:"9px 12px", color:"rgba(255,255,255,0.5)" }}>{l.phone ?? "—"}</td>
                      <td style={{ padding:"9px 12px", color:NEON, opacity:0.7 }}>{l.website ?? "—"}</td>
                      <td style={{ padding:"9px 12px", color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>{fmt(l.submittedAt ?? l.createdAt)}</td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr><td colSpan={5} style={{ padding:"24px", textAlign:"center", color:"rgba(255,255,255,0.2)" }}>No leads collected yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SCANS TAB ─────────────────────── */}
        {tab === "scans" && (
          <div style={S_card}>
            <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:"#38bdf8", marginBottom:16 }}>ALL SCAN HISTORY ({scans.length})</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.72rem" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(56,189,248,0.2)" }}>
                    {["Website","User","Overall","Technical","SEO","Scanned At"].map(h => (
                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:"rgba(56,189,248,0.5)", fontSize:"0.6rem", letterSpacing:"0.15em", fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scans.map((s,i) => {
                    const clr = (v?:number) => !v ? "rgba(255,255,255,0.3)" : v>=70?NEON:v>=50?GOLD:RED;
                    return (
                      <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"9px 12px", color:"#fff", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.siteUrl ?? "—"}</td>
                        <td style={{ padding:"9px 12px", color:"rgba(255,255,255,0.45)", fontSize:"0.65rem" }}>{s.userId ?? "anon"}</td>
                        <td style={{ padding:"9px 12px", color:clr(s.kpis?.overall), fontWeight:700 }}>{s.kpis?.overall ?? "—"}</td>
                        <td style={{ padding:"9px 12px", color:clr(s.kpis?.technical) }}>{s.kpis?.technical ?? "—"}</td>
                        <td style={{ padding:"9px 12px", color:clr(s.kpis?.seo) }}>{s.kpis?.seo ?? "—"}</td>
                        <td style={{ padding:"9px 12px", color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>{fmt(s.createdAt)}</td>
                      </tr>
                    );
                  })}
                  {scans.length === 0 && (
                    <tr><td colSpan={6} style={{ padding:"24px", textAlign:"center", color:"rgba(255,255,255,0.2)" }}>No scans recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
