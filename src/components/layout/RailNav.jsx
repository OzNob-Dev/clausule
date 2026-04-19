'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { storage } from '../../utils/storage'
import { useAuth } from '@/contexts/AuthContext'
import { useProfileStore } from '@/stores/useProfileStore'
import '../../styles/rail-nav.css'

const settingsIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="2.5"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
  </svg>
)

const navItems = [
  {
    to: '/dashboard',
    tip: 'Dashboard',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="5" height="5" rx="1.5"/><rect x="9" y="2" width="5" height="5" rx="1.5"/>
        <rect x="2" y="9" width="5" height="5" rx="1.5"/><rect x="9" y="9" width="5" height="5" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: '/entries',
    tip: 'Search entries',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    to: '/escalated',
    tip: 'Escalated',
    badge: true,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
      </svg>
    ),
  },
  {
    to: '/settings',
    tip: 'Settings',
    icon: settingsIcon,
  },
]

export function RailNav() {
    const pathname        = usePathname()
    const [escalatedCount, setEscalatedCount] = useState(0)
    const { logout }      = useAuth()
    const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
    const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
    const items = hasSecuritySnapshot && !authenticatorAppConfigured ? [] : navItems

    useEffect(() => {
      setEscalatedCount(storage.getEscalatedCount())
    }, [])

  return (
    <aside className="rail-aside">
      {/* Logo */}
      <div className="rail-logo">
        <svg viewBox="0 0 18 18" fill="none" stroke="#FBF7F2" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 5h12M3 9h8M3 13h5"/>
        </svg>
      </div>

      {/* Nav items */}
      <nav className="rail-items" aria-label="Primary">
        {items.map(({ to, tip, icon, badge }) => (
          <Link
            key={to}
            href={to}
            title={tip}
            aria-label={tip}
            className={`nav-item${pathname === to ? ' nav-item--active' : ''}`}
          >
            {icon}
            {badge && escalatedCount > 0 && (
              <span className="rn-badge" aria-hidden="true" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="rail-footer">
        <div className="rn-user" title="Adrian Diente">
          AD
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="rn-logout"
          aria-label="Sign out"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
            <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
