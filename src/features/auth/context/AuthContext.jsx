'use client'

/**
 * AuthContext — provides sign-in/sign-out actions to the component tree.
 *
 * User identity is stored in useProfileStore (Zustand) as the single source
 * of truth. This context only owns side-effectful actions that require the
 * Next.js router (logout redirect). Consumers read user via useProfileStore,
 * not from this context.
 *
 * Provided value:
 *   signIn     (userData) => void — hydrate user after successful auth
 *   updateUser (patch)    => void — partial update to user fields
 *   logout     ()         => Promise<void> — revoke session + redirect
 */

import { createContext, useContext, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileStore } from '@features/auth/store/useProfileStore'

const AuthContext = createContext(null)

export function AuthProvider({ children, initialSession = null }) {
  const router = useRouter()

  useEffect(() => {
    const store = useProfileStore.getState()
    if (!initialSession) {
      store.clearProfile()
      return
    }
    store.setUser(initialSession.user)
    store.setProfile(initialSession.profile)
    store.setSecurity(initialSession.security)
  }, [initialSession])

  const signIn = useCallback((userData) => {
    useProfileStore.getState().setUser(userData)
  }, [])

  const updateUser = useCallback((patch) => {
    useProfileStore.getState().updateUser(patch)
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    } catch {
      // Best-effort — navigate regardless of network errors.
    }
    useProfileStore.getState().clearProfile()
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider value={{ signIn, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Access auth actions. User identity is read directly from useProfileStore.
 * @returns {{ signIn: Function, updateUser: Function, logout: Function, user: object|null, loading: false }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  const user = useProfileStore((s) => s.user)
  return { ...ctx, user, loading: false }
}
