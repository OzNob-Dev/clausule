'use client'

import { useEffect }                    from 'react'
import { useRouter }                    from 'next/navigation'
import { AuthProvider, useAuth }        from '@/contexts/AuthContext'

/**
 * Inner guard — consumes AuthContext to redirect unauthenticated visitors.
 * Rendered inside AuthProvider so it can access the context.
 */
function AuthGuard({ children }) {
  const router          = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [loading, user, router])

  // Suppress render until we know the user is authenticated.
  if (loading || !user) return null
  return children
}

export default function ProtectedLayout({ children }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  )
}
