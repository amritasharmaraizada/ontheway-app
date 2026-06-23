import React, { useState } from 'react'
import { getMatches, CATEGORIES, URGENCY_COLORS } from '../hooks/useStore.js'

function UrgencyDot({ urgency }) {
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7,
      borderRadius: '50%', background: URGENCY_COLORS[urgency],
      flexShrink: 0, marginTop: 1
    }} />
  )
}

function MatchCard({ match, onComplete }) {
  const [expanded, setExpanded] = useState(false)
  const { route, errands, totalMins } = match
  const dayLabel = route.days.length === 7 ? 'Daily' : route.days.join(', ')

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: 12
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          textAlign: 'left'
        }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: 'var(--accent-glow)',
          border: '1.5px solid var(--border-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0
        }}>🛣️</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{route.name}</span>
            <span style={{
              fontSize: 11, padding: '2px 7px',
              background: 'var(--accent-glow)', color: 'var(--accent)',
              borderRadius: 20, fontWeight: 600
            }}>{errands.length} stop{errands.length > 1 ? 's' : ''}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {dayLabel} · {route.time} · ~{totalMins} min total
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 18, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px 14px' }}>
          {errands.map(e => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 0',
              borderBottom: '1px solid var(--border)'
            }}>
              <UrgencyDot urgency={e.urgency} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {e.store} · {e.estimatedMins} min
                  {e.daysOld > 0 && <span style={{ color: e.daysOld > 7 ? 'var(--danger)' : 'var(--warning)', marginLeft: 6 }}>
                    {e.daysOld}d pending
                  </span>}
                </div>
              </div>
              <button
                onClick={() => onComplete(e.id)}
                style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--accent)', fontSize: 12, fontWeight: 600
                }}
              >Done</button>
            </div>
          ))}
          <div style={{
            marginTop: 12, padding: '10px 12px',
            background: 'var(--bg-surface)', borderRadius: 8,
            fontSize: 12, color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span>📍</span>
            <span>All within {route.radiusMiles} mi of your {route.name.toLowerCase()} route</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HomeScreen({ errands, routes, onComplete }) {
  const matches = getMatches(errands, routes)
  const overdue = errands.filter(e => e.daysOld >= 7)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 8px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{today}</div>
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          {matches.length > 0
            ? `${matches.length} route${matches.length > 1 ? 's' : ''} with ripe errands`
            : 'No errand clusters today'}
        </div>
      </div>

      {overdue.length > 0 && (
        <div style={{
          background: '#f8717115',
          border: '1px solid #f8717140',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>
              {overdue.length} overdue errand{overdue.length > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {overdue.map(e => e.title).join(', ')}
            </div>
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧭</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>No clusters yet</div>
          <div style={{ fontSize: 13 }}>Add errands and routes to see where they overlap</div>
        </div>
      )}

      {matches.map((match, i) => (
        <MatchCard key={i} match={match} onComplete={onComplete} />
      ))}

      {errands.length > 0 && (
        <div style={{
          marginTop: 8, padding: '12px 14px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>All pending errands</div>
          {errands.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <UrgencyDot urgency={e.urgency} />
              <span style={{ flex: 1, fontSize: 13 }}>{e.title}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.estimatedMins}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
