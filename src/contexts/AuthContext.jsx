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
import { useProfileStore } from '@/stores/useProfileStore'
import { apiFetch } from '@/utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const router            = useRouter()
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const { setProfile, setSecurity, clearProfile } = useProfileStore.getState()

    async function hydrate() {
      try {
        const res = await apiFetch('/api/auth/bootstrap', { signal })

        if (res.ok) {
          const { user: userData, profile, security } = await res.json()
          setUser(userData)
          setProfile(profile)
          setSecurity(security)
        } else {
          clearProfile()
          setUser(null)
        }
        setLoading(false)
      } catch (err) {
        // AbortError means cleanup ran (Strict Mode remount or unmount) — skip state update.
        if (err.name !== 'AbortError') {
          clearProfile()
          setUser(null)
          setLoading(false)
        }
      }
    }

    hydrate()
    return () => controller.abort()
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
    useProfileStore.getState().clearProfile()
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
