import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ontheway_data'

const DEFAULT_DATA = {
  errands: [],
  routes: [],
  settings: {
    defaultRadius: 1.5,
    defaultTimeBudget: 20,
    geofenceEnabled: false,
    notificationsEnabled: false
  }
}

const SAMPLE_ERRANDS = [
  { id: '1', title: 'Return Amazon package', store: 'UPS Store', category: 'returns', urgency: 'high', daysOld: 12, estimatedMins: 8, address: '123 Main St', lat: 30.5227, lng: -97.6295 },
  { id: '2', title: 'Pick up dry cleaning', store: 'CleanPro', category: 'personal', urgency: 'medium', daysOld: 5, estimatedMins: 5, address: '456 Oak Ave', lat: 30.5190, lng: -97.6180 },
  { id: '3', title: 'Buy birthday card', store: 'Target', category: 'shopping', urgency: 'high', daysOld: 2, estimatedMins: 10, address: '789 Commerce Blvd', lat: 30.5250, lng: -97.6350 },
  { id: '4', title: 'Prescription refill', store: 'CVS Pharmacy', category: 'health', urgency: 'medium', daysOld: 1, estimatedMins: 12, address: '321 Elm St', lat: 30.5210, lng: -97.6220 },
  { id: '5', title: 'Dog food (large bag)', store: 'PetSmart', category: 'pets', urgency: 'low', daysOld: 0, estimatedMins: 15, address: '654 Park Rd', lat: 30.5275, lng: -97.6400 }
]

const SAMPLE_ROUTES = [
  { id: 'r1', name: 'School run', days: ['Mon','Tue','Wed','Thu','Fri'], time: '08:00', waypoints: ['Home → Elementary School → Office'], lat: 30.5240, lng: -97.6300, radiusMiles: 1.5 },
  { id: 'r2', name: 'Gym morning', days: ['Mon','Wed','Fri'], time: '06:30', waypoints: ['Home → LA Fitness'], lat: 30.5200, lng: -97.6250, radiusMiles: 1.0 },
  { id: 'r3', name: 'Grocery loop', days: ['Sat'], time: '10:00', waypoints: ['Home → HEB → Home'], lat: 30.5260, lng: -97.6310, radiusMiles: 2.0 }
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function useStore() {
  const [data, setData] = useState(() => {
    const stored = load()
    if (stored) return stored
    return { ...DEFAULT_DATA, errands: SAMPLE_ERRANDS, routes: SAMPLE_ROUTES }
  })

  useEffect(() => { save(data) }, [data])

  const addErrand = useCallback((errand) => {
    setData(d => ({
      ...d,
      errands: [...d.errands, {
        ...errand,
        id: Date.now().toString(),
        daysOld: 0,
        lat: 30.52 + (Math.random() - 0.5) * 0.02,
        lng: -97.63 + (Math.random() - 0.5) * 0.02
      }]
    }))
  }, [])

  const removeErrand = useCallback((id) => {
    setData(d => ({ ...d, errands: d.errands.filter(e => e.id !== id) }))
  }, [])

  const completeErrand = useCallback((id) => {
    setData(d => ({ ...d, errands: d.errands.filter(e => e.id !== id) }))
  }, [])

  const addRoute = useCallback((route) => {
    setData(d => ({
      ...d,
      routes: [...d.routes, { ...route, id: Date.now().toString() }]
    }))
  }, [])

  const removeRoute = useCallback((id) => {
    setData(d => ({ ...d, routes: d.routes.filter(r => r.id !== id) }))
  }, [])

  const updateSettings = useCallback((settings) => {
    setData(d => ({ ...d, settings: { ...d.settings, ...settings } }))
  }, [])

  return { ...data, addErrand, removeErrand, completeErrand, addRoute, removeRoute, updateSettings }
}

export function getMatches(errands, routes) {
  const matches = []
  routes.forEach(route => {
    const routeErrands = errands.filter(e => {
      const dist = Math.sqrt(
        Math.pow((e.lat - route.lat) * 69, 2) +
        Math.pow((e.lng - route.lng) * 55, 2)
      )
      return dist <= route.radiusMiles
    })
    if (routeErrands.length > 0) {
      const totalMins = routeErrands.reduce((s, e) => s + e.estimatedMins, 0)
      matches.push({ route, errands: routeErrands, totalMins, score: routeErrands.length * 10 + routeErrands.reduce((s,e) => s + e.daysOld, 0) })
    }
  })
  return matches.sort((a, b) => b.score - a.score)
}

export const CATEGORIES = {
  shopping: { label: 'Shopping', color: '#818cf8' },
  returns:  { label: 'Returns', color: '#f87171' },
  health:   { label: 'Health', color: '#34d399' },
  personal: { label: 'Personal', color: '#fbbf24' },
  pets:     { label: 'Pets', color: '#fb923c' },
  other:    { label: 'Other', color: '#94a3b8' }
}

export const URGENCY_COLORS = {
  high: '#f87171',
  medium: '#fbbf24',
  low: '#4ade80'
}
