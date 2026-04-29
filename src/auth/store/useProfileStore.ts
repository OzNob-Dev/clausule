'use client'

import { create } from 'zustand'
import type { AuthUser, Profile, SecuritySnapshot } from '@shared/types/contracts'

const EMPTY_PROFILE: Profile = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  jobTitle: '',
  department: '',
}

const EMPTY_SECURITY: SecuritySnapshot = {
  authenticatorAppConfigured: false,
  authenticatedWithOtp: false,
  ssoConfigured: false,
}

const EMPTY_META = {
  hasSecuritySnapshot: false,
}

type ProfileStoreState = {
  user: AuthUser | null
  profile: Profile
  security: SecuritySnapshot
  hasSecuritySnapshot: boolean
  setUser: (user: AuthUser | null) => void
  updateUser: (patch: Partial<AuthUser>) => void
  setProfile: (nextProfile: Partial<Profile>) => void
  setSecurity: (nextSecurity: Partial<SecuritySnapshot>) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileStoreState>()((set) => ({
  user: null,
  profile: EMPTY_PROFILE,
  security: EMPTY_SECURITY,
  ...EMPTY_META,
  setUser: (user) => set({ user }),
  updateUser: (patch) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...patch } : state.user,
    })),
  setProfile: (nextProfile) =>
    set((state) => ({
      profile: {
        ...EMPTY_PROFILE,
        ...state.profile,
        ...nextProfile,
      },
    })),
  setSecurity: (nextSecurity) =>
    set((state) => ({
      security: {
        ...EMPTY_SECURITY,
        ...state.security,
        ...nextSecurity,
      },
      hasSecuritySnapshot: true,
    })),
  clearProfile: () =>
    set({
      user: null,
      profile: EMPTY_PROFILE,
      security: EMPTY_SECURITY,
      ...EMPTY_META,
    }),
}))
