// @ts-check
'use client'

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

/** @typedef {import('@shared/types/contracts').SignupStep1Data & { agreed: boolean, emailVerificationToken: string }} SignupStep1State */
/** @typedef {import('@shared/types/contracts').SignupStep2Data} SignupStep2State */
/** @typedef {{ step: 1 | 2 | 3, step1Data: SignupStep1State, step2Data: SignupStep2State }} SignupState */
/** @typedef {{ type: 'set_step', value: 1 | 2 | 3 } | { type: 'set_step1', value: SignupStep1State | ((current: SignupStep1State) => SignupStep1State) } | { type: 'set_step2', value: SignupStep2State | ((current: SignupStep2State) => SignupStep2State) } | { type: 'complete_payment' } | { type: 'reset' }} SignupAction */
/** @typedef {{ step: 1 | 2 | 3, setStep: (value: 1 | 2 | 3 | ((current: 1 | 2 | 3) => 1 | 2 | 3)) => void, step1Data: SignupStep1State, setStep1Data: (value: SignupStep1State | ((current: SignupStep1State) => SignupStep1State)) => void, step2Data: SignupStep2State, setStep2Data: (value: SignupStep2State | ((current: SignupStep2State) => SignupStep2State)) => void, completePayment: () => void, reset: () => void }} SignupContextValue */

const SignupContext = createContext(/** @type {SignupContextValue | null} */ (null))

/** @type {SignupStep1State} */
const EMPTY_STEP1 = { firstName: '', lastName: '', email: '', agreed: false, emailVerificationToken: '' }
/** @type {SignupStep2State} */
const EMPTY_STEP2 = { cardName: '', cardNum: '', expiry: '', cvc: '' }

/** @type {SignupState} */
const INITIAL_STATE = {
  step: 1,
  step1Data: EMPTY_STEP1,
  step2Data: EMPTY_STEP2,
}

/** @param {SignupState} state @param {SignupAction} action @returns {SignupState} */
function reducer(state, action) {
  switch (action.type) {
    case 'set_step':
      return { ...state, step: /** @type {1 | 2 | 3} */ (action.value) }
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

/** @param {{ children: import('react').ReactNode }} props */
export function SignupProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const setStep = useCallback(/** @param {1 | 2 | 3 | ((current: 1 | 2 | 3) => 1 | 2 | 3)} value */ (value) => {
    dispatch({ type: 'set_step', value: typeof value === 'function' ? value(state.step) : value })
  }, [state.step])

  const setStep1Data = useCallback(/** @param {SignupStep1State | ((current: SignupStep1State) => SignupStep1State)} value */ (value) => {
    dispatch({ type: 'set_step1', value })
  }, [])

  const setStep2Data = useCallback(/** @param {SignupStep2State | ((current: SignupStep2State) => SignupStep2State)} value */ (value) => {
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

/** @returns {SignupContextValue} */
export function useSignup() {
  const ctx = useContext(SignupContext)
  if (!ctx) throw new Error('useSignup must be used inside <SignupProvider>')
  return ctx
}
