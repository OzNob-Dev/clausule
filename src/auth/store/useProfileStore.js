'use client'
// @ts-check

import { create } from 'zustand'

/** @typedef {import('@shared/types/contracts').AuthUser} AuthUser */
/** @typedef {import('@shared/types/contracts').Profile} Profile */
/** @typedef {import('@shared/types/contracts').SecuritySnapshot} SecuritySnapshot */

/** @type {Profile} */
const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  jobTitle: '',
  department: '',
}

/** @type {SecuritySnapshot} */
const EMPTY_SECURITY = {
  authenticatorAppConfigured: false,
  authenticatedWithOtp: false,
  ssoConfigured: false,
}

const EMPTY_META = {
  hasSecuritySnapshot: false,
}

/**
 * @typedef {{
 *   user: AuthUser | null,
 *   profile: Profile,
 *   security: SecuritySnapshot,
 *   hasSecuritySnapshot: boolean,
 *   setUser: (user: AuthUser | null) => void,
 *   updateUser: (patch: Partial<AuthUser>) => void,
 *   setProfile: (nextProfile: Partial<Profile>) => void,
 *   setSecurity: (nextSecurity: Partial<SecuritySnapshot>) => void,
 *   clearProfile: () => void,
 * }} ProfileStoreState
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<ProfileStoreState>>} */
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
