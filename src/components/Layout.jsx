import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-stretch">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-gray-50 flex flex-col shadow-none md:shadow-xl md:rounded-3xl relative">
        <div className="flex-1 overflow-y-auto pb-28">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}

export default Layout

