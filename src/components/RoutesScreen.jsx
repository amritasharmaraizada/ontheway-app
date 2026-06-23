import React, { useState } from 'react'

const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function RouteCard({ route, onDelete }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      marginBottom: 8
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
        }}>🛣️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{route.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {route.time} · within {route.radiusMiles} mi
          </div>
        </div>
        <button
          onClick={() => onDelete(route.id)}
          style={{ color: 'var(--text-muted)', fontSize: 16, padding: 4 }}
        >✕</button>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {ALL_DAYS.map(d => (
          <span key={d} style={{
            fontSize: 11, padding: '3px 7px', borderRadius: 6,
            background: route.days.includes(d) ? 'var(--accent-glow)' : 'var(--bg-surface)',
            color: route.days.includes(d) ? 'var(--accent)' : 'var(--text-muted)',
            border: '1px solid ' + (route.days.includes(d) ? 'var(--border-accent)' : 'var(--border)'),
            fontWeight: route.days.includes(d) ? 600 : 400
          }}>{d}</span>
        ))}
      </div>

      {route.waypoints && (
        <div style={{
          marginTop: 10, fontSize: 12, color: 'var(--text-muted)',
          padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 6
        }}>
          📍 {Array.isArray(route.waypoints) ? route.waypoints.join(' → ') : route.waypoints}
        </div>
      )}
    </div>
  )
}

function AddRouteSheet({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: '', time: '08:00', days: [], radiusMiles: 1.5, waypoints: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d]
    }))
  }

  const submit = () => {
    if (!form.name.trim() || form.days.length === 0) return
    onAdd({ ...form, lat: 30.52 + (Math.random()-0.5)*0.02, lng: -97.63 + (Math.random()-0.5)*0.02 })
    onClose()
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end',
      zIndex: 100
    }} onClick={onClose}>
      <div
        style={{
          width: '100%', background: 'var(--bg-card)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 20px calc(20px + var(--safe-bottom))',
          maxHeight: '90vh', overflow: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Add route</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input placeholder="Route name (e.g. School run)" value={form.name} onChange={e => set('name', e.target.value)} />
          <input placeholder="Waypoints (e.g. Home → School → Office)" value={form.waypoints} onChange={e => set('waypoints', e.target.value)} />

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Which days?</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ALL_DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  style={{
                    padding: '7px 11px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    background: form.days.includes(d) ? 'var(--accent)' : 'var(--bg-surface)',
                    color: form.days.includes(d) ? '#0f1a2e' : 'var(--text-secondary)',
                    border: '1px solid ' + (form.days.includes(d) ? 'var(--accent)' : 'var(--border)')
                  }}
                >{d}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Usual time</div>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Errand radius (mi)</div>
              <select value={form.radiusMiles} onChange={e => set('radiusMiles', parseFloat(e.target.value))} style={{ width: '100%' }}>
                <option value={0.5}>0.5 mi</option>
                <option value={1.0}>1.0 mi</option>
                <option value={1.5}>1.5 mi</option>
                <option value={2.0}>2.0 mi</option>
                <option value={3.0}>3.0 mi</option>
              </select>
            </div>
          </div>

          <button
            onClick={submit}
            style={{
              marginTop: 4, padding: '14px',
              background: form.name && form.days.length ? 'var(--accent)' : 'var(--bg-surface)',
              color: form.name && form.days.length ? '#0f1a2e' : 'var(--text-muted)',
              borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 15,
              border: 'none'
            }}
          >Add route</button>
        </div>
      </div>
    </div>
  )
}

export default function RoutesScreen({ routes, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 80px', position: 'relative' }}>
      <div style={{
        padding: '10px 14px', marginBottom: 14,
        background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6
      }}>
        💡 Routes are the regular trips you already make — commute, school run, gym. OnTheWay clusters your errands along them.
      </div>

      {routes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🛣️</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>No routes yet</div>
          <div style={{ fontSize: 13 }}>Add your regular trips to see errand suggestions</div>
        </div>
      )}

      {routes.map(r => (
        <RouteCard key={r.id} route={r} onDelete={onDelete} />
      ))}

      <button
        onClick={() => setShowAdd(true)}
        style={{
          position: 'fixed', bottom: 'calc(70px + var(--safe-bottom))', right: 20,
          width: 54, height: 54, borderRadius: '50%',
          background: 'var(--accent)', color: '#0f1a2e',
          fontSize: 26, fontWeight: 700,
          boxShadow: '0 4px 20px #4ade8044',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >+</button>

      {showAdd && <AddRouteSheet onAdd={onAdd} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
