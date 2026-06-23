import React, { useState } from 'react'
import { URGENCY_COLORS } from '../hooks/useStore.js'
import { LOCATION_PRESETS } from '../hooks/useNotifications.js'

function timeUntil(isoString) {
  const ms = new Date(isoString) - Date.now()
  if (ms <= 0) return 'Deadline passed'
  const totalMins = Math.round(ms / 60000)
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return h > 0 ? `${h}h ${m}m remaining` : `${m} min remaining`
}

export default function FocusModeScreen({ errands, focusMode, onActivate, onDeactivate, onComplete }) {
  const [location, setLocation] = useState('airport')
  const [customLabel, setCustomLabel] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selected, setSelected] = useState([])

  const isActive = !!focusMode
  const preset = isActive ? (LOCATION_PRESETS.find(p => p.id === focusMode.locationId) || LOCATION_PRESETS[7]) : null
  const pendingErrands = isActive ? errands.filter(e => focusMode.errandIds?.includes(e.id)) : []

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const selectedPreset = LOCATION_PRESETS.find(p => p.id === location)

  const handleActivate = () => {
    if (!deadline || selected.length === 0) return
    const label = location === 'other' && customLabel ? customLabel : selectedPreset?.label || 'Location'
    onActivate(location, label, deadline, selected)
  }

  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16)

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 40px' }}>

      {/* Status banner */}
      <div style={{
        background: isActive ? '#4ade8012' : '#818cf812',
        border: `1px solid ${isActive ? '#4ade8040' : '#818cf840'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <span style={{ fontSize: 32 }}>{isActive ? preset?.emoji : '🎯'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
            {isActive ? `Focus mode · ${focusMode.locationLabel}` : 'Focus mode'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {isActive
              ? `${timeUntil(focusMode.deadlineTime)} · Reminder every 10 min`
              : 'Pick any location, set a deadline, choose tasks. Get reminded every 10 min until all done.'}
          </div>
        </div>
        {isActive && (
          <div style={{
            background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, color: 'var(--accent)', flexShrink: 0
          }}>LIVE</div>
        )}
      </div>

      {isActive ? (
        /* ── ACTIVE ── */
        <div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14
          }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 22, marginBottom: 2 }}>{pendingErrands.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>tasks left</div>
            </div>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                {new Date(focusMode.deadlineTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>deadline</div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Pending tasks
          </div>

          {pendingErrands.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '28px 16px',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', marginBottom: 12
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>All tasks done!</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Focus mode will deactivate automatically</div>
            </div>
          ) : pendingErrands.map(e => (
            <div key={e.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '11px 14px',
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: URGENCY_COLORS[e.urgency] }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {e.store} · {e.estimatedMins} min
                </div>
              </div>
              <button
                onClick={() => onComplete(e.id)}
                style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
                  color: 'var(--accent)'
                }}
              >✓ Done</button>
            </div>
          ))}

          <div style={{
            padding: '10px 13px', background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12
          }}>
            🔔 Next reminder in ~10 min · stops automatically when all tasks are marked done
          </div>

          <button
            onClick={onDeactivate}
            style={{
              width: '100%', padding: '13px',
              background: '#f8717110', border: '1px solid #f8717130',
              color: 'var(--danger)', borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: 14
            }}
          >Stop focus mode</button>
        </div>
      ) : (
        /* ── SETUP ── */
        <div>

          {/* Location picker */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Where are you going?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
              {LOCATION_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setLocation(p.id)}
                  style={{
                    padding: '10px 4px 8px',
                    background: location === p.id ? 'var(--accent-glow)' : 'var(--bg-card)',
                    border: `1px solid ${location === p.id ? 'var(--border-accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={{ fontSize: 10, color: location === p.id ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: location === p.id ? 600 : 400, lineHeight: 1.2, textAlign: 'center' }}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
            {location === 'other' && (
              <input
                style={{ marginTop: 8 }}
                placeholder="Custom location name (e.g. Client site)"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
              />
            )}
          </div>

          {/* Deadline datetime */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Deadline — date & time
            </div>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={{ width: '100%' }}
              min={minDateTime}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              You'll be reminded every 10 min until this time or all tasks are done
            </div>
          </div>

          {/* Task picker */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tasks to finish — {selected.length} selected
            </div>

            {errands.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '20px 16px', color: 'var(--text-muted)',
                background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', fontSize: 13
              }}>No errands yet — add some from the Errands tab</div>
            ) : errands.map(e => {
              const sel = selected.includes(e.id)
              return (
                <button
                  key={e.id}
                  onClick={() => toggleSelect(e.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: sel ? 'var(--accent-glow)' : 'var(--bg-card)',
                    border: `1px solid ${sel ? 'var(--border-accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)', padding: '10px 14px',
                    marginBottom: 7, display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    background: sel ? 'var(--accent)' : 'var(--bg-surface)',
                    border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#0f1a2e', fontWeight: 700
                  }}>{sel ? '✓' : ''}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {e.store} · {e.estimatedMins} min
                      {e.dueDateTime && (
                        <span style={{ color: 'var(--warning)', marginLeft: 6 }}>
                          · due {new Date(e.dueDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: URGENCY_COLORS[e.urgency], flexShrink: 0 }} />
                </button>
              )
            })}

            {errands.length > 0 && (
              <button
                onClick={() => setSelected(selected.length === errands.length ? [] : errands.map(e => e.id))}
                style={{
                  width: '100%', padding: '8px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', fontSize: 12,
                  color: 'var(--text-secondary)', marginTop: 4
                }}
              >
                {selected.length === errands.length ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>

          <button
            onClick={handleActivate}
            disabled={!deadline || selected.length === 0}
            style={{
              width: '100%', padding: '14px',
              background: deadline && selected.length ? 'var(--accent)' : 'var(--bg-surface)',
              color: deadline && selected.length ? '#0f1a2e' : 'var(--text-muted)',
              borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 15,
              border: 'none', transition: 'all 0.2s'
            }}
          >
            {selectedPreset?.emoji || '🎯'} Start focus mode
          </button>
        </div>
      )}
    </div>
  )
}
