const CACHE = 'ontheway-v1'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim())
})

// Handle notification click — open app
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const action = e.notification.data?.action || 'open'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) {
        list[0].focus()
        list[0].postMessage({ type: 'NOTIFICATION_CLICK', action, data: e.notification.data })
        return
      }
      return clients.openWindow('/')
    })
  )
})

// Handle scheduled alarm messages from the app
self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, data, requireInteraction } = e.data
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/icon.svg',
      badge: '/icon.svg',
      requireInteraction: requireInteraction || false,
      vibrate: [200, 100, 200],
      data: data || {}
    })
  }
  if (e.data?.type === 'CLOSE_NOTIFICATION') {
    self.registration.getNotifications({ tag: e.data.tag }).then(notifs => {
      notifs.forEach(n => n.close())
    })
  }
})
