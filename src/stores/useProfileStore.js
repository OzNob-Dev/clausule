'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
}

export const useProfileStore = create(
  persist(
    (set) => ({
      profile: EMPTY_PROFILE,
      setProfile: (nextProfile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...EMPTY_PROFILE,
            ...nextProfile,
          },
        })),
      clearProfile: () => set({ profile: EMPTY_PROFILE }),
    }),
    {
      name: 'clausule-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
