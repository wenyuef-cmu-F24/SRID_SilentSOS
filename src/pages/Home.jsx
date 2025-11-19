import React, { useState, useEffect } from 'react'

function Home() {
  const [tapCount, setTapCount] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [threeTapMode, setThreeTapMode] = useState(false)
  const [safeWordMode, setSafeWordMode] = useState(false)
  const [currentLocation] = useState('600NWhisman, California')

  useEffect(() => {
    if (tapCount === 3 && threeTapMode) {
      triggerSOS()
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
      triggerSOS()
    }
  }

  const triggerSOS = () => {
    alert(`🚨 SOS Alert Triggered!\n\nLocation: ${currentLocation}\n\nEmergency services have been notified.`)
    setTapCount(0)
  }

  const toggleListening = () => {
    if (!safeWordMode) {
      alert('Please enable Safe Word mode in settings first')
      return
    }
    setIsListening(!isListening)
    if (!isListening) {
      // Simulating voice listening
      setTimeout(() => {
        const randomWords = ['help me', 'emergency', 'assistance']
        const heardWord = randomWords[Math.floor(Math.random() * randomWords.length)]
        console.log(`Listening for safe word... (heard: "${heardWord}")`)
      }, 1000)
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
      <div className="bg-gray-100 rounded-3xl p-8 mb-8 flex flex-col items-center">
        <button 
          onClick={handleSOSTap}
          className="relative w-56 h-56 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-2xl flex items-center justify-center transform transition-transform active:scale-95 group"
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
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-xl">
              🗣️
            </div>
            <span className="font-semibold text-gray-800">Safe Word:</span>
          </div>
          <button 
            onClick={() => setSafeWordMode(!safeWordMode)}
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

