'use client'

/**
 * AuthContext — provides authenticated user state to the protected component tree.
 *
 * The JWT lives in an httpOnly cookie (clausule_at); the client never accesses
 * it directly. On mount AuthProvider calls /api/auth/me to hydrate user claims
 * from the cookie, attempting a silent token refresh on 401 before giving up.
 *
 * Provided value:
 *   user    { id, email, role } | null
 *   loading boolean — true during initial hydration
 *   signIn  (userData) => void — call after successful authentication to hydrate
 *   logout  () => Promise<void> — revokes server session, clears cookies, redirects
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const router            = useRouter()
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      try {
        let res = await fetch('/api/auth/me', { credentials: 'same-origin' })

        if (res.status === 401) {
          // Attempt silent access-token refresh using the refresh-token cookie.
          const refresh = await fetch('/api/auth/refresh', {
            method:      'POST',
            credentials: 'same-origin',
          })

          if (refresh.ok) {
            res = await fetch('/api/auth/me', { credentials: 'same-origin' })
          } else {
            if (!cancelled) { setUser(null); setLoading(false) }
            return
          }
        }

        if (res.ok) {
          const { user: userData } = await res.json()
          if (!cancelled) setUser(userData)
        } else {
          if (!cancelled) setUser(null)
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    hydrate()
    return () => { cancelled = true }
  }, [])

  /**
   * Hydrate the context after a successful sign-in without an extra round-trip.
   * @param {{ id: string, email: string, role: string }} userData
   */
  const signIn = useCallback((userData) => {
    setUser(userData)
  }, [])

  /**
   * Revoke the server-side session, expire the auth cookies, clear context
   * state, and navigate to the sign-in page.
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    } catch {
      // Best-effort — navigate regardless of network errors.
    }
    setUser(null)
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Access auth context. Must be used inside <AuthProvider>.
 * @returns {{ user: {id,email,role}|null, loading: boolean, signIn: Function, logout: Function }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
