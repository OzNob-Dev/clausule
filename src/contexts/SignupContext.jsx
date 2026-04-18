'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const SignupContext = createContext(null)

const EMPTY_STEP1 = { firstName: '', lastName: '', email: '', agreed: false }
const EMPTY_STEP2 = { cardName: '', cardNum: '', expiry: '', cvc: '' }

export function SignupProvider({ children }) {
  const [step, setStep]         = useState(1)
  const [step1Data, setStep1Data] = useState(EMPTY_STEP1)
  const [step2Data, setStep2Data] = useState(EMPTY_STEP2)

  /**
   * Called after payment succeeds. Advances to the confirmation step
   * and immediately wipes card data from context so sensitive PAN/CVC
   * data does not linger in memory beyond the point of submission.
   */
  const completePayment = useCallback(() => {
    setStep2Data(EMPTY_STEP2)
    setStep(3)
  }, [])

  /** Full reset — used if the user navigates back to step 1 from step 3 or on unmount. */
  const reset = useCallback(() => {
    setStep(1)
    setStep1Data(EMPTY_STEP1)
    setStep2Data(EMPTY_STEP2)
  }, [])

  return (
    <SignupContext.Provider value={{ step, setStep, step1Data, setStep1Data, step2Data, setStep2Data, completePayment, reset }}>
      {children}
    </SignupContext.Provider>
  )
}

export function useSignup() {
  const ctx = useContext(SignupContext)
  if (!ctx) throw new Error('useSignup must be used inside <SignupProvider>')
  return ctx
}
