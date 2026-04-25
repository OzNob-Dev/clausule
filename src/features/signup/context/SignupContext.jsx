// @ts-check
'use client'

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

/** @typedef {import('@shared/types/contracts').SignupStep1Data & { agreed: boolean, emailVerificationToken: string }} SignupStep1State */
/** @typedef {import('@shared/types/contracts').SignupStep2Data} SignupStep2State */

const SignupContext = createContext(null)

/** @type {SignupStep1State} */
const EMPTY_STEP1 = { firstName: '', lastName: '', email: '', agreed: false, emailVerificationToken: '' }
/** @type {SignupStep2State} */
const EMPTY_STEP2 = { cardName: '', cardNum: '', expiry: '', cvc: '' }

const INITIAL_STATE = {
  step: 1,
  step1Data: EMPTY_STEP1,
  step2Data: EMPTY_STEP2,
}

function reducer(state, action) {
  switch (action.type) {
    case 'set_step':
      return { ...state, step: action.value }
    case 'set_step1':
      return { ...state, step1Data: typeof action.value === 'function' ? action.value(state.step1Data) : action.value }
    case 'set_step2':
      return { ...state, step2Data: typeof action.value === 'function' ? action.value(state.step2Data) : action.value }
    case 'complete_payment':
      return { ...state, step: 3, step2Data: EMPTY_STEP2 }
    case 'reset':
      return INITIAL_STATE
    default:
      return state
  }
}

export function SignupProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const setStep = useCallback((value) => {
    dispatch({ type: 'set_step', value: typeof value === 'function' ? value(state.step) : value })
  }, [state.step])

  const setStep1Data = useCallback((value) => {
    dispatch({ type: 'set_step1', value })
  }, [])

  const setStep2Data = useCallback((value) => {
    dispatch({ type: 'set_step2', value })
  }, [])

  /**
   * Called after payment succeeds. Advances to the confirmation step
   * and immediately wipes card data from context so sensitive PAN/CVC
   * data does not linger in memory beyond the point of submission.
   */
  const completePayment = useCallback(() => {
    dispatch({ type: 'complete_payment' })
  }, [])

  /** Full reset — used if the user navigates back to step 1 from step 3 or on unmount. */
  const reset = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [])

  const value = useMemo(() => ({
    step: state.step,
    setStep,
    step1Data: state.step1Data,
    setStep1Data,
    step2Data: state.step2Data,
    setStep2Data,
    completePayment,
    reset,
  }), [completePayment, reset, setStep, setStep1Data, setStep2Data, state.step, state.step1Data, state.step2Data])

  return (
    <SignupContext.Provider value={value}>
      {children}
    </SignupContext.Provider>
  )
}

export function useSignup() {
  const ctx = useContext(SignupContext)
  if (!ctx) throw new Error('useSignup must be used inside <SignupProvider>')
  return ctx
}
