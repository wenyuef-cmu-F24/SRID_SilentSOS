import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

function ProfileEdit() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile')
        if (!res.ok) return
        const data = await res.json()
        setProfile({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
        })
      } catch {
        // ignore - api.js handles 401
      }
    }
    fetchProfile()
  }, [])

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!profile.name.trim()) {
      alert('Please enter your name')
      return
    }
    if (!profile.email.trim()) {
      alert('Please enter your email')
      return
    }
    
    try {
      const res = await api.put('/profile', profile)
      if (!res.ok) {
        alert('Failed to save profile')
        return
      }
      alert('Profile saved successfully!')
      navigate('/setting/profile')
    } catch {
      alert('Failed to save profile')
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5 mb-6">
        {/* Name */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter your name"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Phone Number</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter your email"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-white rounded-3xl shadow-md py-4 text-gray-700 font-semibold text-lg hover:bg-gray-50 active:scale-98 transition-all"
      >
        Save
      </button>
    </div>
  )
}

export default ProfileEdit
