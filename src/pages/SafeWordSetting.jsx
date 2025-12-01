import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api'

function SafeWordSetting() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [safeWords, setSafeWords] = useState([])

  useEffect(() => {
    const loadSafeWords = async () => {
      try {
        const res = await fetch(`${API_BASE}/safe-words`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setSafeWords(data)
      } catch {
        // ignore
      }
    }
    if (token) loadSafeWords()
  }, [token])

  const handleToggle = (wordId, field) => {
    const updated = safeWords.map(word => 
      word.id === wordId ? { ...word, [field]: !word[field] } : word
    )
    setSafeWords(updated)
    const target = updated.find(w => w.id === wordId)
    const save = async () => {
      try {
        await fetch(`${API_BASE}/safe-words/${wordId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(target),
        })
      } catch {
        // ignore
      }
    }
    save()
  }

  const handleEdit = (wordId) => {
    const word = safeWords.find(w => w.id === wordId)
    const newWord = prompt('Edit safe word:', word.word)
    if (newWord && newWord.trim()) {
      const updated = safeWords.map(w => 
        w.id === wordId ? { ...w, word: newWord.trim() } : w
      )
      setSafeWords(updated)
      const target = updated.find(w => w.id === wordId)
      const save = async () => {
        try {
          await fetch(`${API_BASE}/safe-words/${wordId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(target),
          })
        } catch {
          // ignore
        }
      }
      save()
    }
  }

  const handleDelete = (wordId) => {
    if (!window.confirm('Are you sure you want to delete this safe word?')) return
    const remove = async () => {
      try {
        await fetch(`${API_BASE}/safe-words/${wordId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        setSafeWords(prev => prev.filter(w => w.id !== wordId))
      } catch {
        alert('Failed to delete safe word')
      }
    }
    remove()
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

      {/* Header with Back and Add buttons */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/setting')}
          className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 active:scale-95 transition-all"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={() => navigate('/setting/safe-word/add')}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 active:scale-95 transition-all border-2 border-gray-900"
        >
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Safe Words</h1>

      {/* Safe Words List */}
      <div className="space-y-6">
        {safeWords.map((word, index) => (
          <div key={word.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
            {/* Safe Word Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex-1">
                <span className="text-sm text-gray-500">NO.{index + 1} Safe Word: </span>
                <span className="font-semibold text-gray-900">{word.word}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(word.id)}
                  className="text-blue-500 font-semibold text-sm hover:text-blue-600"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(word.id)}
                  className="text-red-500 hover:text-red-600 ml-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Toggle Options */}
            <div>
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <span className="text-base text-gray-900">Notify Emergency Contact</span>
                <button
                  onClick={() => handleToggle(word.id, 'notifyEmergencyContact')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    word.notifyEmergencyContact ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      word.notifyEmergencyContact ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <span className="text-base text-gray-900">Notify Nearby</span>
                <button
                  onClick={() => handleToggle(word.id, 'notifyNearby')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    word.notifyNearby ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      word.notifyNearby ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <span className="text-base text-gray-900">Call Police</span>
                <button
                  onClick={() => handleToggle(word.id, 'callPolice')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    word.callPolice ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      word.callPolice ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="px-6 py-4 flex items-center justify-between">
                <span className="text-base text-gray-900">Activate</span>
                <button
                  onClick={() => handleToggle(word.id, 'activate')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    word.activate ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      word.activate ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SafeWordSetting

