import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const THREE_TAP_KEY = 'home_threeTapMode'
const SAFE_WORD_KEY = 'home_safeWordMode'

function Home() {
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
  const [hasContacts, setHasContacts] = useState(null) // null = unknown, true/false once loaded
  
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const safeWordsRef = useRef([])
  const triggerSOSRef = useRef(null)

  // Keep refs in sync with state
  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    safeWordsRef.current = safeWords
  }, [safeWords])

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

  // Load safe words from backend API
  useEffect(() => {
    const loadSafeWords = async () => {
      try {
        const res = await api.get('/safe-words')
        if (!res.ok) return
        const data = await res.json()
        console.log('Loaded safe words from API:', data)
        setSafeWords(data)
      } catch (error) {
        console.log('Failed to load safe words:', error)
      }
    }
    
    loadSafeWords()
  }, [])

  // Check if user has at least one emergency contact configured
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await api.get('/contacts')
        if (!res.ok) return
        const data = await res.json()
        setHasContacts(Array.isArray(data) && data.length > 0)
      } catch {
        // ignore – SOS can still be sent
      }
    }

    loadContacts()
  }, [])

  // Reverse geocoding - convert coordinates to address
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          }
        }
      )
      const data = await response.json()
      
      if (data && data.address) {
        const addr = data.address
        // Build a readable address
        const parts = []
        
        // Street address
        if (addr.house_number && addr.road) {
          parts.push(`${addr.house_number} ${addr.road}`)
        } else if (addr.road) {
          parts.push(addr.road)
        } else if (addr.building || addr.amenity) {
          parts.push(addr.building || addr.amenity)
        }
        
        // City/Town
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood
        if (city) {
          parts.push(city)
        }
        
        // State/Region (abbreviated if possible)
        if (addr.state) {
          // Common US state abbreviations
          const stateAbbr = {
            'California': 'CA', 'New York': 'NY', 'Texas': 'TX', 'Florida': 'FL',
            'Pennsylvania': 'PA', 'Illinois': 'IL', 'Ohio': 'OH', 'Georgia': 'GA',
            'North Carolina': 'NC', 'Michigan': 'MI', 'New Jersey': 'NJ', 'Virginia': 'VA',
            'Washington': 'WA', 'Arizona': 'AZ', 'Massachusetts': 'MA', 'Tennessee': 'TN',
            'Indiana': 'IN', 'Missouri': 'MO', 'Maryland': 'MD', 'Wisconsin': 'WI',
            'Colorado': 'CO', 'Minnesota': 'MN', 'South Carolina': 'SC', 'Alabama': 'AL',
            'Louisiana': 'LA', 'Kentucky': 'KY', 'Oregon': 'OR', 'Oklahoma': 'OK',
            'Connecticut': 'CT', 'Utah': 'UT', 'Iowa': 'IA', 'Nevada': 'NV',
            'Arkansas': 'AR', 'Mississippi': 'MS', 'Kansas': 'KS', 'New Mexico': 'NM',
            'Nebraska': 'NE', 'Idaho': 'ID', 'West Virginia': 'WV', 'Hawaii': 'HI',
            'New Hampshire': 'NH', 'Maine': 'ME', 'Montana': 'MT', 'Rhode Island': 'RI',
            'Delaware': 'DE', 'South Dakota': 'SD', 'North Dakota': 'ND', 'Alaska': 'AK',
            'Vermont': 'VT', 'Wyoming': 'WY', 'District of Columbia': 'DC'
          }
          parts.push(stateAbbr[addr.state] || addr.state)
        }
        
        if (parts.length > 0) {
          return parts.join(', ')
        }
        
        // Fallback to display_name if we couldn't parse
        return data.display_name.split(',').slice(0, 3).join(',')
      }
      
      return null
    } catch (error) {
      console.log('Geocoding error:', error)
      return null
    }
  }

  // Helper to get current location and send to backend
  const fetchAndSendLocation = () => {
    if (!navigator.geolocation) {
      setCurrentLocation('Location not available')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        
        // First show coordinates while fetching address
        setCurrentLocation('Getting address...')
        
        // Try to get readable address
        const address = await getAddressFromCoords(latitude, longitude)
        if (address) {
          setCurrentLocation(address)
        } else {
          // Fallback to coordinates if geocoding fails
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }

        // Send location to backend
        api.post('/location', { lat: latitude, lng: longitude }).catch(() => {})
      },
      () => {
        setCurrentLocation('Location permission denied')
      }
    )
  }

  // Get current location once and send to backend
  useEffect(() => {
    fetchAndSendLocation()
  }, [])

  // Define triggerSOS first and store in ref
  const triggerSOS = useCallback(async (type, safeWord = null) => {
    // Warn user if no emergency contacts are set
    if (hasContacts === false) {
      const proceed = window.confirm(
        'You have not set any emergency contacts yet. SOS will be sent without notifying personal contacts. Do you want to continue?'
      )
      if (!proceed) {
        return
      }
    }

    console.log('🚨 triggerSOS called:', type, safeWord)
    
    // Stop listening when SOS is triggered
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log('Stop recognition error:', e)
      }
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
      const threeTapSettings = JSON.parse(localStorage.getItem('threeTapSettings') || '{}')
      settings = {
        notifyEmergencyContact: threeTapSettings.notifyEmergencyContact ?? true,
        notifyNearby: threeTapSettings.notifyNearby ?? true,
        callPolice: threeTapSettings.callPolice ?? true,
      }
    } else if (type === 'safe-word' && safeWord) {
      settings = {
        notifyEmergencyContact: safeWord.notifyEmergencyContact ?? true,
        notifyNearby: safeWord.notifyNearby ?? true,
        callPolice: safeWord.callPolice ?? true,
      }
    }

    // Also send to backend
    if (coords) {
      try {
        await api.post('/sos', {
          lat: coords.lat,
          lng: coords.lng,
          type,
          locationText: currentLocation,
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
  }, [coords, currentLocation, navigate, hasContacts])

  // Keep triggerSOS ref updated
  useEffect(() => {
    triggerSOSRef.current = triggerSOS
  }, [triggerSOS])

  // Initialize Speech Recognition - only once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.log('Speech Recognition not supported')
      return
    }

    console.log('Initializing Speech Recognition...')
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      console.log('🎤 Speech recognition started')
    }
    
    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += text
        } else {
          interimTranscript += text
        }
      }
      
      const fullTranscript = (finalTranscript || interimTranscript).toLowerCase().trim()
      console.log('🗣️ Heard:', fullTranscript)
      setTranscript(fullTranscript)
      
      // Check if any safe word was spoken - use ref for latest value
      const currentSafeWords = safeWordsRef.current
      // Check both 'activate' (from backend) and 'enabled' fields
      const activeSafeWords = currentSafeWords.filter(sw => sw.activate !== false && sw.enabled !== false)
      
      console.log('Checking against safe words:', activeSafeWords.map(sw => sw.word))
      
      for (const sw of activeSafeWords) {
        if (fullTranscript.includes(sw.word.toLowerCase())) {
          console.log('✅ Safe word detected:', sw.word)
          // Use ref to get latest triggerSOS function
          if (triggerSOSRef.current) {
            triggerSOSRef.current('safe-word', sw)
          }
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
        setIsListening(false)
      } else if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...')
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted')
      }
    }
    
    recognition.onend = () => {
      console.log('Speech recognition ended, isListening:', isListeningRef.current)
      // Restart if still in listening mode - use ref for latest value
      if (isListeningRef.current) {
        console.log('Restarting recognition...')
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            console.log('Recognition restart failed:', e)
          }
        }, 100)
      }
    }
    
    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // ignore
        }
      }
    }
  }, []) // Empty dependency - only initialize once

  useEffect(() => {
    if (tapCount === 3 && threeTapMode) {
      triggerSOS('3-tap')
      setTapCount(0)
    }
    
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 2000)
      return () => clearTimeout(timer)
    }
  }, [tapCount, threeTapMode, triggerSOS])

  const handleSOSTap = () => {
    if (threeTapMode) {
      setTapCount(prev => prev + 1)
    } else {
      triggerSOS('direct')
    }
  }

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
        message: 'Voice recognition not supported in this browser. Try Chrome or Edge.'
      })
      return
    }

    // Check if we have safe words
    if (safeWords.length === 0) {
      setSosStatus({
        type: 'error',
        message: 'Please add safe words in Settings first'
      })
      return
    }
    
    if (isListening) {
      console.log('Stopping listening...')
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log('Stop error:', e)
      }
      setIsListening(false)
      setTranscript('')
    } else {
      console.log('Starting listening...')
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        console.error('Failed to start recognition:', e)
        setSosStatus({
          type: 'error',
          message: 'Failed to start voice recognition. Please try again.'
        })
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
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // ignore
        }
        setIsListening(false)
      }
      return next
    })
  }

  const handleRefreshLocation = () => {
    // Allow user to retry location or re-open browser permission dialog
    fetchAndSendLocation()
  }

  // Poll backend for nearby alerts
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/alerts')
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1]
          setNearbyAlert(latest)
          setShowNearbyModal(true)
        }
      } catch {
        // ignore - api.js handles 401
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Auto-hide SOS status after a few seconds
  useEffect(() => {
    if (!sosStatus) return
    const t = setTimeout(() => setSosStatus(null), 5000)
    return () => clearTimeout(t)
  }, [sosStatus])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 pt-4 pb-24 flex flex-col justify-start">

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
            <img 
              src="/logo.png" 
              alt="SilentSOS" 
              className="w-full h-full object-contain"
            />
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
                {isListening && safeWords.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Safe words: {safeWords.filter(sw => sw.enabled !== false).map(sw => sw.word).join(', ')}
                  </p>
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


