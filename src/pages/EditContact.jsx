import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api'

function EditContact() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()

  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    shareLocation: false,
  })

  useEffect(() => {
    const loadContact = async () => {
      try {
        const res = await fetch(`${API_BASE}/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          setLoading(false)
          return
        }
        const list = await res.json()
        const contact = Array.isArray(list) ? list.find(c => c.id === id) : null
        if (!contact) {
          alert('Contact not found')
          navigate('/emergency-contact')
          return
        }
        setFormData({
          name: contact.name || '',
          relationship: contact.relationship || '',
          phone: contact.phone || '',
          email: contact.email || '',
          shareLocation: !!contact.shareLocation,
        })
      } catch {
        alert('Failed to load contact')
      } finally {
        setLoading(false)
      }
    }

    if (token && id) {
      loadContact()
    }
  }, [token, id, navigate])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a name')
      return
    }
    if (!formData.phone.trim()) {
      alert('Please enter a phone number')
      return
    }

    const save = async () => {
      try {
        const res = await fetch(`${API_BASE}/contacts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          alert(data.error || 'Failed to update contact')
          return
        }
        navigate('/emergency-contact')
      } catch {
        alert('Failed to update contact')
      }
    }

    save()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8 max-w-md mx-auto flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading contact…</p>
      </div>
    )
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
        onClick={() => navigate('/emergency-contact')}
        className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-6 hover:bg-gray-400 active:scale-95 transition-all"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Edit E Contact</h1>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter name"
          />
        </div>

        {/* Relationship */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-900 font-semibold text-lg">Relationship</label>
          </div>
          <input
            type="text"
            value={formData.relationship}
            onChange={(e) => handleInputChange('relationship', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter relationship"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Phone Number:</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter phone number"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Email Address:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-blue-500 transition-colors text-gray-800"
            placeholder="Enter email address"
          />
        </div>

        {/* Share Location Toggle */}
        <div className="flex justify-between items-center pt-3">
          <label className="text-gray-900 font-semibold text-lg">Share Location</label>
          <button
            onClick={() => handleInputChange('shareLocation', !formData.shareLocation)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              formData.shareLocation ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                formData.shareLocation ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-white rounded-3xl shadow-md py-4 mt-8 text-gray-700 font-semibold text-lg hover:bg-gray-50 active:scale-98 transition-all"
      >
        Save Changes
      </button>
    </div>
  )
}

export default EditContact


