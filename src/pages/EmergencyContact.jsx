import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

function EmergencyContact() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Load contacts from backend
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/contacts')
        if (!res.ok) return
        const data = await res.json()
        setContacts(data)
      } catch {
        // ignore - api.js handles 401
      }
    }
    load()
  }, [])

  const handleAddContact = () => {
    navigate('/add-contact')
  }

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return
    try {
      await api.delete(`/contacts/${id}`)
      setContacts(prev => prev.filter(contact => contact.id !== id))
    } catch {
      alert('Failed to delete contact')
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Emergency Contact</h1>
        <button 
          onClick={handleAddContact}
          className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-2xl hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <span className="text-gray-700">+</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-200 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
        />
        <button className="text-gray-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No contacts found</p>
            <p className="text-sm mt-2">Tap the + button to add a contact</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-purple-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <div className="flex items-center gap-4">
                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                    {contact.name}
                    {contact.relationship && (
                      <span className="text-sm text-gray-500 font-normal ml-2">
                        ({contact.relationship})
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm truncate">{contact.phone}</p>
                  {contact.email && (
                    <p className="text-gray-500 text-xs truncate mt-0.5">{contact.email}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => navigate(`/edit-contact/${contact.id}`)}
                    className="w-11 h-11 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
                    title="Edit"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Call Button */}
                  <a
                    href={`tel:${contact.phone}`}
                    className="w-11 h-11 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
                    title="Call"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>

                  {/* Email Button */}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="w-11 h-11 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
                      title="Email"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="w-11 h-11 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all active:scale-95"
                    title="Delete contact"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Card */}
      {filteredContacts.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                These contacts will be notified immediately when SOS is activated. 
                Make sure to keep this list up to date.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmergencyContact
