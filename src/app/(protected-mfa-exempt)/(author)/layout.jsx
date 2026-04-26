'use client'

import { useShallow } from 'zustand/shallow'
import BragRail from '@features/brag/components/BragRail'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import '@features/brag/styles/brag-shell.css'

export default function AuthorLayout({ children }) {
  const { profile } = useProfileStore(useShallow((state) => ({
    profile: state.profile,
  })))

  const displayName = profileDisplayName(profile)
  const avatarInitials = profileInitials(profile)

  return (
    <div className="be-page">
      <BragRail activePage="settings" />
      <BragIdentitySidebar
        ariaLabel="Profile"
        eyebrow="Clausule · Settings"
        noteLabel="Account security"
        note="Manage two-factor authentication for secure sign-in."
        avatarInitials={avatarInitials}
        displayName={displayName}
        email={profile.email}
      />
      {children}
    </div>
  )
}
