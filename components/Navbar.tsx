"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#000',
      borderBottom: '2px solid #00FF41',
      padding: '0 2rem',
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          border: '2px solid #00FF41',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 10px #00FF41',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <polyline points="2,12 6,6 10,16 14,8 18,14 22,10" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ color: '#00FF41', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.1em', textShadow: '0 0 10px #00FF41' }}>
            NEURAL SEO
          </div>
          <div style={{ color: 'rgba(0,255,65,0.5)', fontSize: '0.6rem', letterSpacing: '0.15em' }}>
            AI ANALYSIS ENGINE v2.4.1
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '2rem' }}>
        {['HOME', 'FEATURES', 'PRICING', 'DASHBOARD'].map(item => (
          <a key={item} href={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
            style={{ color: 'rgba(0,255,65,0.7)', fontSize: '0.75rem', letterSpacing: '0.15em', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#00FF41')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,255,65,0.7)')}
          >
            {item}
          </a>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontFamily: 'monospace' }}>{time}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', background: '#00FF41',
            boxShadow: '0 0 6px #00FF41',
          }} />
          <span style={{ color: '#00FF41', fontSize: '0.7rem', letterSpacing: '0.15em' }}>SYSTEM ONLINE</span>
        </div>
      </div>
    </header>
  );
}
