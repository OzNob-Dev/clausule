'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
}

const EMPTY_SECURITY = {
  authenticatorAppConfigured: false,
  authenticatedWithOtp: false,
  ssoConfigured: false,
}

const EMPTY_META = {
  hasSecuritySnapshot: false,
}

export const useProfileStore = create(
  persist(
    (set) => ({
      profile: EMPTY_PROFILE,
      security: EMPTY_SECURITY,
      ...EMPTY_META,
      setProfile: (nextProfile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...EMPTY_PROFILE,
            ...nextProfile,
          },
        })),
      setSecurity: (nextSecurity) =>
        set((state) => ({
          security: {
            ...state.security,
            ...EMPTY_SECURITY,
            ...nextSecurity,
          },
          hasSecuritySnapshot: true,
        })),
      clearProfile: () =>
        set({
          profile: EMPTY_PROFILE,
          security: EMPTY_SECURITY,
          ...EMPTY_META,
        }),
    }),
    {
      name: 'clausule-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        security: state.security,
      }),
    }
  )
)
