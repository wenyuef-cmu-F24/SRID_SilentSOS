import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import EmergencyContact from './pages/EmergencyContact'
import AddContact from './pages/AddContact'
import EditContact from './pages/EditContact'
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
import AuthPage from './pages/Auth'
import { AuthProvider, useAuth } from './context/AuthContext'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  
  return null
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={(
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            )}
          >
            <Route index element={<Home />} />
            <Route path="emergency-contact" element={<EmergencyContact />} />
            <Route path="setting" element={<Setting />} />
          </Route>
          <Route
            path="/add-contact"
            element={(
              <PrivateRoute>
                <AddContact />
              </PrivateRoute>
            )}
          />
          <Route
            path="/edit-contact/:id"
            element={(
              <PrivateRoute>
                <EditContact />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/profile"
            element={(
              <PrivateRoute>
                <ProfileSetting />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/profile/edit"
            element={(
              <PrivateRoute>
                <ProfileEdit />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/profile/security"
            element={(
              <PrivateRoute>
                <ProfileSecurity />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/profile/history"
            element={(
              <PrivateRoute>
                <ProfileHistory />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/profile/share"
            element={(
              <PrivateRoute>
                <ProfileShare />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/3-tap"
            element={(
              <PrivateRoute>
                <ThreeTapSetting />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/safe-word"
            element={(
              <PrivateRoute>
                <SafeWordSetting />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/safe-word/add"
            element={(
              <PrivateRoute>
                <AddSafeWord />
              </PrivateRoute>
            )}
          />
          <Route
            path="/setting/notifications"
            element={(
              <PrivateRoute>
                <NotificationsSetting />
              </PrivateRoute>
            )}
          />
          <Route
            path="/emergency-alert"
            element={(
              <PrivateRoute>
                <EmergencyAlert />
              </PrivateRoute>
            )}
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

