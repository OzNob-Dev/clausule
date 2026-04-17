import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { storage } from './utils/storage'
import SignIn      from './pages/SignIn'
import SignUp      from './pages/SignUp'
import MfaSetup   from './pages/MfaSetup'
import Dashboard   from './pages/Dashboard'
import Profile     from './pages/Profile'
import Entries     from './pages/Entries'
import BragEmployee  from './pages/BragEmployee'
import BragSettings  from './pages/BragSettings'
import NewEntry    from './pages/NewEntry'
import EditEntry   from './pages/EditEntry'
import Escalated   from './pages/Escalated'
import Settings    from './pages/Settings'
import ComingSoon  from './pages/ComingSoon'

// Gate: must be fully authed (email verified + MFA set up) to access the app
function RequireAuth({ children }) {
  if (!storage.isAuthed() || !storage.isMfaSetup()) {
    return <Navigate to="/" replace />
  }
  return children
}

// Gate: once authed+MFA, redirect away from auth screens
function RedirectIfAuthed({ children }) {
  if (storage.isAuthed() && storage.isMfaSetup()) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  const [isBypassed, setIsBypassed] = useState(false)

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const hasBypassParam = queryParams.get('bypaxxx') === 'true'
    if (hasBypassParam) {
      localStorage.setItem('clausule_dev_accexx', 'granted')
      window.history.replaceState(null, '', window.location.pathname)
    }
    const hasAccess = localStorage.getItem('clausule_dev_accexx') === 'granted'
    setIsBypassed(hasAccess)
  }, [])

  if (!isBypassed) return <ComingSoon />

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth screens */}
        <Route path="/" element={
          <RedirectIfAuthed><SignIn /></RedirectIfAuthed>
        } />
        <Route path="/signup" element={
          <RedirectIfAuthed><SignUp /></RedirectIfAuthed>
        } />
        <Route path="/mfa-setup" element={<MfaSetup />} />

        {/* Protected app */}
        <Route path="/dashboard"  element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/profile"    element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/entries"    element={<RequireAuth><Entries /></RequireAuth>} />
        <Route path="/brag"          element={<RequireAuth><BragEmployee /></RequireAuth>} />
        <Route path="/brag/settings" element={<RequireAuth><BragSettings /></RequireAuth>} />
        <Route path="/new-entry"  element={<RequireAuth><NewEntry /></RequireAuth>} />
        <Route path="/edit-entry" element={<RequireAuth><EditEntry /></RequireAuth>} />
        <Route path="/escalated"  element={<RequireAuth><Escalated /></RequireAuth>} />
        <Route path="/settings"   element={<RequireAuth><Settings /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
