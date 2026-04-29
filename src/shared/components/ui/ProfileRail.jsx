'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'

const navSections = [
  {
    id: 'nav-account',
    label: 'Account',
    items: [
      {
        href: '/profile',
        label: 'Personal details',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 19c1.8-3 4.3-4.5 7-4.5s5.2 1.5 7 4.5" />
          </svg>
        ),
      },
      {
        href: '/brag/settings',
        label: 'Security',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="4.5" y="10.5" width="15" height="9" rx="2" />
            <path d="M8 10.5V8.25a4 4 0 0 1 8 0v2.25" />
            <path d="M12 14v2.25" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'nav-brag',
    label: 'Brag doc',
    items: [
      {
        href: '/brag',
        label: 'Your entries',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M7 3.5h7.5L19 8v12.5H7z" />
            <path d="M14.5 3.5V8H19" />
            <path d="M9.5 12h5M9.5 15h5" />
          </svg>
        ),
        children: [
          { href: '/brag/resume', label: 'Resume' },
          { href: '/brag/linkedin', label: 'LinkedIn' },
        ],
      },
      {
        href: '/brag/feedback',
        label: 'Feedback',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M5 5.5h14v9H9.5L5 18v-12.5Z" />
            <path d="M8 9h8M8 12h5" />
          </svg>
        ),
        children: [
          { href: '/brag/feedback/history', label: 'Feedback history' },
        ],
      },
    ],
  },
]

export function ProfileRail({ profile = {}, onLogout, pathname }) {
  const currentPath = pathname ?? usePathname()
  const name = profileDisplayName(profile)
  const initials = profileInitials(profile)

  return (
    <aside className="profile-rail" aria-label="Sidebar navigation">
      <div className="profile-rail-top">
        <div className="profile-rail-logo">Clausule</div>
        <div className="profile-rail-card">
          <div className="profile-rail-avatar" aria-hidden="true">{initials}</div>
          <div className="profile-rail-meta">
            <div className="profile-rail-name">{name}</div>
            <div className="profile-rail-email">{profile.email || ''}</div>
          </div>
        </div>
      </div>

      <nav className="profile-rail-nav" aria-label="Primary navigation">
        {navSections.map((section) => (
          <div key={section.id}>
            <div className="profile-rail-section" id={section.id}>{section.label}</div>
            <ul className="profile-rail-list" aria-labelledby={section.id}>
              {section.items.map((item) => {
                const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`profile-rail-link${active ? ' is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                    {item.children?.length ? (
                      <ul className="profile-rail-sublist">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link href={child.href} className="profile-rail-sublink">{child.label}</Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="profile-rail-foot">
        <button type="button" className="profile-rail-logout" onClick={onLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  )
}
