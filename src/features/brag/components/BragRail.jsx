'use client'

import Link from 'next/link'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { ROUTES } from '@shared/utils/routes'
import { cn } from '@shared/utils/cn'

const navItems = [
  { page: 'brag', href: '/brag', label: 'Brag doc', icon: 'brag' },
  { page: 'feedback', href: ROUTES.bragFeedback, label: 'Feedback', icon: 'feedback' },
  { page: 'settings', href: ROUTES.bragSettings, label: 'Settings', icon: 'settings' },
  { page: 'profile', href: ROUTES.profile, label: 'Profile', icon: 'profile' },
]

export default function BragRail({ activePage }) {
  const { logout } = useAuth()
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const mfaSetupRequired = hasSecuritySnapshot && !authenticatorAppConfigured && !ssoConfigured

  return (
    <aside
      className={cn(
        'be-rail be-sidebar',
        'max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:z-[100] max-sm:h-[56px] max-sm:w-full max-sm:flex-row max-sm:justify-around max-sm:border-t max-sm:border-r-0 max-sm:px-2 max-sm:py-0'
      )}
      aria-label="App navigation"
    >
      <img className="be-rail-logo max-sm:hidden" src="/favicon.svg" alt="" aria-hidden="true" />
      <nav className="be-rail-nav max-sm:flex-none max-sm:w-full max-sm:flex-row max-sm:justify-around max-sm:gap-0" aria-label="Primary">
        {!mfaSetupRequired && (
          navItems.map(({ page, href, label, icon }) => (
            <Link
              key={page}
              href={href}
              className={cn(
                'be-rail-btn max-sm:h-11 max-sm:w-11',
                activePage === page
                  ? 'be-rail-btn-active'
                  : 'text-[var(--be-rail-icon)] hover:text-[var(--be-rail-icon-hover)]'
              )}
              aria-label={label}
              aria-current={activePage === page ? 'page' : undefined}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {icon === 'brag' && (
                  <>
                    <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z" />
                    <circle cx="13" cy="12" r="1.5" />
                  </>
                )}
                {icon === 'feedback' && (
                  <>
                    <path d="M3 3h10v7H7l-4 3V3Z" />
                    <path d="M6 6h4M6 8h3" />
                  </>
                )}
                {icon === 'settings' && (
                  <>
                    <circle cx="8" cy="8" r="2.5" />
                    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1" />
                  </>
                )}
                {icon === 'profile' && (
                  <>
                    <circle cx="8" cy="5.5" r="2.25" />
                    <path d="M3 13c.8-2.5 3-4 5-4s4.2 1.5 5 4" />
                  </>
                )}
              </svg>
            </Link>
          ))
        )}
      </nav>
      <div className="be-rail-foot max-sm:hidden">
        <button type="button" onClick={logout} className="be-rail-icon-btn" aria-label="Sign out">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
            <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
