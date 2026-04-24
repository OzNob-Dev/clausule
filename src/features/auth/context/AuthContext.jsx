'use client'

/**
 * AuthContext — provides authenticated user state to the protected component tree.
 *
 * The JWT lives in an httpOnly cookie (clausule_at); the client never accesses
 * it directly. Protected routes provide the initial authenticated session from
 * the server so the client context can focus on local auth UI actions.
 *
 * Provided value:
 *   user    { id, email, role } | null
 *   loading boolean — kept for compatibility with existing consumers
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
import { useProfileStore } from '@features/auth/store/useProfileStore'

const AuthContext = createContext(null)

export function AuthProvider({ children, initialSession = null }) {
  const router = useRouter()
  const [user, setUser] = useState(initialSession?.user ?? null)
  const [loading] = useState(false)

  useEffect(() => {
    if (!initialSession) {
      useProfileStore.getState().clearProfile()
      setUser(null)
      return
    }

    const { setProfile, setSecurity } = useProfileStore.getState()
    setUser(initialSession.user)
    setProfile(initialSession.profile)
    setSecurity(initialSession.security)
  }, [initialSession])

  /**
   * Hydrate the context after a successful sign-in without an extra round-trip.
   * @param {{ id: string, email: string, role: string }} userData
   */
  const signIn = useCallback((userData) => {
    setUser(userData)
  }, [])

  const updateUser = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current))
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
    <AuthContext.Provider value={{ user, loading, signIn, updateUser, logout }}>
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
