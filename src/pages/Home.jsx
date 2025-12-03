import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api'

const THREE_TAP_KEY = 'home_threeTapMode'
const SAFE_WORD_KEY = 'home_safeWordMode'

function Home() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [tapCount, setTapCount] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [threeTapMode, setThreeTapMode] = useState(false)
  const [safeWordMode, setSafeWordMode] = useState(false)
  const [currentLocation, setCurrentLocation] = useState('Detecting location…')
  const [coords, setCoords] = useState(null)
  const [nearbyAlert, setNearbyAlert] = useState(null)
  const [sosStatus, setSosStatus] = useState(null)
  const [showSosModal, setShowSosModal] = useState(false)
  const [showNearbyModal, setShowNearbyModal] = useState(false)
  const [safeWords, setSafeWords] = useState([])
  const [transcript, setTranscript] = useState('')
  
  const recognitionRef = useRef(null)

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

  // Load safe words from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('safeWords') || '[]')
    setSafeWords(saved)
  }, [])

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        const fullTranscript = (finalTranscript || interimTranscript).toLowerCase()
        setTranscript(fullTranscript)
        
        // Check if any safe word was spoken
        const activeSafeWords = safeWords.filter(sw => sw.enabled !== false)
        for (const sw of activeSafeWords) {
          if (fullTranscript.includes(sw.word.toLowerCase())) {
            triggerSOS('safe-word', sw)
            break
          }
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          setSosStatus({
            type: 'error',
            message: 'Microphone access denied. Please enable microphone permissions.'
          })
        }
      }
      
      recognition.onend = () => {
        // Restart if still in listening mode
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.log('Recognition restart failed:', e)
          }
        }
      }
      
      recognitionRef.current = recognition
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [safeWords, isListening])

  // Get current location once and send to backend
  useEffect(() => {
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
  }, [token])

  useEffect(() => {
    if (tapCount === 3 && threeTapMode) {
      triggerSOS('3-tap')
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
      triggerSOS('direct')
    }
  }

  const triggerSOS = useCallback(async (type, safeWord = null) => {
    // Stop listening when SOS is triggered
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)

    // Save alert to history
    const alertHistory = JSON.parse(localStorage.getItem('alertHistory') || '[]')
    alertHistory.push({
      id: Date.now(),
      type: type,
      safeWord: safeWord?.word || null,
      location: currentLocation,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('alertHistory', JSON.stringify(alertHistory))

    // Get settings based on trigger type
    let settings = {}
    if (type === '3-tap' || type === 'direct') {
      // Load 3-Tap settings
      const threeTapSettings = JSON.parse(localStorage.getItem('threeTapSettings') || '{}')
      settings = {
        notifyEmergencyContact: threeTapSettings.notifyEmergencyContact ?? true,
        notifyNearby: threeTapSettings.notifyNearby ?? true,
        callPolice: threeTapSettings.callPolice ?? true,
      }
    } else if (type === 'safe-word' && safeWord) {
      // Use safe word specific settings
      settings = {
        notifyEmergencyContact: safeWord.notifyEmergencyContact ?? true,
        notifyNearby: safeWord.notifyNearby ?? true,
        callPolice: safeWord.callPolice ?? true,
      }
    }

    // Also send to backend
    if (coords && token) {
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
      } catch (e) {
        console.log('Backend SOS notification failed:', e)
      }
    }

    // Navigate to EmergencyAlert page
    navigate('/emergency-alert', {
      state: {
        triggerType: type === 'direct' ? '3-tap' : type,
        safeWord: safeWord,
        settings: settings,
      }
    })
  }, [coords, currentLocation, token, navigate])

  const toggleListening = () => {
    if (!safeWordMode) {
      setSosStatus({
        type: 'error',
        message: 'Please enable Safe Word mode first'
      })
      return
    }
    
    if (!recognitionRef.current) {
      setSosStatus({
        type: 'error',
        message: 'Voice recognition not supported in this browser'
      })
      return
    }
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setTranscript('')
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        console.error('Failed to start recognition:', e)
      }
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
      if (!next && recognitionRef.current) {
        recognitionRef.current.stop()
        setIsListening(false)
      }
      return next
    })
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

  // Auto-hide SOS status after a few seconds
  useEffect(() => {
    if (!sosStatus) return
    const t = setTimeout(() => setSosStatus(null), 5000)
    return () => clearTimeout(t)
  }, [sosStatus])

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
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
          ⚡
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Current location</p>
          <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
            <span>📍</span>
            {currentLocation}
          </p>
        </div>
      </div>

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
        {/* Decorative background circles - positioned relative to SOS button */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-64 h-64 rounded-full border-2 border-dashed border-orange-300/30 animate-pulse"></div>
              <div className="absolute w-72 h-72 rounded-full border border-dashed border-orange-200/20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}
          
          {/* Pulsing rings when listening */}
          {isListening && (
            <>
              <div className="absolute w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-red-400/40 animate-ping"></div>
              <div className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border-2 border-red-300/30 animate-ping" style={{ animationDelay: '0.3s' }}></div>
            </>
          )}
          
          <button 
            onClick={handleSOSTap}
            className="relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center transform transition-transform active:scale-95 group z-10"
            style={{
              background: 'linear-gradient(145deg, #ff6b6b, #ee5a5a)',
              boxShadow: isListening
                ? '0 0 60px rgba(255, 107, 107, 0.5), 0 20px 60px rgba(255, 123, 123, 0.3), inset 0 -5px 20px rgba(0, 0, 0, 0.1)'
                : '0 20px 60px rgba(255, 123, 123, 0.3), inset 0 -5px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Inner highlight */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
            
            <div className="relative z-10 text-center">
              <div className="text-white text-5xl font-bold tracking-wider mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>SOS</div>
              <div className="text-white text-sm opacity-90">
                {threeTapMode && tapCount > 0 ? `${tapCount}/3` : (isListening ? 'Listening...' : 'Tap to Alert')}
              </div>
            </div>
          </button>
        </div>
        
        {/* Voice Recognition Status - glassmorphism style */}
        {safeWordMode && (
          <div className={`mt-6 px-6 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
            isListening 
              ? 'bg-green-500/10 border-green-300/50 shadow-lg shadow-green-200/30' 
              : 'bg-white/60 border-gray-200/50'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleListening}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-green-500 text-white animate-pulse shadow-lg shadow-green-300' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                🎤
              </button>
              <div>
                <p className={`text-sm font-semibold ${isListening ? 'text-green-700' : 'text-gray-600'}`}>
                  {isListening ? '🔴 Listening for safe words...' : 'Tap mic to start listening'}
                </p>
                {transcript && isListening && (
                  <p className="text-xs text-gray-500 mt-1 italic max-w-[200px] truncate">"{transcript}"</p>
                )}
              </div>
            </div>
          </div>
        )}
        
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
