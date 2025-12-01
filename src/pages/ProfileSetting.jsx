import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api'

function ProfileSetting() {
  const navigate = useNavigate()
  const { clearAuth, token, user } = useAuth()
  const [profile, setProfile] = useState({
    name: 'Name',
    email: 'Email',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) return
        const data = await res.json()
        setProfile({
          name: data.name || user?.name || 'Name',
          email: data.email || user?.email || 'Email',
        })
      } catch {
        // ignore for now
      }
    }
    if (token) {
      fetchProfile()
    }
  }, [token, user])

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      clearAuth()
      alert('Signed out successfully!')
      navigate('/')
    }
  }

  const menuItems = [
    { id: 1, title: 'Name, Phone Number, Email', path: '/setting/profile/edit' },
    { id: 2, title: 'Password and Safety', path: '/setting/profile/security' },
    { id: 3, title: 'Emergency Alert History', path: '/setting/profile/history' },
    { id: 4, title: 'Share Emergency Contact Info', path: '/setting/profile/share' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8 max-w-md mx-auto">
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
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>

      {/* Profile Avatar and Info */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 bg-gray-300 rounded-full mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
        <p className="text-gray-600">{profile.email}</p>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border-2 border-blue-400 mb-8">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors ${
              index !== menuItems.length - 1 ? 'border-b-2 border-dashed border-blue-300' : ''
            }`}
          >
            <span className="text-base font-medium text-gray-900">{item.title}</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        className="w-full bg-white rounded-3xl shadow-sm py-4 text-red-500 font-semibold text-lg hover:bg-gray-50 active:scale-98 transition-all"
      >
        Sign Out
      </button>
    </div>
  )
}

export default ProfileSetting

