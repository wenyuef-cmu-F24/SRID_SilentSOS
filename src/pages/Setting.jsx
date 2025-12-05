import React from 'react'
import { useNavigate } from 'react-router-dom'

function Setting() {
  const navigate = useNavigate()

  const settingsMenu = [
    { id: 1, title: 'Profile', path: '/setting/profile' },
    { id: 2, title: '3-Tap', path: '/setting/3-tap' },
    { id: 3, title: 'Safe Word', path: '/setting/safe-word' },
    { id: 4, title: 'Notifications', path: '/setting/notifications' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8">

      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Settings Menu */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-100">
        {settingsMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <span className="text-lg font-semibold text-gray-900">{item.title}</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-base">Detail</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Setting

