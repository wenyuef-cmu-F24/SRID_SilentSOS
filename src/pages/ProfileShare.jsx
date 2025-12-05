import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProfileShare() {
  const navigate = useNavigate()
  const [shareMethod, setShareMethod] = useState('')

  const handleShare = (method) => {
    setShareMethod(method)
    const contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]')
    const contactsText = contacts.map(c => `${c.name}: ${c.phone}`).join('\n')
    const message = `My Emergency Contacts:\n\n${contactsText}\n\nShared from SilentSOS`
    
    if (method === 'sms') {
      window.location.href = `sms:?body=${encodeURIComponent(message)}`
    } else if (method === 'email') {
      window.location.href = `mailto:?subject=My Emergency Contacts&body=${encodeURIComponent(message)}`
    } else if (method === 'copy') {
      navigator.clipboard.writeText(message)
      alert('Contact information copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8 max-w-md mx-auto">

      {/* Back Button */}
      <button 
        onClick={() => navigate('/setting/profile')}
        className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-6 hover:bg-gray-400 active:scale-95 transition-all"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Share Emergency Contact Info</h1>
      <p className="text-gray-600 mb-8">Choose how you want to share your emergency contacts</p>

      {/* Share Options */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleShare('sms')}
          className="w-full bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:bg-gray-50 active:scale-98 transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
            💬
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-gray-900">Send via SMS</h3>
            <p className="text-sm text-gray-500">Share through text message</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => handleShare('email')}
          className="w-full bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:bg-gray-50 active:scale-98 transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
            📧
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-gray-900">Send via Email</h3>
            <p className="text-sm text-gray-500">Share through email</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => handleShare('copy')}
          className="w-full bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:bg-gray-50 active:scale-98 transition-all"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
            📋
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-gray-900">Copy to Clipboard</h3>
            <p className="text-sm text-gray-500">Copy and share anywhere</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Sharing your emergency contact information helps keep your loved ones informed about who to reach in case of an emergency.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileShare

