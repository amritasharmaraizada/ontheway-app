// useNotifications.js — geofence, deadline (with time), and focus mode

import { useEffect, useRef, useCallback, useState } from 'react'

const METERS_PER_MILE = 1609.34
const GEOFENCE_COOLDOWN_MS = 30 * 60_000
const FOCUS_INTERVAL_MS = 10 * 60_000
const DEADLINE_CHECK_MS = 60 * 60_000

const LOCATION_PRESETS = [
  { id: 'airport',  label: 'Airport',       icon: '✈️',  emoji: '✈️' },
  { id: 'office',   label: 'Office',        icon: '🏢',  emoji: '🏢' },
  { id: 'school',   label: 'School',        icon: '🎓',  emoji: '🎓' },
  { id: 'mall',     label: 'Mall / shopping', icon: '🛍️', emoji: '🛍️' },
  { id: 'gym',      label: 'Gym',           icon: '💪',  emoji: '💪' },
  { id: 'hospital', label: 'Hospital',      icon: '🏥',  emoji: '🏥' },
  { id: 'home',     label: 'Home',          icon: '🏠',  emoji: '🏠' },
  { id: 'other',    label: 'Other',         icon: '📍',  emoji: '📍' },
]
export { LOCATION_PRESETS }

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    return reg
  } catch { return null }
}

async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function sendToSW(msg) {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage(msg)
  } else if (Notification.permission === 'granted' && msg.type === 'SHOW_NOTIFICATION') {
    new Notification(msg.title, { body: msg.body, icon: '/icon.svg', tag: msg.tag })
  }
}

function notify(title, body, tag, data = {}, requireInteraction = false) {
  sendToSW({ type: 'SHOW_NOTIFICATION', title, body, tag, data, requireInteraction })
}

export function useNotifications({ errands, routes, settings, onCompleteErrand }) {
  const [permissionState, setPermissionState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [focusMode, setFocusMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('otw_focus') || 'null') } catch { return null }
  })

  const notifiedGeofence = useRef({})
  const swReg = useRef(null)
  const geoWatchId = useRef(null)
  const focusTimer = useRef(null)
  const deadlineTimer = useRef(null)

  useEffect(() => {
    registerSW().then(reg => { swReg.current = reg })
  }, [])

  const requestNotifPermission = useCallback(async () => {
    const granted = await requestPermission()
    setPermissionState(granted ? 'granted' : 'denied')
    return granted
  }, [])

  // ── 1. GEOFENCE ─────────────────────────────────────────────────────────────
  const startGeofence = useCallback(() => {
    if (!navigator.geolocation || geoWatchId.current != null) return
    geoWatchId.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        const radiusMeters = (settings?.defaultRadius || 1.5) * METERS_PER_MILE
        const now = Date.now()
        errands.forEach(errand => {
          if (!errand.lat || !errand.lng) return
          const dist = haversineMeters(latitude, longitude, errand.lat, errand.lng)
          const lastNotified = notifiedGeofence.current[errand.id] || 0
          if (dist <= radiusMeters && now - lastNotified > GEOFENCE_COOLDOWN_MS) {
            notifiedGeofence.current[errand.id] = now
            const distMi = (dist / METERS_PER_MILE).toFixed(1)
            notify(
              `📍 Near ${errand.store}`,
              `${errand.title} — ${distMi} mi away · ~${errand.estimatedMins} min`,
              `geofence-${errand.id}`,
              { action: 'geofence', errandId: errand.id }
            )
          }
        })
        setLocationEnabled(true)
      },
      () => setLocationEnabled(false),
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 30000 }
    )
  }, [errands, settings])

  const stopGeofence = useCallback(() => {
    if (geoWatchId.current != null) {
      navigator.geolocation.clearWatch(geoWatchId.current)
      geoWatchId.current = null
      setLocationEnabled(false)
    }
  }, [])

  const enableGeofence = useCallback(async () => {
    const granted = await requestPermission()
    if (!granted) return false
    setPermissionState('granted')
    startGeofence()
    return true
  }, [startGeofence])

  useEffect(() => {
    if (locationEnabled && geoWatchId.current != null) {
      stopGeofence(); startGeofence()
    }
  }, [errands])

  // ── 2. DEADLINE WITH TIME ────────────────────────────────────────────────────
  useEffect(() => {
    if (permissionState !== 'granted') return
    function checkDeadlines() {
      const now = new Date()
      errands.forEach(errand => {
        if (!errand.dueDateTime) return
        const due = new Date(errand.dueDateTime)
        const diffMs = due - now
        const diffMins = Math.round(diffMs / 60000)

        // 60-min warning
        if (diffMins > 0 && diffMins <= 60) {
          notify(
            `⏰ Due in ${diffMins} min: ${errand.title}`,
            `${errand.store} — ${errand.estimatedMins} min to complete`,
            `deadline-${errand.id}-60`,
            { action: 'deadline', errandId: errand.id },
            true
          )
        }
        // Day-before warning (fire once around 9am)
        const isYesterday = diffMs > 12 * 3600000 && diffMs < 36 * 3600000
        const isNineAm = now.getHours() === 9 && now.getMinutes() < 60
        if (isYesterday && isNineAm) {
          notify(
            `🔔 Due tomorrow: ${errand.title}`,
            `${due.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})} at ${errand.store}`,
            `deadline-${errand.id}-dayb`,
            { action: 'deadline', errandId: errand.id }
          )
        }
      })
    }
    checkDeadlines()
    deadlineTimer.current = setInterval(checkDeadlines, DEADLINE_CHECK_MS)
    return () => clearInterval(deadlineTimer.current)
  }, [errands, permissionState])

  // ── 3. FOCUS MODE (replaces airport mode) ───────────────────────────────────
  const activateFocusMode = useCallback((locationId, locationLabel, deadlineTime, errandIds) => {
    const mode = { locationId, locationLabel, deadlineTime, errandIds, activatedAt: Date.now() }
    localStorage.setItem('otw_focus', JSON.stringify(mode))
    setFocusMode(mode)
  }, [])

  const deactivateFocusMode = useCallback(() => {
    localStorage.removeItem('otw_focus')
    setFocusMode(null)
    clearInterval(focusTimer.current)
    sendToSW({ type: 'CLOSE_NOTIFICATION', tag: 'focus-mode' })
  }, [])

  useEffect(() => {
    if (!focusMode || permissionState !== 'granted') return
    clearInterval(focusTimer.current)

    const preset = LOCATION_PRESETS.find(p => p.id === focusMode.locationId) || LOCATION_PRESETS[7]

    function fireFocusNotif() {
      const pending = errands.filter(e => focusMode.errandIds.includes(e.id))
      if (pending.length === 0) { deactivateFocusMode(); return }
      const now = Date.now()
      const deadlineMs = new Date(focusMode.deadlineTime) - now
      if (deadlineMs < 0) { deactivateFocusMode(); return }
      const mins = Math.round(deadlineMs / 60000)
      const timeLabel = mins >= 60
        ? `${Math.floor(mins/60)}h ${mins%60}m`
        : `${mins} min`
      notify(
        `${preset.emoji} ${timeLabel} left — ${pending.length} task${pending.length > 1 ? 's' : ''} pending`,
        pending.map(e => e.title).join(' · '),
        'focus-mode',
        { action: 'focus' },
        true
      )
    }

    fireFocusNotif()
    focusTimer.current = setInterval(fireFocusNotif, FOCUS_INTERVAL_MS)
    return () => clearInterval(focusTimer.current)
  }, [focusMode, errands, permissionState])

  return {
    permissionState,
    locationEnabled,
    focusMode,
    requestNotifPermission,
    enableGeofence,
    stopGeofence,
    activateFocusMode,
    deactivateFocusMode
  }
}
