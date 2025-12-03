import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

function NotificationsSetting() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    nearbyAlerts: true,
    detailedPrompt: false,
    sound: false,
    vibration: true,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/settings')
        if (!res.ok) return
        const data = await res.json()
        const noti = data.notifications || {}
        setSettings({
          nearbyAlerts: noti.nearbyAlerts ?? true,
          detailedPrompt: noti.detailedPrompt ?? false,
          sound: noti.sound ?? false,
          vibration: noti.vibration ?? true,
        })
      } catch {
        // ignore - api.js handles 401
      }
    }
    load()
  }, [])

  const handleToggle = async (field) => {
    const newSettings = {
      ...settings,
      [field]: !settings[field]
    }
    setSettings(newSettings)
    try {
      await api.put('/settings', { notifications: newSettings })
    } catch {
      // ignore - api.js handles 401
    }
  }

  const notificationOptions = [
    { id: 'nearbyAlerts', label: 'Receive nearby emergency alerts' },
    { id: 'detailedPrompt', label: 'Detailed information prompt' },
    { id: 'sound', label: 'Sound' },
    { id: 'vibration', label: 'Vibration' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8 max-w-md mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/setting')}
        className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-6 hover:bg-gray-400 active:scale-95 transition-all"
      >
        <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <h1 className="text-5xl font-bold text-gray-900 mb-8">Notifications</h1>

      {/* Notification Options */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {notificationOptions.map((option, index) => (
          <div
            key={option.id}
            className={`px-6 py-5 flex items-center justify-between ${
              index !== notificationOptions.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <span className="text-lg font-medium text-gray-900">{option.label}</span>
            <button
              onClick={() => handleToggle(option.id)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings[option.id] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  settings[option.id] ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationsSetting
