import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import EmergencyContact from './pages/EmergencyContact'
import AddContact from './pages/AddContact'
import Setting from './pages/Setting'
import ProfileSetting from './pages/ProfileSetting'
import ProfileEdit from './pages/ProfileEdit'
import ProfileSecurity from './pages/ProfileSecurity'
import ProfileHistory from './pages/ProfileHistory'
import ProfileShare from './pages/ProfileShare'
import ThreeTapSetting from './pages/ThreeTapSetting'
import SafeWordSetting from './pages/SafeWordSetting'
import AddSafeWord from './pages/AddSafeWord'
import NotificationsSetting from './pages/NotificationsSetting'
import EmergencyAlert from './pages/EmergencyAlert'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="emergency-contact" element={<EmergencyContact />} />
          <Route path="setting" element={<Setting />} />
        </Route>
        <Route path="/add-contact" element={<AddContact />} />
        <Route path="/setting/profile" element={<ProfileSetting />} />
        <Route path="/setting/profile/edit" element={<ProfileEdit />} />
        <Route path="/setting/profile/security" element={<ProfileSecurity />} />
        <Route path="/setting/profile/history" element={<ProfileHistory />} />
        <Route path="/setting/profile/share" element={<ProfileShare />} />
        <Route path="/setting/3-tap" element={<ThreeTapSetting />} />
        <Route path="/setting/safe-word" element={<SafeWordSetting />} />
        <Route path="/setting/safe-word/add" element={<AddSafeWord />} />
        <Route path="/setting/notifications" element={<NotificationsSetting />} />
        <Route path="/emergency-alert" element={<EmergencyAlert />} />
      </Routes>
    </Router>
  )
}

export default App

