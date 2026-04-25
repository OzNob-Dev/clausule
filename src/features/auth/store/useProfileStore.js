'use client'

import { create } from 'zustand'

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  jobTitle: '',
  department: '',
}

const EMPTY_SECURITY = {
  authenticatorAppConfigured: false,
  authenticatedWithOtp: false,
  ssoConfigured: false,
}

const EMPTY_META = {
  hasSecuritySnapshot: false,
}

export const useProfileStore = create((set) => ({
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
