import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function EmergencyContact() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Load contacts from localStorage on mount
  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]')
    
    // If no contacts in localStorage, add default ones
    if (savedContacts.length === 0) {
      const defaultContacts = [
        { id: 1, name: 'Father', phone: '+1(000)000-0000', relationship: 'Father' },
        { id: 2, name: 'Sister', phone: '+1(000)000-0000', relationship: 'Sister' },
      ]
      localStorage.setItem('emergencyContacts', JSON.stringify(defaultContacts))
      setContacts(defaultContacts)
    } else {
      setContacts(savedContacts)
    }
  }, [])

  // Refresh contacts when page gains focus
  useEffect(() => {
    const handleFocus = () => {
      const savedContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]')
      setContacts(savedContacts)
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleAddContact = () => {
    navigate('/add-contact')
  }

  const handleDeleteContact = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const updatedContacts = contacts.filter(contact => contact.id !== id)
      setContacts(updatedContacts)
      localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts))
    }
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
                    className="text-blue-500 font-medium text-base hover:text-blue-600 block"
                  >
                    {contact.phone}
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-gray-600 text-sm hover:text-gray-800 block mt-1"
                    >
                      {contact.email}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 text-red-500 hover:text-red-700"
                  title="Delete contact"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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

