'use client'

import Link from 'next/link'
import { useAuth } from '@auth/context/AuthContext'
import { useProfileStore } from '@auth/store/useProfileStore'
import { Button } from '@shared/components/ui/Button'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import { ROUTES } from '@shared/utils/routes'
import { cn } from '@shared/utils/cn'
import { ProfileIcon } from '@shared/components/ui/icon/ProfileIcon'
import { SecurityIcon } from '@shared/components/ui/icon/SecurityIcon'
import { DocumentIcon } from '@shared/components/ui/icon/DocumentIcon'
import { MessageIcon } from '@shared/components/ui/icon/MessageIcon'
import { LogoutIcon } from '@shared/components/ui/icon/LogoutIcon'

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
  return icon === 'profile'
    ? <ProfileIcon />
    : icon === 'security'
      ? <SecurityIcon />
      : icon === 'brag'
        ? <DocumentIcon />
        : <MessageIcon />
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
            <LogoutIcon />
            Log out
          </Button>
        </div>
      )}
    </aside>
  )
}
