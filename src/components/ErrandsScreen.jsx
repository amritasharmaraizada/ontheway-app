import React, { useState } from 'react'
import { CATEGORIES, URGENCY_COLORS } from '../hooks/useStore.js'

function ErrandCard({ errand, onComplete, onDelete }) {
  const cat = CATEGORIES[errand.category] || CATEGORIES.other
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      marginBottom: 8,
      display: 'flex', alignItems: 'flex-start', gap: 10
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: URGENCY_COLORS[errand.urgency],
        flexShrink: 0, marginTop: 5
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{errand.title}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{
            fontSize: 11, padding: '2px 7px', borderRadius: 12,
            background: cat.color + '20', color: cat.color, fontWeight: 500
          }}>{cat.label}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {errand.store}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⏱ {errand.estimatedMins}m</span>
          {errand.dueDateTime && (
              <span style={{ fontSize: 11, color: 'var(--warning)' }}>📅 Due: {new Date(errand.dueDateTime).toLocaleDateString('en-US', {month:'short',day:'numeric'})}</span>
            )}
            {errand.daysOld > 0 && (
            <span style={{ fontSize: 11, color: errand.daysOld >= 7 ? 'var(--danger)' : 'var(--warning)' }}>
              {errand.daysOld}d old
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => onComplete(errand.id)}
          style={{
            padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: 'var(--accent-glow)', border: '1px solid var(--border-accent)', color: 'var(--accent)'
          }}
        >✓ Done</button>
        <button
          onClick={() => onDelete(errand.id)}
          style={{
            padding: '4px 8px', borderRadius: 6, fontSize: 11,
            background: '#f8717110', border: '1px solid #f8717130', color: 'var(--danger)'
          }}
        >✕</button>
      </div>
    </div>
  )
}

function AddErrandSheet({ onAdd, onClose }) {
  const [form, setForm] = useState({
    title: '', store: '', category: 'shopping', urgency: 'medium', estimatedMins: 10, address: '', dueDateTime: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = () => {
    if (!form.title.trim() || !form.store.trim()) return
    onAdd(form)
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
          maxHeight: '85vh', overflow: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Add errand</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="What do you need to do?" value={form.title} onChange={e => set('title', e.target.value)} />
          <input placeholder="Store or location name" value={form.store} onChange={e => set('store', e.target.value)} />
          <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Due date & time (optional)</div>
              <input type="datetime-local" value={form.dueDateTime} onChange={e => set('dueDateTime', e.target.value)} />
            </div>

          <input placeholder="Address (e.g. 123 Main St, Austin)" value={form.address} onChange={e => set('address', e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Category</div>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={{ width: '100%' }}>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Urgency</div>
              <select value={form.urgency} onChange={e => set('urgency', e.target.value)} style={{ width: '100%' }}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Estimated time (minutes)</div>
            <input
              type="number" min="1" max="120"
              value={form.estimatedMins}
              onChange={e => set('estimatedMins', parseInt(e.target.value) || 10)}
            />
          </div>

          <button
            onClick={submit}
            style={{
              marginTop: 4, padding: '14px',
              background: 'var(--accent)', color: '#0f1a2e',
              borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 15
            }}
          >Add errand</button>
        </div>
      </div>
    </div>
  )
}

export default function ErrandsScreen({ errands, onAdd, onComplete, onDelete }) {
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? errands : errands.filter(e => e.urgency === filter)
  const sorted = [...filtered].sort((a, b) => b.daysOld - a.daysOld)

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 80px', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
        {['all', 'high', 'medium', 'low'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              whiteSpace: 'nowrap', flexShrink: 0,
              background: filter === f ? 'var(--accent)' : 'var(--bg-surface)',
              color: filter === f ? '#0f1a2e' : 'var(--text-secondary)',
              border: '1px solid ' + (filter === f ? 'var(--accent)' : 'var(--border)')
            }}
          >
            {f === 'all' ? `All (${errands.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>No errands here</div>
          <div style={{ fontSize: 13 }}>Tap + to add your first errand</div>
        </div>
      )}

      {sorted.map(e => (
        <ErrandCard key={e.id} errand={e} onComplete={onComplete} onDelete={onDelete} />
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

      {showAdd && (
        <AddErrandSheet onAdd={onAdd} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}
