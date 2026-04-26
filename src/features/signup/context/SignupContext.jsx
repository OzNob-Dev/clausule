// @ts-check
'use client'

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

/** @typedef {import('@shared/types/contracts').SignupStep1Data & { agreed: boolean }} SignupStep1State */
/** @typedef {{ step: 1 | 2 | 3, step1Data: SignupStep1State }} SignupState */
/** @typedef {{ type: 'set_step', value: 1 | 2 | 3 | ((current: 1 | 2 | 3) => 1 | 2 | 3) } | { type: 'set_step1', value: SignupStep1State | ((current: SignupStep1State) => SignupStep1State) } | { type: 'complete_signup' }} SignupAction */
/** @typedef {{ step: 1 | 2 | 3, setStep: (value: 1 | 2 | 3 | ((current: 1 | 2 | 3) => 1 | 2 | 3)) => void, step1Data: SignupStep1State, setStep1Data: (value: SignupStep1State | ((current: SignupStep1State) => SignupStep1State)) => void, completeSignup: () => void }} SignupContextValue */

const SignupContext = createContext(/** @type {SignupContextValue | null} */ (null))

/** @type {SignupStep1State} */
const EMPTY_STEP1 = { firstName: '', lastName: '', email: '', agreed: false }

/** @type {SignupState} */
const INITIAL_STATE = {
  step: 1,
  step1Data: EMPTY_STEP1,
}

/** @param {SignupState} state @param {SignupAction} action @returns {SignupState} */
function reducer(state, action) {
  switch (action.type) {
    case 'set_step': {
      const a = /** @type {{ type: 'set_step', value: 1 | 2 | 3 | ((current: 1 | 2 | 3) => 1 | 2 | 3) }} */ (action)
      return { ...state, step: typeof a.value === 'function' ? a.value(state.step) : a.value }
    }
    case 'set_step1': {
      const a = /** @type {{ type: 'set_step1', value: SignupStep1State | ((current: SignupStep1State) => SignupStep1State) }} */ (action)
      return { ...state, step1Data: typeof a.value === 'function' ? a.value(state.step1Data) : a.value }
    }
    case 'complete_signup':
      return { ...state, step: 3 }
    default:
      return state
  }
}

/** @param {{ children: import('react').ReactNode }} props */
export function SignupProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const setStep = useCallback(/** @param {1 | 2 | 3 | ((current: 1 | 2 | 3) => 1 | 2 | 3)} value */ (value) => {
    dispatch({ type: 'set_step', value })
  }, [])

  const setStep1Data = useCallback(/** @param {SignupStep1State | ((current: SignupStep1State) => SignupStep1State)} value */ (value) => {
    dispatch({ type: 'set_step1', value })
  }, [])

  const completeSignup = useCallback(() => {
    dispatch({ type: 'complete_signup' })
  }, [])

  const value = useMemo(() => ({
    step: state.step,
    setStep,
    step1Data: state.step1Data,
    setStep1Data,
    completeSignup,
  }), [completeSignup, setStep, setStep1Data, state.step, state.step1Data])

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
