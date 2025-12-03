import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  const [tapCount, setTapCount] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [threeTapMode, setThreeTapMode] = useState(false)
  const [safeWordMode, setSafeWordMode] = useState(false)
  const [currentLocation] = useState('600NWhisman, California')
  const [transcript, setTranscript] = useState('')
  const [safeWords, setSafeWords] = useState([])
  const recognitionRef = useRef(null)

  // Load safe words from localStorage
  useEffect(() => {
    const loadSafeWords = () => {
      const saved = JSON.parse(localStorage.getItem('safeWords') || '[]')
      const activeSafeWords = saved.filter(sw => sw.activate).map(sw => sw.word.toLowerCase())
      setSafeWords(activeSafeWords)
    }
    loadSafeWords()
    
    // Listen for storage changes
    window.addEventListener('storage', loadSafeWords)
    return () => window.removeEventListener('storage', loadSafeWords)
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
        
        const currentTranscript = (finalTranscript || interimTranscript).toLowerCase()
        setTranscript(currentTranscript)
        
        // Check if any safe word is detected
        const savedSafeWords = JSON.parse(localStorage.getItem('safeWords') || '[]')
        for (const sw of savedSafeWords) {
          if (sw.activate && currentTranscript.includes(sw.word.toLowerCase())) {
            console.log(`🚨 Safe word detected: "${sw.word}"`)
            recognition.stop()
            setIsListening(false)
            
            // Navigate to emergency alert page with safe word settings
            navigate('/emergency-alert', {
              state: {
                triggerType: 'safe-word',
                safeWord: sw,
                settings: {
                  notifyEmergencyContact: sw.notifyEmergencyContact,
                  notifyNearby: sw.notifyNearby,
                  callPolice: sw.callPolice,
                }
              }
            })
            break
          }
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice recognition.')
        }
        setIsListening(false)
      }
      
      recognition.onend = () => {
        // Restart if still in listening mode
        if (isListening && safeWordMode) {
          try {
            recognition.start()
          } catch (e) {
            console.log('Recognition already started')
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
  }, [safeWords, isListening, safeWordMode])

  // Handle 3-tap mode
  useEffect(() => {
    if (tapCount === 3 && threeTapMode) {
      // Get 3-tap settings
      const threeTapSettings = JSON.parse(localStorage.getItem('threeTapSettings') || '{}')
      
      // Save to alert history
      const history = JSON.parse(localStorage.getItem('alertHistory') || '[]')
      history.unshift({
        type: '3-tap',
        location: currentLocation,
        timestamp: Date.now(),
        status: 'active',
        reason: '3-Tap activated'
      })
      localStorage.setItem('alertHistory', JSON.stringify(history.slice(0, 50)))
      
      // Navigate to emergency alert page
      navigate('/emergency-alert', {
        state: {
          triggerType: '3-tap',
          settings: {
            notifyEmergencyContact: threeTapSettings.notifyEmergencyContact ?? true,
            notifyNearby: threeTapSettings.notifyNearby ?? true,
            callPolice: threeTapSettings.callPolice ?? true,
          }
        }
      })
      setTapCount(0)
    }
    
    // Reset tap count after 2 seconds
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 2000)
      return () => clearTimeout(timer)
    }
  }, [tapCount, threeTapMode, navigate, currentLocation])

  const handleSOSTap = () => {
    if (threeTapMode) {
      setTapCount(prev => prev + 1)
    } else {
      // Direct SOS tap - go to emergency alert
      // Read 3-tap settings from localStorage
      const threeTapSettings = JSON.parse(localStorage.getItem('threeTapSettings') || '{}')
      
      const history = JSON.parse(localStorage.getItem('alertHistory') || '[]')
      history.unshift({
        type: 'manual',
        location: currentLocation,
        timestamp: Date.now(),
        status: 'active',
        reason: 'SOS Button pressed'
      })
      localStorage.setItem('alertHistory', JSON.stringify(history.slice(0, 50)))
      
      navigate('/emergency-alert', {
        state: {
          triggerType: '3-tap',
          settings: {
            notifyEmergencyContact: threeTapSettings.notifyEmergencyContact ?? true,
            notifyNearby: threeTapSettings.notifyNearby ?? true,
            callPolice: threeTapSettings.callPolice ?? true,
          }
        }
      })
    }
  }

  const toggleListening = () => {
    if (!safeWordMode) {
      alert('Please enable Safe Word mode first')
      return
    }
    
    if (safeWords.length === 0) {
      alert('No active safe words found. Please add safe words in Settings.')
      return
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }
    
    if (!isListening) {
      // Start listening
      try {
        recognitionRef.current?.start()
        setIsListening(true)
        setTranscript('')
        console.log('🎤 Started listening for safe words:', safeWords)
      } catch (e) {
        console.error('Failed to start recognition:', e)
      }
    } else {
      // Stop listening
      recognitionRef.current?.stop()
      setIsListening(false)
      setTranscript('')
      console.log('🛑 Stopped listening')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 pt-4 pb-8">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-6 text-sm">
        <span className="font-semibold">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

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
      <div className="mb-8">
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
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-3xl p-8 mb-8 flex flex-col items-center relative overflow-hidden">
        {/* SOS Button Container with centered rings */}
        <div className="relative flex items-center justify-center">
          {/* Background decoration - centered on button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-72 h-72 rounded-full border border-dashed border-gray-300 opacity-30"></div>
            <div className="absolute w-80 h-80 rounded-full border border-dashed border-gray-200 opacity-20"></div>
          </div>
          
          {/* Pulsing rings when listening - centered on button */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-60 h-60 rounded-full border-2 border-red-300 animate-ping opacity-20"></div>
              <div className="absolute w-68 h-68 rounded-full border-2 border-red-200 animate-pulse opacity-30" style={{ width: '17rem', height: '17rem' }}></div>
            </div>
          )}
          
          <button 
            onClick={handleSOSTap}
            className={`relative w-52 h-52 rounded-full flex items-center justify-center transform transition-all duration-300 active:scale-95 z-10 ${
              isListening ? 'animate-glow' : ''
            }`}
            style={{
              background: 'linear-gradient(145deg, #ff6b6b, #ee5a5a)',
              boxShadow: isListening 
                ? '0 25px 50px rgba(255, 107, 107, 0.5), inset 0 -8px 20px rgba(0, 0, 0, 0.15), inset 0 8px 20px rgba(255, 255, 255, 0.1)'
                : '0 20px 40px rgba(255, 107, 107, 0.35), inset 0 -8px 20px rgba(0, 0, 0, 0.15), inset 0 8px 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Inner ring */}
            <div className="absolute inset-3 rounded-full" style={{
              background: 'linear-gradient(145deg, #ff7b7b, #ff6b6b)',
              boxShadow: 'inset 0 4px 10px rgba(255, 255, 255, 0.2)'
            }}></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-white text-5xl font-extrabold tracking-wider mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                SOS
              </div>
              <div className="text-white/90 text-sm font-medium">
                {threeTapMode && tapCount > 0 ? (
                  <span className="text-lg font-bold">{tapCount}/3</span>
                ) : (
                  isListening ? '🎤 Listening...' : 'Tap to alert'
                )}
              </div>
            </div>
          </button>
        </div>
        
        {/* Voice Recognition Status */}
        {isListening && (
          <div className="mt-5 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg border border-white/50">
            <p className="text-sm text-gray-600 text-center font-medium">
              {transcript ? (
                <>Heard: <span className="text-green-600">"{transcript}"</span></>
              ) : (
                <span className="text-gray-500">🎧 Say your safe word...</span>
              )}
            </p>
          </div>
        )}
        
        <p className="text-gray-500 text-sm mt-6 text-center font-medium relative z-10">
          Tap 3 times or say your phrase to activate SOS
        </p>
      </div>

      {/* Activation Methods */}
      <div className="mb-8">
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
            onClick={() => setThreeTapMode(!threeTapMode)}
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              isListening ? 'bg-green-200 animate-pulse' : 'bg-accent'
            }`}>
              {isListening ? '🎤' : '🗣️'}
            </div>
            <div>
              <span className="font-semibold text-gray-800">Safe Word:</span>
              {isListening && (
                <p className="text-xs text-green-600">Listening...</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => {
              if (!safeWordMode) {
                // Check browser support
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
                if (!SpeechRecognition) {
                  alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
                  return
                }
                // Check if there are active safe words
                const saved = JSON.parse(localStorage.getItem('safeWords') || '[]')
                const active = saved.filter(sw => sw.activate)
                if (active.length === 0) {
                  alert('Please add and activate at least one safe word in Settings first.')
                  return
                }
                setSafeWords(active.map(sw => sw.word.toLowerCase()))
                setSafeWordMode(true)
                // Start listening
                setTimeout(() => {
                  try {
                    recognitionRef.current?.start()
                    setIsListening(true)
                    console.log('🎤 Started listening for safe words')
                  } catch (e) {
                    console.error('Failed to start:', e)
                  }
                }, 100)
              } else {
                // Stop listening
                recognitionRef.current?.stop()
                setIsListening(false)
                setSafeWordMode(false)
                setTranscript('')
                console.log('🛑 Stopped listening')
              }
            }}
            className={`font-bold text-sm px-3 py-1 rounded ${
              safeWordMode ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {safeWordMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home

