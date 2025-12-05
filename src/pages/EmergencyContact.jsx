import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api'

function EmergencyContact() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Load contacts from backend when token changes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setContacts(data)
      } catch {
        // ignore
      }
    }
    if (token) load()
  }, [token])

  const handleAddContact = () => {
    navigate('/add-contact')
  }

  const handleEditContact = (contact) => {
    navigate(`/edit-contact/${contact.id}`)
  }

  const handleDeleteContact = (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return
    const remove = async () => {
      try {
        await fetch(`${API_BASE}/contacts/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        setContacts(prev => prev.filter(contact => contact.id !== id))
      } catch {
        alert('Failed to delete contact')
      }
    }
    remove()
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-gray-100 px-6 pt-4 pb-8">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-6 text-sm">
        <span className="font-semibold">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

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
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {contact.name}
                    {contact.relationship && (
                      <span className="text-sm text-gray-500 font-normal ml-2">
                        ({contact.relationship})
                      </span>
                    )}
                  </h3>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-blue-500 font-medium text-base hover:text-blue-600 mt-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.07 3.21a1 1 0 01-.502 1.21l-1.518.759a11.042 11.042 0 005.017 5.017l.76-1.518a1 1 0 011.21-.502l3.21 1.07A1 1 0 0121 18.72V21a2 2 0 01-2 2h-.25C9.56 23 3 16.44 3 8.25V8a2 2 0 012-2z"
                      />
                    </svg>
                    <span>{contact.phone}</span>
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-800 mt-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 0l8 7 8-7"
                        />
                      </svg>
                      <span>{contact.email}</span>
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 ml-3">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete contact"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

