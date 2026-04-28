'use client'

import Link from 'next/link'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { Button } from '@shared/components/ui/Button'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import { ROUTES } from '@shared/utils/routes'
import { cn } from '@shared/utils/cn'

const NAV_SECTIONS = [
  {
    title: 'Account',
    items: [
      { page: 'profile', href: ROUTES.profile, label: 'Personal details', icon: 'profile' },
      { page: 'settings', href: ROUTES.bragSettings, label: 'Security', icon: 'security' },
    ],
  },
  {
    title: 'Brag doc',
    items: [
      {
        page: 'brag',
        href: ROUTES.brag,
        label: 'Your entries',
        icon: 'brag',
        children: [
          { page: 'resume', href: ROUTES.bragResume, label: 'Resume' },
          { page: 'linkedin', href: ROUTES.bragLinkedin, label: 'LinkedIn' },
        ],
      },
      {
        page: 'feedback',
        href: ROUTES.bragFeedback,
        label: 'Feedback',
        icon: 'feedback',
        children: [{ page: 'feedback-history', href: ROUTES.bragFeedbackHistory, label: 'Feedback history' }],
      },
    ],
  },
]

function SidebarIcon({ icon }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {icon === 'profile' && (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19c1.8-3 4.3-4.5 7-4.5s5.2 1.5 7 4.5" />
        </>
      )}
      {icon === 'security' && (
        <>
          <rect x="4.5" y="10.5" width="15" height="9" rx="2.25" />
          <path d="M8 10.5V8.25a4 4 0 0 1 8 0v2.25" />
          <path d="M12 14v2.25" />
        </>
      )}
      {icon === 'brag' && (
        <>
          <path d="M7 3.5h7.5L19 8v12.5H7z" />
          <path d="M14.5 3.5V8H19" />
          <path d="M9.5 12h5M9.5 15h5" />
        </>
      )}
      {icon === 'feedback' && (
        <>
          <path d="M5 5.5h14v9H9.5L5 18v-12.5Z" />
          <path d="M8 9h8M8 12h5" />
        </>
      )}
    </svg>
  )
}

export default function BragIdentitySidebar({
  ariaLabel = 'Sidebar navigation',
  eyebrow = 'Clausule',
  activePage,
  activeChildPage,
  showSignOut = true,
}) {
  const { logout } = useAuth()
  const profile = useProfileStore((state) => state.profile)
  const displayName = profileDisplayName(profile)
  const initials = profileInitials(profile)

  return (
    <aside className="be-sidebar" aria-label={ariaLabel}>
      <div className="be-sidebar-head">
        <div className="be-sidebar-eyebrow">{eyebrow}</div>
        <div className="be-sidebar-profile">
          <div className="be-sidebar-avatar be-avatar-pop" aria-hidden="true">{initials}</div>
          <div className="be-sidebar-profile-text">
            <div className="be-sidebar-name">{displayName}</div>
            <div className="be-sidebar-role">{profile.email}</div>
          </div>
        </div>
      </div>

      <nav className="be-sidebar-nav" aria-label="Primary">
        {NAV_SECTIONS.map((section) => (
          <section key={section.title} className="be-sidebar-section" aria-labelledby={`be-sidebar-${section.title.toLowerCase().replace(/\s+/g, '-')}-title`}>
            <div id={`be-sidebar-${section.title.toLowerCase().replace(/\s+/g, '-')}-title`} className="be-sidebar-section-title">{section.title}</div>
            <ul className="be-sidebar-list">
              {section.items.map((item) => (
                <li key={item.page} className="be-sidebar-item">
                  <Link
                    href={item.href}
                    className={cn(
                      'be-sidebar-link',
                      (activePage === item.page || item.children?.some((child) => activeChildPage === child.page)) && 'be-sidebar-link-active'
                    )}
                    aria-current={activePage === item.page || item.children?.some((child) => activeChildPage === child.page) ? 'page' : undefined}
                  >
                    <span className="be-sidebar-icon" aria-hidden="true">
                      <SidebarIcon icon={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                  {item.children?.length ? (
                    <ul className="be-sidebar-sublist" aria-label={`${item.label} child pages`}>
                      {item.children.map((child) => (
                        <li key={child.page} className="be-sidebar-subitem">
                          <Link
                            href={child.href}
                            className={cn('be-sidebar-sublink', activeChildPage === child.page && 'be-sidebar-sublink-active')}
                            aria-current={activeChildPage === child.page ? 'page' : undefined}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      {showSignOut && (
        <div className="be-sidebar-foot">
          <Button type="button" variant="ghost" className="be-sidebar-signout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </Button>
        </div>
      )}
    </aside>
  )
}
