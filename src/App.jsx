import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Entries from './pages/Entries'
import BragEmployee from './pages/BragEmployee'
import NewEntry from './pages/NewEntry'
import EditEntry from './pages/EditEntry'
import Escalated from './pages/Escalated'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<SignIn />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/profile"    element={<Profile />} />
        <Route path="/entries"    element={<Entries />} />
        <Route path="/brag"       element={<BragEmployee />} />
        <Route path="/new-entry"  element={<NewEntry />} />
        <Route path="/edit-entry" element={<EditEntry />} />
        <Route path="/escalated"  element={<Escalated />} />
        <Route path="/settings"   element={<Settings />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
