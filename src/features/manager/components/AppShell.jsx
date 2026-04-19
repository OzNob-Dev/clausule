'use client'

import { AppShell as BaseAppShell } from '@shared/components/layout/AppShell'
import { RailNav } from '@shared/components/layout/RailNav'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'

export function AppShell({ children }) {
  const { logout } = useAuth()
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const locked = hasSecuritySnapshot && !authenticatorAppConfigured && !ssoConfigured

  return (
    <BaseAppShell rail={<RailNav locked={locked} onLogout={logout} />}>
      {children}
    </BaseAppShell>
  )
}
