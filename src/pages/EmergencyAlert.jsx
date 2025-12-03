import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function EmergencyAlert() {
  const navigate = useNavigate()
  const location = useLocation()
  const { triggerType, safeWord, settings } = location.state || {}
  
  const [completedTasks, setCompletedTasks] = useState({
    notifyEmergencyContact: false,
    notifyNearby: false,
    callPolice: false,
  })
  const [showRadar, setShowRadar] = useState(false)
  const [contacts, setContacts] = useState([])
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Load emergency contacts
  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]')
    setContacts(savedContacts.slice(0, 3)) // Show max 3 contacts
  }, [])

  // Simulate completing tasks one by one (faster)
  useEffect(() => {
    if (settings) {
      const tasks = []
      if (settings.notifyEmergencyContact) tasks.push('notifyEmergencyContact')
      if (settings.notifyNearby) tasks.push('notifyNearby')
      if (settings.callPolice) tasks.push('callPolice')

      // If no tasks, show radar immediately
      if (tasks.length === 0) {
        setTimeout(() => setShowRadar(true), 300)
        return
      }

      tasks.forEach((task, index) => {
        setTimeout(() => {
          setCompletedTasks(prev => ({ ...prev, [task]: true }))
          
          // After all tasks completed, show radar view
          if (index === tasks.length - 1) {
            setTimeout(() => setShowRadar(true), 600)
          }
        }, (index + 1) * 800)
      })
    }
  }, [triggerType, settings])

  const handleCancelClick = () => {
    setShowCancelModal(true)
  }

  const handleConfirmCancel = () => {
    setShowCancelModal(false)
    navigate('/')
  }

  const handleCloseModal = () => {
    setShowCancelModal(false)
  }

  // Cancel Confirmation Modal
  const CancelModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCloseModal}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm transform animate-bounce-in">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Cancel Emergency Alert?
        </h3>
        
        {/* Description */}
        <p className="text-gray-500 text-center text-sm mb-6">
          Are you sure you want to cancel? Your emergency contacts and services will be notified that you are safe.
        </p>
        
        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleConfirmCancel}
            className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-4 rounded-2xl hover:from-green-500 hover:to-green-600 active:scale-[0.98] transition-all shadow-lg shadow-green-200/50"
          >
            Yes, I'm Safe
          </button>
          <button
            onClick={handleCloseModal}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            Keep Alert Active
          </button>
        </div>
      </div>
    </div>
  )

  // Show checklist view (for both safe-word and 3-tap)
  if (!showRadar) {
    return (
      <div className="min-h-screen max-w-md mx-auto relative overflow-hidden">
        {/* Beautiful orange gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-100 to-orange-200">
          {/* Animated concentric circles */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4">
            <div className="w-[600px] h-[600px] rounded-full border border-dashed border-orange-300/40 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-dashed border-orange-300/50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-dashed border-orange-300/60"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full bg-gradient-to-br from-orange-300/60 to-orange-400/60 blur-sm"></div>
          </div>
          {/* Extra glow effect */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pt-8 pb-8 min-h-screen flex flex-col">
          {/* Status Bar */}
          <div className="flex justify-between items-center mb-12 text-sm">
            <span className="font-semibold">9:41</span>
            <div className="flex gap-1">
              <span>📶</span>
              <span>📡</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Emergency mode Activated by<br />
              {triggerType === '3-tap' ? '3-Tap' : `Safeword: ${safeWord?.word || 'Unknown'}`}
            </h1>
            <p className="text-gray-600 text-sm">
              Please stand by, we are currently requesting for help.
            </p>
          </div>

          {/* Completed Section - Now in center */}
          <div className="mb-8">
            <p className="text-xs text-gray-600 font-bold mb-4 tracking-widest uppercase">Completed</p>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/50">
              {/* Notify Emergency Contacts */}
              {settings?.notifyEmergencyContact && (
                <div className={`px-5 py-4 flex items-center gap-4 border-b border-gray-100/80 transition-all duration-500 ${
                  completedTasks.notifyEmergencyContact ? 'bg-green-50/50' : ''
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    completedTasks.notifyEmergencyContact 
                      ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-200' 
                      : 'border-2 border-gray-300 bg-white'
                  }`}>
                    {completedTasks.notifyEmergencyContact && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`font-medium transition-colors duration-500 ${
                    completedTasks.notifyEmergencyContact ? 'text-green-700' : 'text-gray-600'
                  }`}>Notify Emergency Contacts</span>
                </div>
              )}

              {/* Notify Nearby */}
              {settings?.notifyNearby && (
                <div className={`px-5 py-4 flex items-center gap-4 border-b border-gray-100/80 transition-all duration-500 ${
                  completedTasks.notifyNearby ? 'bg-green-50/50' : ''
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    completedTasks.notifyNearby 
                      ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-200' 
                      : 'border-2 border-gray-300 bg-white'
                  }`}>
                    {completedTasks.notifyNearby && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`font-medium transition-colors duration-500 ${
                    completedTasks.notifyNearby ? 'text-green-700' : 'text-gray-600'
                  }`}>Notify Nearby</span>
                </div>
              )}

              {/* Call Police */}
              {settings?.callPolice && (
                <div className={`px-5 py-4 flex items-center gap-4 transition-all duration-500 ${
                  completedTasks.callPolice ? 'bg-green-50/50' : ''
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    completedTasks.callPolice 
                      ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-200' 
                      : 'border-2 border-gray-300 bg-white'
                  }`}>
                    {completedTasks.callPolice && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`font-medium transition-colors duration-500 ${
                    completedTasks.callPolice ? 'text-green-700' : 'text-gray-600'
                  }`}>Call Police</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1"></div>

          {/* Cancel Button */}
          <button
            onClick={handleCancelClick}
            className="w-full bg-gradient-to-r from-red-400 to-rose-400 text-white font-bold py-4 rounded-2xl hover:from-red-500 hover:to-rose-500 active:scale-[0.98] transition-all shadow-lg shadow-red-200/50"
          >
            CANCEL
          </button>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && <CancelModal />}
      </div>
    )
  }

  // Show radar view (for 3-tap or after safe word tasks complete)
  return (
    <div className="min-h-screen max-w-md mx-auto relative overflow-hidden">
      {/* Beautiful orange gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-100 to-orange-200"></div>

      {/* Content */}
      <div className="relative z-10 px-6 pt-8 pb-8 min-h-screen flex flex-col">
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-8 text-sm">
          <span className="font-semibold">9:41</span>
          <div className="flex gap-1">
            <span>📶</span>
            <span>📡</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Emergency mode Activated by<br />
            {triggerType === '3-tap' ? '3-Tap' : `Safeword: ${safeWord?.word || 'Unknown'}`}
          </h1>
          <p className="text-gray-600 text-sm">
            Your emergency contacts and nearby riders will see your call for help
          </p>
        </div>

        {/* Radar View with Contacts */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Concentric circles - centered on SOS button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-[400px] h-[400px] rounded-full border border-dashed border-orange-300/40 animate-pulse"></div>
            <div className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-orange-300/50"></div>
            <div className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-orange-300/60"></div>
            {/* Extra glow effect */}
            <div className="absolute w-64 h-64 bg-orange-300/15 rounded-full blur-3xl"></div>
          </div>

          {/* Contact avatars around the SOS button */}
          {contacts.length > 0 && (
            <>
              {/* Contact 1 - Top Left */}
              <div className="absolute top-4 left-6 flex flex-col items-center animate-float" style={{ animationDelay: '0s' }}>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-2xl">
                  👤
                </div>
                <span className="text-xs text-gray-700 mt-2 font-medium bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">{contacts[0]?.name || 'Contact 1'}</span>
              </div>

              {/* Contact 2 - Right */}
              {contacts.length > 1 && (
                <div className="absolute top-20 right-6 flex flex-col items-center animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <span className="text-xs text-gray-700 mt-2 font-medium bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">{contacts[1]?.name || 'Contact 2'}</span>
                </div>
              )}

              {/* Contact 3 - Bottom */}
              {contacts.length > 2 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-float" style={{ animationDelay: '1s' }}>
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <span className="text-xs text-gray-700 mt-2 font-medium bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">{contacts[2]?.name || 'Contact 3'}</span>
                </div>
              )}
            </>
          )}

          {/* SOS Button in center */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow ring - centered */}
            <div className="absolute w-52 h-52 rounded-full bg-red-400/15 animate-pulse"></div>
            <div className="absolute w-60 h-60 rounded-full bg-red-300/10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            <div className="w-44 h-44 rounded-full bg-white shadow-2xl flex items-center justify-center relative z-10">
              <div className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg animate-glow"
                style={{
                  background: 'linear-gradient(145deg, #ff6b6b, #ee5a5a)',
                  boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4), inset 0 -5px 15px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="text-white text-4xl font-extrabold tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>SOS</span>
              </div>
            </div>
            
            {/* Pulsing rings - centered */}
            <div className="absolute w-44 h-44 rounded-full border-4 border-red-400/30 animate-ping"></div>
            <div className="absolute w-48 h-48 rounded-full border-2 border-red-300/20 animate-ping" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={handleCancelClick}
          className="w-full bg-gradient-to-r from-red-400 to-rose-400 text-white font-bold py-4 rounded-2xl hover:from-red-500 hover:to-rose-500 active:scale-[0.98] transition-all shadow-lg shadow-red-200/50 mt-8"
        >
          CANCEL
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && <CancelModal />}
    </div>
  )
}

export default EmergencyAlert
