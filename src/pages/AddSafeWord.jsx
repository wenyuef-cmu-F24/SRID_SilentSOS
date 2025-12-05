import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api'

function AddSafeWord() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    word: '',
    notifyEmergencyContact: false,
    notifyNearby: false,
    callPolice: false,
  })

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSave = () => {
    if (!formData.word.trim()) {
      alert('Please enter a safe word')
      return
    }

    const save = async () => {
      try {
        const res = await fetch(`${API_BASE}/safe-words`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            word: formData.word.trim(),
            notifyEmergencyContact: formData.notifyEmergencyContact,
            notifyNearby: formData.notifyNearby,
            callPolice: formData.callPolice,
          }),
        })
        if (!res.ok) {
          alert('Failed to save safe word')
          return
        }
        navigate('/setting/safe-word')
      } catch {
        alert('Failed to save safe word')
      }
    }

    save()
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
        onClick={() => navigate('/setting/safe-word')}
        className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-6 hover:bg-gray-400 active:scale-95 transition-all"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Add New Safe Word</h1>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-8">
        {/* Safe Word Input */}
        <div className="px-6 py-5 border-b border-gray-100">
          <label className="block text-sm text-gray-500 mb-2">Safe Word:</label>
          <input
            type="text"
            value={formData.word}
            onChange={(e) => setFormData({ ...formData, word: e.target.value })}
            className="w-full text-base font-medium text-gray-900 outline-none"
            placeholder="Negative Zero"
          />
        </div>

        {/* Toggle Options */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <span className="text-base text-gray-900">Notify Emergency Contact</span>
          <button
            onClick={() => handleToggle('notifyEmergencyContact')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              formData.notifyEmergencyContact ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                formData.notifyEmergencyContact ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <span className="text-base text-gray-900">Notify Nearby</span>
          <button
            onClick={() => handleToggle('notifyNearby')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              formData.notifyNearby ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                formData.notifyNearby ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-base text-gray-900">Call Police</span>
          <button
            onClick={() => handleToggle('callPolice')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              formData.callPolice ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                formData.callPolice ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
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

export default AddSafeWord

