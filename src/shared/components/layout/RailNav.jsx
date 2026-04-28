'use client'

import { usePathname } from 'next/navigation'
import { ROUTES } from '@shared/utils/routes'
import { cn } from '@shared/utils/cn'
import { Button } from '@shared/components/ui/Button'
import { Link } from '@shared/components/ui/Link'

const componentsIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
    <rect x="2" y="2" width="4" height="4" rx="1"/>
    <rect x="10" y="2" width="4" height="4" rx="1"/>
    <rect x="2" y="10" width="4" height="4" rx="1"/>
    <rect x="10" y="10" width="4" height="4" rx="1"/>
  </svg>
)

const settingsIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
    <circle cx="8" cy="8" r="2.5"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
  </svg>
)

const navItems = [
  {
    to: ROUTES.components,
    tip: 'Component library',
    icon: componentsIcon,
  },
  {
    to: '/dashboard',
    tip: 'Dashboard',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
        <rect x="2" y="2" width="5" height="5" rx="1.5"/><rect x="9" y="2" width="5" height="5" rx="1.5"/>
        <rect x="2" y="9" width="5" height="5" rx="1.5"/><rect x="9" y="9" width="5" height="5" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: '/entries',
    tip: 'Search entries',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="4"/><line x1="10" y1="10" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    to: '/escalated',
    tip: 'Escalated',
    badge: true,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
        <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
      </svg>
    ),
  },
  {
    to: ROUTES.profile,
    tip: 'Profile',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
        <circle cx="8" cy="5.5" r="2.25"/>
        <path d="M3 13c.8-2.5 3-4 5-4s4.2 1.5 5 4"/>
      </svg>
    ),
  },
  {
    to: ROUTES.bragSettings,
    tip: 'Settings',
    icon: settingsIcon,
  },
]

export function RailNav({ items = navItems, locked = false, onLogout, userInitials = '', userTitle = '' }) {
  const pathname = usePathname()
  const visibleItems = locked ? [] : items

  return (
    <aside className="sticky top-0 flex h-screen w-[52px] shrink-0 flex-col items-center border-r border-border bg-nav py-4 max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:z-[100] max-sm:h-[56px] max-sm:w-full max-sm:flex-row max-sm:justify-around max-sm:border-r-0 max-sm:border-t max-sm:px-2">
      <div className="mb-[18px] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-acc max-sm:hidden">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4 text-canvas" aria-hidden="true">
          <path d="M3 5h12M3 9h8M3 13h5"/>
        </svg>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-[2px] max-sm:flex-none max-sm:w-full max-sm:flex-row max-sm:justify-around max-sm:gap-0" aria-label="Primary">
        {visibleItems.map(({ to, tip, icon, badge }) => {
          const isActive = pathname === to || pathname.startsWith(`${to}/`)
          return (
            <Link
              key={to}
              href={to}
              title={tip}
              aria-label={tip}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex h-[36px] w-[36px] items-center justify-center rounded-[var(--r)] text-tc no-underline transition-all duration-150 max-sm:h-[44px] max-sm:w-[44px]',
                isActive ? 'bg-acc-bg text-acc-text' : 'hover:bg-white/5 hover:text-ts'
              )}
            >
              {icon}
              {badge && (
                <span className="absolute right-[5px] top-[5px] h-[6px] w-[6px] rounded-full border-[1.5px] border-nav bg-rt" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-2 max-sm:hidden">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[var(--r)] bg-acc text-[10px] font-extrabold text-tp select-none cursor-default" title={userTitle}>
          {userInitials}
        </div>

        <Button
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-[28px] w-[28px] items-center justify-center border-none bg-transparent text-tc cursor-pointer transition-colors duration-150 hover:text-ts"
          variant="ghost"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[15px] w-[15px]">
            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
            <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
          </svg>
        </Button>
      </div>
    </aside>
  )
}
