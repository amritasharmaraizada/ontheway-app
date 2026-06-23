import React from 'react'

function Row({ label, sub, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ flex: 1, paddingRight: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, flexShrink: 0,
        background: value ? 'var(--accent)' : 'var(--bg-surface)',
        border: '1px solid ' + (value ? 'var(--accent)' : 'var(--border)'),
        padding: 0, position: 'relative', transition: 'all 0.2s'
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 2, left: value ? 20 : 2,
        transition: 'left 0.2s'
      }} />
    </button>
  )
}

function SectionHead({ children }) {
  return (
    <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '12px 0 8px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </div>
  )
}

function Card({ children, mb = 16 }) {
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', padding: '0 16px', marginBottom: mb
    }}>
      {children}
    </div>
  )
}

export default function SettingsScreen({
  settings, onUpdate, onClearData,
  permissionState, locationEnabled,
  onRequestNotifPermission, onEnableGeofence, onStopGeofence
}) {
  const notifGranted = permissionState === 'granted'
  const notifDenied = permissionState === 'denied'

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 40px' }}>

      {/* Notifications */}
      <Card>
        <SectionHead>Notifications</SectionHead>

        <Row
          label="Push notifications"
          sub={notifDenied
            ? 'Blocked — enable in phone Settings → Browser → Notifications'
            : notifGranted ? 'Granted — deadline and proximity alerts active' : 'Allow OnTheWay to send alerts'}
        >
          {notifDenied
            ? <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Blocked</span>
            : notifGranted
              ? <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>✓ On</span>
              : <button
                  onClick={onRequestNotifPermission}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'var(--accent)', color: '#0f1a2e', border: 'none'
                  }}
                >Enable</button>
          }
        </Row>

        <Row
          label="Proximity alerts (geofence)"
          sub={locationEnabled
            ? 'Active — notifying when near an errand store'
            : 'Notify when you\'re within radius of an errand location'}
        >
          {notifGranted
            ? <Toggle
                value={locationEnabled}
                onChange={v => v ? onEnableGeofence() : onStopGeofence()}
              />
            : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enable notifications first</span>
          }
        </Row>

        <Row label="Deadline day alerts" sub="Notify on the day (and day before) an errand is due">
          <span style={{ fontSize: 12, color: notifGranted ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
            {notifGranted ? '✓ Active' : 'Needs permission'}
          </span>
        </Row>

        <Row label="Airport mode reminders" sub="Every 10 min while airport mode is on">
          <span style={{ fontSize: 12, color: notifGranted ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
            {notifGranted ? '✓ Active' : 'Needs permission'}
          </span>
        </Row>
      </Card>

      {/* Matching */}
      <Card>
        <SectionHead>Matching preferences</SectionHead>
        <Row label="Default radius" sub="How far from your route counts as 'nearby'">
          <select value={settings.defaultRadius} onChange={e => onUpdate({ defaultRadius: parseFloat(e.target.value) })} style={{ width: 90 }}>
            <option value={0.5}>0.5 mi</option>
            <option value={1.0}>1.0 mi</option>
            <option value={1.5}>1.5 mi</option>
            <option value={2.0}>2.0 mi</option>
            <option value={3.0}>3.0 mi</option>
          </select>
        </Row>
        <Row label="Time budget" sub="Max total errand time per suggestion">
          <select value={settings.defaultTimeBudget} onChange={e => onUpdate({ defaultTimeBudget: parseInt(e.target.value) })} style={{ width: 90 }}>
            <option value={10}>10 min</option>
            <option value={20}>20 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>
        </Row>
      </Card>

      {/* Privacy */}
      <Card>
        <SectionHead>Privacy</SectionHead>
        <Row label="All data stays on your device" sub="OnTheWay stores nothing on any server">
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>✓ Local only</span>
        </Row>
        <Row label="Location used only for alerts" sub="Never stored, never uploaded, never shared">
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>✓ On-device</span>
        </Row>
        <Row label="No account required" sub="Zero sign-up, zero tracking">
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>✓ Always</span>
        </Row>
      </Card>

      {/* About */}
      <Card mb={20}>
        <SectionHead>About</SectionHead>
        <Row label="OnTheWay" sub="Version 1.1.0 — made with 💚">
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>beta</span>
        </Row>
      </Card>

      <button
        onClick={() => { if (window.confirm('Clear all data? Cannot be undone.')) onClearData() }}
        style={{
          width: '100%', padding: '13px',
          background: '#f8717110', border: '1px solid #f8717130',
          color: 'var(--danger)', borderRadius: 'var(--radius-md)',
          fontWeight: 600, fontSize: 14
        }}
      >Clear all data</button>
    </div>
  )
}
