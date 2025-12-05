import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function BottomNav() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center">
      {/* Frosted glass effect background */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-lg shadow-gray-200/50">
        <div className="flex justify-around items-center h-20 px-4">
          <Link 
            to="/" 
            className={`flex flex-col items-center justify-center space-y-1 flex-1 transition-all duration-200 ${
              isActive('/') 
                ? 'text-orange-500 scale-105' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive('/') ? 'bg-orange-50' : ''}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className={`text-xs font-semibold ${isActive('/') ? 'text-orange-500' : ''}`}>Home</span>
          </Link>
          
          <Link 
            to="/emergency-contact" 
            className={`flex flex-col items-center justify-center space-y-1 flex-1 transition-all duration-200 ${
              isActive('/emergency-contact') 
                ? 'text-orange-500 scale-105' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive('/emergency-contact') ? 'bg-orange-50' : ''}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className={`text-xs font-semibold ${isActive('/emergency-contact') ? 'text-orange-500' : ''}`}>Contacts</span>
          </Link>
          
          <Link 
            to="/setting" 
            className={`flex flex-col items-center justify-center space-y-1 flex-1 transition-all duration-200 ${
              isActive('/setting') 
                ? 'text-orange-500 scale-105' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive('/setting') ? 'bg-orange-50' : ''}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className={`text-xs font-semibold ${isActive('/setting') ? 'text-orange-500' : ''}`}>Setting</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default BottomNav
