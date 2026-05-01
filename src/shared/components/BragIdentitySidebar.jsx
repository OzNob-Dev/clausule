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
  const email = profile.email?.trim() || ''

  return (
    <aside
      className="sidebar sticky top-0 flex h-screen w-[320px] shrink-0 flex-col overflow-y-auto border-r-[1.5px] border-r-[var(--cl-black-20)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] max-[768px]:static max-[768px]:h-auto max-[768px]:w-full"
      aria-label={ariaLabel}
    >
      <div className="sidebar__head border-b-[1.5px] border-b-[var(--sidebar-border)] px-7 pb-6 pt-8 max-[768px]:px-5">
        <div className="sidebar__eyebrow mb-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--cl-white-42)]">{eyebrow}</div>
        <div className="sidebar__profile flex items-center gap-4 rounded-[12px] border border-[var(--sidebar-border)] bg-[var(--sidebar-bg-soft)] p-4 transition-[transform,border-color,background-color] duration-200 hover:translate-x-[2px] hover:border-[var(--sidebar-accent)] hover:bg-[var(--cl-white-10)] motion-reduce:transition-none motion-reduce:hover:translate-x-0">
          <div className="sidebar__avatar sidebar__avatar-pop relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[12px] border border-[var(--cl-brown-alpha-10)] bg-[linear-gradient(135deg,var(--cl-surface-muted-14)_0%,var(--cl-surface-muted-10)_100%)] [font-family:var(--cl-font-editorial)] text-[18px] font-medium tracking-[-0.02em] text-[var(--cl-ink-6)] shadow-[var(--cl-shadow-ink)] before:absolute before:inset-0 before:bg-[linear-gradient(180deg,var(--cl-white-24)_0%,transparent_55%)] before:content-[''] motion-safe:animate-[sidebar-avatar-pop-in_0.62s_cubic-bezier(0.2,1,0.3,1)_both]">
            <span className="relative z-10">{initials}</span>
          </div>
          <div className="sidebar__profile-text min-w-0">
            <div className="sidebar__name overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold leading-[1.3] text-[var(--sidebar-text-strong)]">{displayName}</div>
            {email ? <div className="sidebar__role mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[var(--sidebar-text-muted)]">{email}</div> : null}
          </div>
        </div>
      </div>

      <nav className="sidebar__nav flex flex-1 flex-col py-6" aria-label="Primary">
        {NAV_SECTIONS.map((section) => (
          <section key={section.title} className="sidebar__section mb-8 flex flex-col gap-3 last:mb-0" aria-labelledby={`sidebar-${section.title.toLowerCase().replace(/\s+/g, '-')}-title`}>
            <div id={`sidebar-${section.title.toLowerCase().replace(/\s+/g, '-')}-title`} className="sidebar__section-title px-7 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--sidebar-accent)] max-[768px]:px-5">{section.title}</div>
            <ul className="sidebar__list m-0 list-none p-0">
              {section.items.map((item) => (
                <li key={item.page} className="sidebar__item">
                  <Link
                    href={item.href}
                    className={cn(
                      'sidebar__link flex items-center gap-3 border-l-[3px] border-l-transparent px-7 py-3 text-[15px] font-medium text-[var(--sidebar-text)] no-underline transition-[color,background-color,border-color] duration-200 hover:border-l-[var(--sidebar-accent)] hover:bg-[var(--sidebar-bg-hover)] hover:text-[var(--sidebar-text-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--sidebar-focus)] max-[768px]:px-5 motion-reduce:transition-none',
                      (activePage === item.page || item.children?.some((child) => activeChildPage === child.page)) && 'sidebar__link--active border-l-[var(--sidebar-accent)] bg-[var(--sidebar-accent-soft)] text-[var(--sidebar-text-strong)] font-semibold'
                    )}
                    aria-current={activePage === item.page || item.children?.some((child) => activeChildPage === child.page) ? 'page' : undefined}
                  >
                    <span className="sidebar__icon h-5 w-5 shrink-0 text-current [&_svg]:h-full [&_svg]:w-full" aria-hidden="true">
                      <SidebarIcon icon={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                  {item.children?.length ? (
                    <ul className="sidebar__sublist mt-1 m-0 list-none p-0" aria-label={`${item.label} child pages`}>
                      {item.children.map((child) => (
                        <li key={child.page} className="sidebar__subitem">
                          <Link
                            href={child.href}
                            className={cn('sidebar__sublink block px-7 py-2 pl-[60px] text-[14px] text-[var(--sidebar-text-muted)] no-underline transition-[color,background-color] duration-200 hover:bg-[var(--sidebar-bg-hover)] hover:text-[var(--sidebar-text-strong)] max-[768px]:px-5 max-[768px]:pl-[52px] motion-reduce:transition-none', activeChildPage === child.page && 'sidebar__sublink--active text-[var(--sidebar-accent)] font-semibold')}
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
        <div className="sidebar__foot px-7 pb-8 pt-6 max-[768px]:px-5">
          <ClientSignOutButton />
        </div>
      )}
    </aside>
  )
}
