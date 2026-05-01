import './BragIdentitySidebar.css'

import Link from 'next/link'
import ClientSignOutButton from '@shared/components/ClientSignOutButton'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import { ROUTES } from '@shared/utils/routes'
import { cn } from '@shared/utils/cn'
import { ProfileIcon } from '@shared/components/ui/icon/ProfileIcon'
import { SecurityIcon } from '@shared/components/ui/icon/SecurityIcon'
import { DocumentIcon } from '@shared/components/ui/icon/DocumentIcon'
import { MessageIcon } from '@shared/components/ui/icon/MessageIcon'
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
  profile = {},
  showSignOut = true,
}) {
  const displayName = profileDisplayName(profile)
  const initials = profileInitials(profile)

  return (
    <aside className="sidebar" aria-label={ariaLabel}>
      <div className="sidebar__head">
        <div className="sidebar__eyebrow">{eyebrow}</div>
        <div className="sidebar__profile">
          <div className="sidebar__avatar sidebar__avatar-pop" aria-hidden="true">{initials}</div>
          <div className="sidebar__profile-text">
            <div className="sidebar__name">{displayName}</div>
            <div className="sidebar__role">{profile.email}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {NAV_SECTIONS.map((section) => (
          <section key={section.title} className="sidebar__section" aria-labelledby={`sidebar-${section.title.toLowerCase().replace(/\s+/g, '-')}-title`}>
            <div id={`sidebar-${section.title.toLowerCase().replace(/\s+/g, '-')}-title`} className="sidebar__section-title">{section.title}</div>
            <ul className="sidebar__list">
              {section.items.map((item) => (
                <li key={item.page} className="sidebar__item">
                  <Link
                    href={item.href}
                    className={cn(
                      'sidebar__link',
                      (activePage === item.page || item.children?.some((child) => activeChildPage === child.page)) && 'sidebar__link--active'
                    )}
                    aria-current={activePage === item.page || item.children?.some((child) => activeChildPage === child.page) ? 'page' : undefined}
                  >
                    <span className="sidebar__icon" aria-hidden="true">
                      <SidebarIcon icon={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                  {item.children?.length ? (
                    <ul className="sidebar__sublist" aria-label={`${item.label} child pages`}>
                      {item.children.map((child) => (
                        <li key={child.page} className="sidebar__subitem">
                          <Link
                            href={child.href}
                            className={cn('sidebar__sublink', activeChildPage === child.page && 'sidebar__sublink--active')}
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
        <div className="sidebar__foot">
          <ClientSignOutButton />
        </div>
      )}
    </aside>
  )
}
