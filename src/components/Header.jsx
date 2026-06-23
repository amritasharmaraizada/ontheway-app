import React from 'react'

export default function Header({ activeTab }) {
  const titles = {
    home: 'OnTheWay',
    errands: 'My Errands',
    routes: 'My Routes',
    focus: '🎯 Focus mode',
    settings: 'Settings'
  }

  return (
    <header style={{
      padding: '16px 20px 12px',
      paddingTop: 'calc(16px + var(--safe-top))',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--bg-deep)',
      flexShrink: 0
    }}>
      {activeTab === 'home' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent-glow)',
            border: '1.5px solid var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16
          }}>🧭</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
            OnTheWay
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>beta</span>
        </div>
      )}
      {activeTab !== 'home' && (
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>
          {titles[activeTab]}
        </span>
      )}
    </header>
  )
}
