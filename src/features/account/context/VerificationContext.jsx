'use client'

import { createContext, useContext } from 'react'

const VerificationContext = createContext(null)

/**
 * Scopes verification state to the modal subtree so VerifyChangesModal does
 * not need 14+ individual props threaded from ProfileScreen.
 */
export function VerificationProvider({
  verification,
  saving,
  emailChanged,
  mobileChanged,
  initial,
  current,
  security,
  children,
}) {
  return (
    <VerificationContext.Provider
      value={{ verification, saving, emailChanged, mobileChanged, initial, current, security }}
    >
      {children}
    </VerificationContext.Provider>
  )
}

export function useVerification() {
  const ctx = useContext(VerificationContext)
  if (!ctx) throw new Error('useVerification must be used inside <VerificationProvider>')
  return ctx
}
