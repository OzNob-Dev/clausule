'use client'

import { useShallow } from 'zustand/shallow'
import { usePathname } from 'next/navigation'
import BragRail from '@features/brag/components/BragRail'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import '@features/brag/styles/brag-shell.css'

const PAGE_CONFIG = {
  '/brag': {
    activePage: 'brag',
    eyebrow: 'Clausule',
  },
  '/brag/feedback': {
    activePage: 'feedback',
    eyebrow: 'Clausule · Feedback',
    ariaLabel: 'Feedback guidance',
    noteLabel: 'Why this matters',
    note: 'Your note goes straight to the Clausule team and stays out of your brag doc.',
    overviewLabel: 'What helps most',
    status: 'Private',
    statusSub: 'Seen by the app owners only',
    legendTitle: 'A useful note usually includes',
    legendItems: [
      { label: 'What happened', color: 'var(--ring-outer)' },
      { label: 'What you expected', color: 'var(--ring-mid)' },
      { label: 'What blocked you', color: 'var(--ring-inner)' },
      { label: 'How urgent it feels', color: 'var(--be-motion-clay)', missing: true },
    ],
  },
  '/profile': {
    activePage: 'profile',
    noteLabel: 'Profile',
    note: 'Keep the contact details tied to your account current. Email changes are verified before they go live.',
    overviewLabel: 'Sign-in',
  },
}

export default function AuthorLayout({ children }) {
  const pathname = usePathname()
  const { profile, security } = useProfileStore(useShallow((state) => ({
    profile: state.profile,
    security: state.security,
  })))

  const { activePage, ...pageConfig } = PAGE_CONFIG[pathname] ?? {}
  const displayName = profileDisplayName(profile)
  const avatarInitials = profileInitials(profile)

  const sidebarProps = {
    ...pageConfig,
    avatarInitials,
    displayName,
    email: profile.email,
    ...(pathname === '/profile' && {
      status: security.ssoConfigured ? 'Single sign-on active' : 'Passwordless or email sign-in',
      statusSub: profile.mobile || 'Mobile not set',
    }),
  }

  return (
    <div className="be-page">
      <BragRail activePage={activePage} />
      <BragIdentitySidebar {...sidebarProps} />
      {children}
    </div>
  )
}
