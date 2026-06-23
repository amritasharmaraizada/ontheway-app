import React from 'react'

const tabs = [
  { id: 'home',     icon: '⚡', label: 'Today' },
  { id: 'errands',  icon: '📋', label: 'Errands' },
  { id: 'routes',   icon: '🛣️',  label: 'Routes' },
  { id: 'focus',    icon: '🎯', label: 'Focus' },
  { id: 'settings', icon: '⚙️',  label: 'Settings' }
]

export default function NavBar({ activeTab, setActiveTab, focusActive }) {
  return (
    <nav style={{
      display: 'flex', borderTop: '1px solid var(--border)',
      background: 'var(--bg-card)', paddingBottom: 'var(--safe-bottom)', flexShrink: 0
    }}>
      {tabs.map(tab => {
        const active = tab.id === activeTab
        const isFocus = tab.id === 'focus'
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 2px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? (isFocus ? '#a78bfa' : 'var(--accent)') : 'var(--text-muted)',
              background: 'none',
              borderTop: active
                ? `2px solid ${isFocus ? '#a78bfa' : 'var(--accent)'}`
                : '2px solid transparent',
              transition: 'all 0.15s', position: 'relative'
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, letterSpacing: '0.02em' }}>{tab.label}</span>
            {isFocus && focusActive && (
              <span style={{
                position: 'absolute', top: 8, right: '18%',
                width: 7, height: 7, borderRadius: '50%',
                background: '#4ade80', border: '1.5px solid var(--bg-card)'
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
