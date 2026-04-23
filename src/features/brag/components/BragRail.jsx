'use client'

import Link from 'next/link'
import { useAuth } from '@features/auth/context/AuthContext'
import { cn } from '@shared/utils/cn'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { ROUTES } from '@shared/utils/routes'

export default function BragRail({ activePage }) {
  const { logout } = useAuth()
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const mfaSetupRequired = hasSecuritySnapshot && !authenticatorAppConfigured && !ssoConfigured

  return (
    <aside className="flex min-h-screen w-[64px] shrink-0 flex-col items-center border-r border-border bg-nav py-4 text-tc max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:z-[100] max-sm:h-[56px] max-sm:w-full max-sm:flex-row max-sm:justify-around max-sm:border-r-0 max-sm:border-t max-sm:px-2" aria-label="App navigation">
      <img className="mb-4 h-8 w-8 rounded-[10px] max-sm:hidden" src="/favicon.svg" alt="" aria-hidden="true" />
      <nav className="flex flex-1 flex-col items-center gap-1 max-sm:flex-none max-sm:w-full max-sm:flex-row max-sm:justify-around max-sm:gap-0" aria-label="Primary">
        {!mfaSetupRequired && (
          <>
            <Link
              href="/brag"
              className={cn('flex h-9 w-9 items-center justify-center rounded-[var(--r)] transition-colors duration-150 max-sm:h-11 max-sm:w-11', activePage === 'brag' ? 'bg-acc-bg text-acc-text' : 'text-tc hover:bg-white/5 hover:text-ts')}
              aria-label="Brag doc"
              aria-current={activePage === 'brag' ? 'page' : undefined}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-4 w-4">
                <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z"/>
                <circle cx="13" cy="12" r="1.5"/>
              </svg>
            </Link>
            <Link
              href={ROUTES.bragFeedback}
              className={cn('flex h-9 w-9 items-center justify-center rounded-[var(--r)] transition-colors duration-150 max-sm:h-11 max-sm:w-11', activePage === 'feedback' ? 'bg-acc-bg text-acc-text' : 'text-tc hover:bg-white/5 hover:text-ts')}
              aria-label="Feedback"
              aria-current={activePage === 'feedback' ? 'page' : undefined}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-4 w-4">
                <path d="M3 3h10v7H7l-4 3V3Z"/>
                <path d="M6 6h4M6 8h3"/>
              </svg>
            </Link>
            <Link
              href={ROUTES.bragSettings}
              className={cn('flex h-9 w-9 items-center justify-center rounded-[var(--r)] transition-colors duration-150 max-sm:h-11 max-sm:w-11', activePage === 'settings' ? 'bg-acc-bg text-acc-text' : 'text-tc hover:bg-white/5 hover:text-ts')}
              aria-label="Settings"
              aria-current={activePage === 'settings' ? 'page' : undefined}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-4 w-4">
                <circle cx="8" cy="8" r="2.5"/>
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"/>
              </svg>
            </Link>
            <Link
              href={ROUTES.profile}
              className={cn('flex h-9 w-9 items-center justify-center rounded-[var(--r)] transition-colors duration-150 max-sm:h-11 max-sm:w-11', activePage === 'profile' ? 'bg-acc-bg text-acc-text' : 'text-tc hover:bg-white/5 hover:text-ts')}
              aria-label="Profile"
              aria-current={activePage === 'profile' ? 'page' : undefined}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-4 w-4">
                <circle cx="8" cy="5.5" r="2.25"/>
                <path d="M3 13c.8-2.5 3-4 5-4s4.2 1.5 5 4"/>
              </svg>
            </Link>
          </>
        )}
      </nav>
      <div className="mt-2 flex flex-col items-center gap-2 max-sm:hidden">
        <button type="button" onClick={logout} className="flex h-7 w-7 items-center justify-center border-none bg-transparent text-tc cursor-pointer transition-colors duration-150 hover:text-ts" aria-label="Sign out">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-[15px] w-[15px]">
            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
            <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
