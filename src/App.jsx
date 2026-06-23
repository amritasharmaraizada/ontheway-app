import React, { useState } from 'react'
import { useStore } from './hooks/useStore.js'
import { useNotifications } from './hooks/useNotifications.js'
import Header from './components/Header.jsx'
import NavBar from './components/NavBar.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import ErrandsScreen from './components/ErrandsScreen.jsx'
import RoutesScreen from './components/RoutesScreen.jsx'
import FocusModeScreen from './components/FocusModeScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const store = useStore()

  const notif = useNotifications({
    errands: store.errands,
    routes: store.routes,
    settings: store.settings,
    onCompleteErrand: store.completeErrand
  })

  const handleClearData = () => {
    localStorage.removeItem('ontheway_data')
    localStorage.removeItem('otw_focus')
    window.location.reload()
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Header activeTab={activeTab} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {activeTab === 'home' && (
          <HomeScreen errands={store.errands} routes={store.routes} onComplete={store.completeErrand} />
        )}
        {activeTab === 'errands' && (
          <ErrandsScreen errands={store.errands} onAdd={store.addErrand} onComplete={store.completeErrand} onDelete={store.removeErrand} />
        )}
        {activeTab === 'routes' && (
          <RoutesScreen routes={store.routes} onAdd={store.addRoute} onDelete={store.removeRoute} />
        )}
        {activeTab === 'focus' && (
          <FocusModeScreen
            errands={store.errands}
            focusMode={notif.focusMode}
            onActivate={notif.activateFocusMode}
            onDeactivate={notif.deactivateFocusMode}
            onComplete={store.completeErrand}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen
            settings={store.settings}
            onUpdate={store.updateSettings}
            onClearData={handleClearData}
            permissionState={notif.permissionState}
            locationEnabled={notif.locationEnabled}
            onRequestNotifPermission={notif.requestNotifPermission}
            onEnableGeofence={notif.enableGeofence}
            onStopGeofence={notif.stopGeofence}
          />
        )}
      </div>
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} focusActive={!!notif.focusMode} />
    </div>
  )
}
