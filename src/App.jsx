import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Entries from './pages/Entries'
import BragEmployee from './pages/BragEmployee'
import NewEntry from './pages/NewEntry'
import EditEntry from './pages/EditEntry'
import Escalated from './pages/Escalated'
import Settings from './pages/Settings'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  const [isBypassed, setIsBypassed] = useState(false);

  useEffect(() => {
      // 1. Check if the URL has the secret query parameter
      const queryParams = new URLSearchParams(window.location.search);
      const hasBypassParam = queryParams.get('bypass') === 'true';

      // 2. If they have the link, save it to local storage so it persists
      if (hasBypassParam) {
        localStorage.setItem('clausule_dev_access', 'granted');
        
        // Optional: Clean up the URL so it doesn't look weird
        window.history.replaceState(null, '', window.location.pathname);
      }

      // 3. Check local storage to see if they are allowed in
      const hasAccess = localStorage.getItem('clausule_dev_access') === 'granted';
      setIsBypassed(hasAccess);
    }, []);


  if (!isBypassed) {
    return <ComingSoon />;
  }

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
