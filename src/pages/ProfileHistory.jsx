import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

function ProfileHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get('/history')
        if (!res.ok) return
        const data = await res.json()
        setHistory(data)
      } catch {
        // ignore - api.js handles 401
      }
    }
    loadHistory()
  }, [])

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Emergency Alert History</h1>

      {/* Alert History List */}
      {history.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">No emergency alerts yet</p>
          <p className="text-gray-400 text-sm mt-2">Your SOS history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((alert, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  🚨
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {alert.type === '3-tap' ? '3-Tap Alert' : 'Safe Word Alert'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {alert.locationText || `Lat ${alert.lat?.toFixed?.(4)}, Lng ${alert.lng?.toFixed?.(4)}`}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(alert.timestamp)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  alert.status === 'resolved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {alert.status || 'sent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfileHistory
