'use client'

import { useEffect }                    from 'react'
import { usePathname, useRouter }       from 'next/navigation'
import { AuthProvider, useAuth }        from '@features/auth/context/AuthContext'
import { useProfileStore }              from '@features/auth/store/useProfileStore'

/**
 * Inner guard — consumes AuthContext to redirect unauthenticated visitors.
 * Rendered inside AuthProvider so it can access the context.
 */
function AuthGuard({ children }) {
  const router          = useRouter()
  const pathname        = usePathname()
  const { user, loading } = useAuth()
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const mfaSetupRequired = hasSecuritySnapshot && !authenticatorAppConfigured && !ssoConfigured

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!loading && user && mfaSetupRequired && pathname !== '/brag/settings') {
      router.replace('/brag/settings')
    }
  }, [loading, mfaSetupRequired, pathname, router, user])

  // Suppress render until we know the user is authenticated.
  if (loading || !user) return null
  if (mfaSetupRequired && pathname !== '/brag/settings') return null
  return children
}

export default function ProtectedLayout({ children }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  )
}
