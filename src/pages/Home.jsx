import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api'

const THREE_TAP_KEY = 'home_threeTapMode'
const SAFE_WORD_KEY = 'home_safeWordMode'

function Home() {
  const { token } = useAuth()
  const [tapCount, setTapCount] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [threeTapMode, setThreeTapMode] = useState(false)
  const [safeWordMode, setSafeWordMode] = useState(false)
  const [currentLocation, setCurrentLocation] = useState('Detecting location…')
  const [coords, setCoords] = useState(null)
  const [nearbyAlert, setNearbyAlert] = useState(null)
  const [sosStatus, setSosStatus] = useState(null) // { type: 'success' | 'error', message: string }
  const [showSosModal, setShowSosModal] = useState(false)
  const [showNearbyModal, setShowNearbyModal] = useState(false)
  const [hasSafeWord, setHasSafeWord] = useState(null) // null = unknown, true/false once loaded
  const [hasContacts, setHasContacts] = useState(null) // null = unknown, true/false once loaded
  const [pendingSosType, setPendingSosType] = useState(null) // '3-tap' | 'safe-word' | null
  const [showConfirmSosModal, setShowConfirmSosModal] = useState(false)

  // Restore 3-tap and safe word toggles when returning to Home
  useEffect(() => {
    const savedThreeTap = localStorage.getItem(THREE_TAP_KEY)
    const savedSafeWord = localStorage.getItem(SAFE_WORD_KEY)
    if (savedThreeTap !== null) {
      setThreeTapMode(savedThreeTap === 'true')
    }
    if (savedSafeWord !== null) {
      setSafeWordMode(savedSafeWord === 'true')
    }
  }, [])

  // Helper to get current location and send to backend
  const fetchAndSendLocation = () => {
    if (!token) return

    if (!navigator.geolocation) {
      setCurrentLocation('Location not available')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        setCurrentLocation(`Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`)

        fetch(`${API_BASE}/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        }).catch(() => {})
      },
      () => {
        setCurrentLocation('Location permission denied')
      }
    )
  }

  // Get current location once on load
  useEffect(() => {
    if (!token) return
    fetchAndSendLocation()
  }, [token])

  // Check if the user has at least one safe word configured
  useEffect(() => {
    if (!token) return

    const loadSafeWords = async () => {
      try {
        const res = await fetch(`${API_BASE}/safe-words`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setHasSafeWord(Array.isArray(data) && data.length > 0)
      } catch {
        // ignore network / parse errors – feature will just behave as before
      }
    }

    loadSafeWords()
  }, [token])

  // Check if the user has at least one emergency contact configured
  useEffect(() => {
    if (!token) return

    const loadContacts = async () => {
      try {
        const res = await fetch(`${API_BASE}/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setHasContacts(Array.isArray(data) && data.length > 0)
      } catch {
        // ignore network / parse errors – SOS can still be sent
      }
    }

    loadContacts()
  }, [token])

  useEffect(() => {
    if (tapCount === 3 && threeTapMode) {
      requestSosConfirmation('3-tap')
      setTapCount(0)
    }
    
    // Reset tap count after 2 seconds
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 2000)
      return () => clearTimeout(timer)
    }
  }, [tapCount, threeTapMode])

  const handleSOSTap = () => {
    if (threeTapMode) {
      setTapCount(prev => prev + 1)
    } else {
      requestSosConfirmation('3-tap')
    }
  }

  const requestSosConfirmation = (type) => {
    // If location is not ready, keep existing error behavior
    if (!coords) {
      setSosStatus({
        type: 'error',
        message: 'Location not available yet. Please enable location services.',
      })
      return
    }
    setPendingSosType(type || '3-tap')
    setShowConfirmSosModal(true)
  }

  const triggerSOS = async (type) => {
    if (hasContacts === false) {
      const proceed = window.confirm(
        'You have not set any emergency contacts yet. SOS will be sent without notifying personal contacts. Do you want to continue?'
      )
      if (!proceed) {
        return
      }
    }

    if (!coords) {
      setSosStatus({
        type: 'error',
        message: 'Location not available yet. Please enable location services.',
      })
      return
    }

    try {
      await fetch(`${API_BASE}/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lat: coords.lat,
          lng: coords.lng,
          type,
          locationText: currentLocation,
        }),
      })
      setSosStatus({
        type: 'success',
        message: 'SOS sent with your current location. Help will be notified based on your settings.',
      })
      setShowSosModal(true)
    } catch {
      setSosStatus({
        type: 'error',
        message: 'Failed to send SOS. Please try again.',
      })
      setShowSosModal(true)
    } finally {
      setTapCount(0)
    }
  }

  // Auto-hide SOS status after a few seconds
  useEffect(() => {
    if (!sosStatus) return
    const t = setTimeout(() => setSosStatus(null), 5000)
    return () => clearTimeout(t)
  }, [sosStatus])

  const toggleListening = () => {
    if (!safeWordMode) {
      alert('Please enable Safe Word mode in settings first')
      return
    }
    if (hasSafeWord === false) {
      alert('You have not set up any Safe Words yet. Please add a Safe Word in Settings before using voice activation.')
      return
    }
    setIsListening(!isListening)
    if (!isListening) {
      // Simulating voice listening
      setTimeout(() => {
        const randomWords = ['help me', 'emergency', 'assistance']
        const heardWord = randomWords[Math.floor(Math.random() * randomWords.length)]
        console.log(`Listening for safe word... (heard: "${heardWord}")`)
        // Demo: trigger SOS when we "hear" something
        requestSosConfirmation('safe-word')
      }, 1000)
    }
  }

  const toggleThreeTap = () => {
    setThreeTapMode(prev => {
      const next = !prev
      localStorage.setItem(THREE_TAP_KEY, String(next))
      return next
    })
  }

  const toggleSafeWord = () => {
    setSafeWordMode(prev => {
      const next = !prev
      localStorage.setItem(SAFE_WORD_KEY, String(next))
      return next
    })
  }

  const handleRefreshLocation = () => {
    // Let users retry location or re-open the browser permission prompt
    fetchAndSendLocation()
  }

  // Poll backend for nearby alerts
  useEffect(() => {
    if (!token) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          // Show the most recent alert
          const latest = data[data.length - 1]
          setNearbyAlert(latest)
          setShowNearbyModal(true)
        }
      } catch {
        // ignore
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 pt-4 pb-24 flex flex-col justify-start">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="font-semibold">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

      {/* Top alerts: SOS status + Nearby alert banner */}
      {sosStatus && (
        <div
          className={`mb-3 rounded-2xl px-4 py-3 text-sm flex items-start gap-2 ${
            sosStatus.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span className="text-lg">{sosStatus.type === 'success' ? '✅' : '⚠️'}</span>
          <div className="flex-1">{sosStatus.message}</div>
          <button
            onClick={() => setSosStatus(null)}
            className="text-xs font-semibold opacity-80 hover:opacity-100"
          >
            Close
          </button>
        </div>
      )}

      {nearbyAlert && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-800 flex justify-between items-center">
          <div>
            <div className="font-semibold">Nearby SOS alert</div>
            <div>Someone within 1 mile triggered SOS.</div>
          </div>
          <button
            onClick={() => setNearbyAlert(null)}
            className="text-xs font-semibold text-red-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Location Card */}
      <button
        type="button"
        onClick={handleRefreshLocation}
        className="w-full bg-white rounded-2xl shadow-sm p-4 mb-8 flex items-center justify-between gap-3 text-left hover:bg-gray-50 active:scale-[0.99] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
            ⚡
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Current location</p>
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
              <span>📍</span>
              {currentLocation}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Tap to refresh or enable location permission
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
          <span>Refresh</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5 9a7 7 0 0111.95-2.95M19 15a7 7 0 01-11.95 2.95" />
          </svg>
        </div>
      </button>

      {/* Main Content */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Are you in an<br />emergency?
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tap SOS or say your help word. SilentSOS listens quietly and alerts help with your live location.
            </p>
          </div>
          <div className="flex-shrink-0 w-32 h-32 mt-2">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Illustration of two people hugging */}
              <ellipse cx="100" cy="140" rx="60" ry="50" fill="#C8E6A0" opacity="0.6"/>
              <circle cx="85" cy="80" r="25" fill="#B4A5D6"/>
              <path d="M 85 105 Q 70 120 75 145" stroke="#A5C8FF" strokeWidth="20" fill="none" strokeLinecap="round"/>
              <circle cx="115" cy="75" r="22" fill="#3B3561"/>
              <path d="M 115 97 Q 130 115 125 140" stroke="#3B3561" strokeWidth="18" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* SOS Button */}
      <div className="bg-gray-100 rounded-3xl p-6 mb-6 flex flex-col items-center flex-shrink-0">
        <button 
          onClick={handleSOSTap}
          className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-2xl flex items-center justify-center transform transition-transform active:scale-95 group"
          style={{
            boxShadow: '0 20px 60px rgba(255, 123, 123, 0.3), inset 0 -5px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-300 to-red-400 opacity-60"></div>
          <div className="relative z-10 text-center">
            <div className="text-white text-5xl font-bold tracking-wider mb-2">SOS</div>
            <div className="text-white text-sm opacity-90">
              {threeTapMode && tapCount > 0 ? `${tapCount}/3` : 'Listening ...'}
            </div>
          </div>
        </button>
        
        <p className="text-gray-500 text-sm mt-6 text-center">
          Tap 3 times or say your phrase to activate SOS
        </p>
      </div>

      {/* Activation Methods */}
      <div className="mt-2 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activation Methods</h2>
        
        {/* 3-Tap Mode */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-xl">
              👆
            </div>
            <span className="font-semibold text-gray-800">3-Tap Mode:</span>
          </div>
          <button 
            onClick={toggleThreeTap}
            className={`font-bold text-sm px-3 py-1 rounded ${
              threeTapMode ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {threeTapMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Safe Word */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-xl">
              🗣️
            </div>
            <span className="font-semibold text-gray-800">Safe Word:</span>
          </div>
          <button 
            onClick={toggleSafeWord}
            className={`font-bold text-sm px-3 py-1 rounded ${
              safeWordMode ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {safeWordMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Full-screen modals for SOS sent / Nearby alert */}
      {showConfirmSosModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-80 max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="font-semibold text-gray-900 mb-2">Confirm SOS</h2>
            <p className="text-sm text-gray-700 mb-3">
              We will send an SOS alert with your current location and use your settings to notify contacts and nearby users.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Current location: {currentLocation}
            </p>
            <div className="flex gap-3 mt-1">
              <button
                className="flex-1 rounded-xl border border-gray-300 text-gray-700 py-2 text-sm font-semibold"
                onClick={() => {
                  setShowConfirmSosModal(false)
                  setPendingSosType(null)
                  setTapCount(0)
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 text-white py-2 text-sm font-semibold"
                onClick={() => {
                  if (pendingSosType) {
                    triggerSOS(pendingSosType)
                  } else {
                    triggerSOS('3-tap')
                  }
                  setShowConfirmSosModal(false)
                  setPendingSosType(null)
                }}
              >
                Send SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {sosStatus && showSosModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-80 max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{sosStatus.type === 'success' ? '✅' : '⚠️'}</span>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">
                  {sosStatus.type === 'success' ? 'SOS Sent' : 'SOS Failed'}
                </h2>
                <p className="text-sm text-gray-700">{sosStatus.message}</p>
              </div>
            </div>
            <button
              className="w-full mt-2 rounded-xl bg-gray-900 text-white py-2 text-sm font-semibold"
              onClick={() => setShowSosModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {nearbyAlert && showNearbyModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-80 max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Nearby SOS Alert</h2>
                <p className="text-sm text-gray-700">
                  Someone within about 1 mile has triggered SOS. Check your surroundings and stay safe.
                </p>
              </div>
            </div>
            <button
              className="w-full mt-2 rounded-xl bg-red-600 text-white py-2 text-sm font-semibold"
              onClick={() => setShowNearbyModal(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home

