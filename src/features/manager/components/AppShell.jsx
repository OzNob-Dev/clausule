'use client'

import { AppShell as BaseAppShell } from '@shared/components/layout/AppShell'
import { RailNav } from '@shared/components/layout/RailNav'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'

export function AppShell({ children }) {
  const { logout } = useAuth()
  const locked = useProfileStore(
    (s) => s.hasSecuritySnapshot && !s.security.authenticatorAppConfigured && !s.security.ssoConfigured
  )
  const profile = useProfileStore((s) => s.profile)
  const userInitials = profileInitials(profile)
  const userTitle = profileDisplayName(profile)

  return (
    <BaseAppShell rail={<RailNav locked={locked} onLogout={logout} userInitials={userInitials} userTitle={userTitle} />}>
      {children}
    </BaseAppShell>
  )
}
