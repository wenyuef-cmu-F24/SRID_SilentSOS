import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

function Layout() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

export default Layout

