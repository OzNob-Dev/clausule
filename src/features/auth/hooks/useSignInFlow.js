'use client'
// @ts-check

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { sendCodeEmail } from '@features/auth/api-client/sendCodeEmail'
import { useSixDigitCode } from '@features/mfa/hooks/useSixDigitCode'
import { apiJson, jsonRequest } from '@shared/utils/api'
import { validateEmail } from '@shared/utils/emailValidation'
import { useCountdown } from '@shared/hooks/useCountdown'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'
import { homePathForRole } from '@shared/utils/routes'

/** @typedef {'email' | 'otp' | 'app'} SignInStep */
/** @typedef {{ step: SignInStep, email: string, touched: boolean, submitAttempted: boolean, ssoError: string | null, verifyError: string | null }} SignInState */

const OTP_TTL_SECONDS = 600
const RESEND_COOLDOWN_SECONDS = 30
const SSO_ERROR_LABELS = {
  not_configured: 'That sign-in method is not yet enabled.',
  state_mismatch: 'Sign-in session expired — please try again.',
  invalid_state: 'Sign-in session invalid — please try again.',
  missing_params: 'Sign-in was incomplete — please try again.',
  token_exchange_failed: 'Could not connect to the sign-in provider.',
  no_email: 'Your account did not share an email address.',
  account_error: 'Account error — please try again or use email.',
  sso_denied: 'Sign-in was cancelled.',
}

/** @type {SignInState} */
const INITIAL_STATE = {
  step: 'email',
  email: '',
  touched: false,
  submitAttempted: false,
  ssoError: null,
  verifyError: null,
}

/** @param {SignInState} state */
function reducer(state, action) {
  switch (action.type) {
    case 'hydrate_sso_error':
      return { ...state, ssoError: action.value }
    case 'set_email':
      return {
        ...state,
        email: action.value,
        submitAttempted: false,
        verifyError: null,
      }
    case 'accept_suggestion':
      return {
        ...state,
        email: action.value,
        touched: false,
        submitAttempted: false,
        verifyError: null,
      }
    case 'set_touched':
      return { ...state, touched: action.value }
    case 'enter_otp':
      return {
        ...state,
        step: 'otp',
        email: action.email,
        touched: true,
        submitAttempted: true,
        ssoError: null,
        verifyError: null,
      }
    case 'begin_submit':
      return {
        ...state,
        touched: true,
        submitAttempted: true,
        ssoError: null,
      }
    case 'reset_code_step':
      return { ...state, step: 'email', verifyError: null }
    case 'show_verify_error':
      return { ...state, verifyError: action.value }
    case 'show_sso_message':
      return {
        ...state,
        step: 'email',
        verifyError: null,
        ssoError: 'Use your sign-in provider below to continue.',
      }
    case 'enter_app_step':
      return { ...state, step: 'app', verifyError: null }
    case 'clear_verify_error':
      return { ...state, verifyError: null }
    default:
      return state
  }
}

function ssoErrorFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const errorCode = params.get('sso_error')
  if (!errorCode) return null

  params.delete('sso_error')
  const clean = [window.location.pathname, params.toString()].filter(Boolean).join('?')
  window.history.replaceState(null, '', clean)
  return SSO_ERROR_LABELS[errorCode] ?? 'Sign-in failed — please try again.'
}

async function verifySignInRequest(endpoint, email, otp) {
  return apiJson(endpoint, jsonRequest({ email, code: otp }, { method: 'POST' }), { retryOnUnauthorized: false })
}

export function useSignInFlow() {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const codeRefs = useRef([])
  const scheduleTimeout = useTrackedTimeout()
  const code = useSixDigitCode({ inputRefs: codeRefs, scheduleTimeout })
  const [expirySeconds, , resetExpirySeconds] = useCountdown(OTP_TTL_SECONDS, state.step === 'otp')
  const [resendTimer, , resetResendTimer] = useCountdown(RESEND_COOLDOWN_SECONDS, state.step === 'otp')

  const sendCodeMutation = useMutation({
    mutationFn: sendCodeEmail,
  })

  const verifyCodeMutation = useMutation({
    mutationFn: ({ endpoint, digits }) => verifySignInRequest(endpoint, state.email, digits.join('')),
  })

  useEffect(() => {
    dispatch({ type: 'hydrate_sso_error', value: ssoErrorFromUrl() })
  }, [])

  const resetCodeStep = useCallback(() => {
    code.setState('idle')
    dispatch({ type: 'reset_code_step' })
  }, [code])

  const verifySignInCode = useCallback(async (endpoint, digits) => {
    if (digits.join('').length !== 6) return
    code.setState('checking')
    dispatch({ type: 'clear_verify_error' })
    try {
      const data = await verifyCodeMutation.mutateAsync({ endpoint, digits })

      if (data.nextStep === 'signup' && data.verificationToken) {
        const normalizedEmail = state.email.trim().toLowerCase()
        window.sessionStorage.setItem(`signup_verification:${normalizedEmail}`, data.verificationToken)
        code.setState('done')
        scheduleTimeout(() => router.push(`/signup?email=${encodeURIComponent(normalizedEmail)}`), 200)
        return
      }
      if (data.nextStep === 'sso') {
        code.reset()
        dispatch({ type: 'show_sso_message' })
        return
      }
      if (data.nextStep === 'mfa') {
        code.reset()
        dispatch({ type: 'enter_app_step' })
        return
      }

      code.setState('done')
      scheduleTimeout(() => router.replace(homePathForRole(data.role)), 400)
    } catch (error) {
      code.setError()
      dispatch({
        type: 'show_verify_error',
        value: error instanceof Error && error.message ? error.message : 'Something went wrong — try again',
      })
    }
  }, [code, router, scheduleTimeout, state.email, verifyCodeMutation])

  const verifyOtp = useCallback((digits) => verifySignInCode('/api/auth/verify-code', digits), [verifySignInCode])
  const verifyApp = useCallback((digits) => verifySignInCode('/api/auth/totp/verify', digits), [verifySignInCode])

  useEffect(() => {
    if (state.step !== 'otp' && state.step !== 'app') return
    if (code.state !== 'idle') return
    if (!code.digits.every(Boolean)) return
    if (state.step === 'otp') verifyOtp(code.digits)
    else verifyApp(code.digits)
  }, [code.digits, code.state, state.step, verifyOtp, verifyApp])

  const result = validateEmail(state.email)
  const showFeedback = state.touched || state.submitAttempted

  const handleEmailChange = useCallback((event) => {
    dispatch({ type: 'set_email', value: event.target.value })
  }, [])

  const acceptSuggestion = useCallback(() => {
    dispatch({ type: 'accept_suggestion', value: result.suggestion })
  }, [result.suggestion])

  const submitEmail = useCallback(async (rawEmail) => {
    const trimmed = rawEmail.trim()
    if (!trimmed) return

    const validation = validateEmail(trimmed)
    if (!validation.valid && !validation.suggestion) return
    const resolved = validation.suggestion ?? trimmed
    dispatch({ type: 'begin_submit' })
    try {
      await sendCodeMutation.mutateAsync(resolved)
      resetExpirySeconds()
      resetResendTimer()
      code.setState('idle')
      dispatch({ type: 'enter_otp', email: resolved })
    } catch {}
  }, [code, resetExpirySeconds, resetResendTimer, sendCodeMutation])

  const handleSubmit = useCallback((event) => {
    event.preventDefault()
    submitEmail(state.email)
  }, [state.email, submitEmail])

  const handlePaste = useCallback((event) => {
    const pasted = event.clipboardData?.getData('text') ?? ''
    if (pasted.trim()) setTimeout(() => submitEmail(pasted), 0)
  }, [submitEmail])

  const handleResend = useCallback(async () => {
    try {
      await sendCodeMutation.mutateAsync(state.email)
      resetExpirySeconds()
      resetResendTimer()
      code.reset()
      dispatch({ type: 'clear_verify_error' })
    } catch {}
  }, [code, resetExpirySeconds, resetResendTimer, sendCodeMutation, state.email])

  return {
    btnLabel: sendCodeMutation.isPending ? 'Sending…' : 'Login',
    code,
    codeRefs,
    email: state.email,
    expirySeconds,
    handleEmailChange,
    handlePaste,
    handleResend,
    handleSubmit,
    isChecking: sendCodeMutation.isPending,
    isNewAccount: false,
    resetCodeStep,
    resendTimer,
    result,
    showFeedback,
    ssoError: state.ssoError,
    step: state.step,
    touched: state.touched,
    verifyApp,
    verifyError: state.verifyError,
    verifyOtp,
    acceptSuggestion,
    setTouched: (value) => dispatch({ type: 'set_touched', value }),
  }
}
