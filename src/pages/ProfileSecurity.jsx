import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProfileSecurity() {
  const navigate = useNavigate()
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert('Please fill in all fields')
      return
    }
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match')
      return
    }
    if (passwords.new.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    
    alert('Password changed successfully!')
    navigate('/setting/profile')
  }

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
        onClick={() => navigate('/setting/profile')}
        className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-6 hover:bg-gray-400 active:scale-95 transition-all"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Password and Safety</h1>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5 mb-6">
        {/* Current Password */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Current Password</label>
          <input
            type="password"
            value={passwords.current}
            onChange={(e) => handleInputChange('current', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter current password"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">New Password</label>
          <input
            type="password"
            value={passwords.new}
            onChange={(e) => handleInputChange('new', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter new password"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Confirm New Password</label>
          <input
            type="password"
            value={passwords.confirm}
            onChange={(e) => handleInputChange('confirm', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Confirm new password"
          />
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Your password must be at least 6 characters long and include a mix of letters and numbers for better security.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-white rounded-3xl shadow-md py-4 text-gray-700 font-semibold text-lg hover:bg-gray-50 active:scale-98 transition-all"
      >
        Save Changes
      </button>
    </div>
  )
}

export default ProfileSecurity

