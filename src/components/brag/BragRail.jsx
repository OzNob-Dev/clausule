'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function BragRail({ activePage }) {
  const router = useRouter()
  const { logout } = useAuth()
  const [initials, setInitials] = useState('')

  useEffect(() => {
    fetch('/api/auth/profile', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() : {})
      .then((d) => {
        const i = ((d.firstName?.[0] ?? '') + (d.lastName?.[0] ?? '')).toUpperCase()
        setInitials(i || d.email?.[0]?.toUpperCase() || '')
      })
      .catch(() => {})
  }, [])

  return (
    <aside className="be-rail be-sidebar" aria-label="App navigation">
      <div className="be-rail-logo" aria-hidden="true">CLS</div>
      <nav className="be-rail-nav" aria-label="Primary">
        <button
          className={activePage === 'brag' ? 'be-rail-btn-active' : 'be-rail-btn'}
          onClick={activePage !== 'brag' ? () => router.push('/brag') : undefined}
          aria-label="Brag doc"
          aria-current={activePage === 'brag' ? 'page' : undefined}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z"/>
            <circle cx="13" cy="12" r="1.5"/>
          </svg>
        </button>
        <button
          className={activePage === 'settings' ? 'be-rail-btn-active' : 'be-rail-btn'}
          onClick={activePage !== 'settings' ? () => router.push('/brag/settings') : undefined}
          aria-label="Settings"
          aria-current={activePage === 'settings' ? 'page' : undefined}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="8" cy="8" r="2.5"/>
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"/>
          </svg>
        </button>
      </nav>
      <div className="be-rail-foot">
        <div key={initials || 'avatar-empty'} className="be-rail-avatar be-avatar-pop be-avatar-pop--rail" aria-hidden="true">{initials}</div>
        <button onClick={logout} className="be-rail-icon-btn" aria-label="Sign out">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
            <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
