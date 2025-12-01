import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'http://localhost:4000/api'

function ThreeTapSetting() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [settings, setSettings] = useState({
    notifyEmergencyContact: true,
    notifyNearby: true,
    callPolice: true,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        const threeTap = data.threeTap || {}
        setSettings({
          notifyEmergencyContact: threeTap.notifyEmergencyContact ?? true,
          notifyNearby: threeTap.notifyNearby ?? true,
          callPolice: threeTap.callPolice ?? true,
        })
      } catch {
        // ignore
      }
    }
    if (token) load()
  }, [token])

  const handleToggle = (field) => {
    const newSettings = {
      ...settings,
      [field]: !settings[field]
    }
    setSettings(newSettings)
    const save = async () => {
      try {
        await fetch(`${API_BASE}/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ threeTap: newSettings }),
        })
      } catch {
        // ignore
      }
    }
    save()
  }

  const options = [
    { id: 'notifyEmergencyContact', label: 'Notify Emergency Contact' },
    { id: 'notifyNearby', label: 'Notify Nearby' },
    { id: 'callPolice', label: 'Call Police' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8 max-w-md mx-auto">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-6 text-sm">
        <span className="font-semibold">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/setting')}
        className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-6 hover:bg-gray-400 active:scale-95 transition-all"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">3-Tap</h1>

      {/* Toggle Options */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`px-6 py-5 flex items-center justify-between ${
              index !== options.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <span className="text-base font-medium text-gray-900">{option.label}</span>
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

export default ThreeTapSetting

