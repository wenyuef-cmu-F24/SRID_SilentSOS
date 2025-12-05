import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

function AddContact() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    shareLocation: false
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Real-time validation
  useEffect(() => {
    const newErrors = {}
    
    if (touched.name && !formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (touched.phone && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (touched.phone && formData.phone.trim() && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (touched.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
  }, [formData, touched])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }

  const handleSave = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      phone: true,
      email: true
    })

    // Validate all fields
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const res = await api.post('/contacts', formData)
      if (!res.ok) {
        alert('Failed to save contact')
        return
      }
      navigate('/emergency-contact')
    } catch {
      alert('Failed to save contact')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8 max-w-md mx-auto">

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
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Add New E Contact</h1>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={`w-full border-b-2 py-2 outline-none transition-colors text-gray-800 ${
              errors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="Enter name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        {/* Relationship */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-900 font-semibold text-lg">Relationship</label>
            <button 
              onClick={() => {
                const relationship = prompt('Enter relationship:', formData.relationship)
                if (relationship !== null) {
                  handleInputChange('relationship', relationship)
                }
              }}
              className="text-blue-500 font-semibold text-base hover:text-blue-600"
            >
              Edit
            </button>
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
            onBlur={() => handleBlur('phone')}
            className={`w-full border-b-2 py-2 outline-none transition-colors text-gray-800 ${
              errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.phone}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-gray-900 font-semibold text-lg mb-2">Email Address:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full border-b-2 py-2 outline-none transition-colors text-gray-800 ${
              errors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
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
        Save
      </button>
    </div>
  )
}

export default AddContact
