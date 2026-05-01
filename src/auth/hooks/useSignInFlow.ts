'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { sendCodeEmail } from '@auth/api-client/sendCodeEmail'
import { useSixDigitCode } from '@mfa/hooks/useSixDigitCode'
import { apiJson, jsonRequest } from '@shared/utils/api'
import { validateEmail } from '@shared/utils/emailValidation'
import { useCountdown } from '@shared/hooks/useCountdown'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'
import { homePathForRole } from '@shared/utils/routes'
import type { ChangeEvent, ClipboardEvent, FormEvent } from 'react'
import type { Role } from '@shared/types/contracts'

type SignInStep = 'email' | 'otp' | 'app'
type SignInState = {
  step: SignInStep
  email: string
  touched: boolean
  submitAttempted: boolean
  ssoError: string | null
  submitError: string | null
  verifyError: string | null
}
type SignInAction =
  | { type: 'hydrate_sso_error'; value: string | null }
  | { type: 'set_email'; value: string }
  | { type: 'accept_suggestion'; value: string }
  | { type: 'set_touched'; value: boolean }
  | { type: 'enter_otp'; email: string }
  | { type: 'begin_submit' }
  | { type: 'show_submit_error'; value: string }
  | { type: 'reset_code_step' }
  | { type: 'show_verify_error'; value: string }
  | { type: 'show_sso_message' }
  | { type: 'enter_app_step' }
  | { type: 'clear_verify_error' }

type SendCodeResponse = { nextStep?: 'signup'; mfaRequired?: boolean }
type VerifyCodeResponse = { nextStep?: 'signup' | 'sso' | 'mfa'; verificationToken?: string; role: Role }

const OTP_TTL_SECONDS = 600
const RESEND_COOLDOWN_SECONDS = 30
const SSO_ERROR_LABELS: Record<string, string> = {
  not_configured: 'That sign-in method is not yet enabled.',
  state_mismatch: 'Sign-in session expired — please try again.',
  invalid_state: 'Sign-in session invalid — please try again.',
  missing_params: 'Sign-in was incomplete — please try again.',
  token_exchange_failed: 'Could not connect to the sign-in provider.',
  no_email: 'Your account did not share an email address.',
  account_error: 'Account error — please try again or use email.',
  provider_mismatch: 'This account is linked to a different sign-in method. Try email instead.',
  mfa_required: 'This account requires email sign-in and your authenticator app.',
  sso_denied: 'Sign-in was cancelled.',
}

const INITIAL_STATE: SignInState = {
  step: 'email',
  email: '',
  touched: false,
  submitAttempted: false,
  ssoError: null,
  submitError: null,
  verifyError: null,
}

function reducer(state: SignInState, action: SignInAction): SignInState {
  switch (action.type) {
    case 'hydrate_sso_error':
      return { ...state, ssoError: action.value }
    case 'set_email':
      return {
        ...state,
        email: action.value,
        submitAttempted: false,
        submitError: null,
        verifyError: null,
      }
    case 'accept_suggestion':
      return {
        ...state,
        email: action.value,
        touched: false,
        submitAttempted: false,
        submitError: null,
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
        submitError: null,
        verifyError: null,
      }
    case 'begin_submit':
      return {
        ...state,
        touched: true,
        submitAttempted: true,
        ssoError: null,
        submitError: null,
      }
    case 'show_submit_error':
      return { ...state, submitError: action.value }
    case 'reset_code_step':
      return { ...state, step: 'email', submitError: null, verifyError: null }
    case 'show_verify_error':
      return { ...state, verifyError: action.value }
    case 'show_sso_message':
      return {
        ...state,
        step: 'email',
        submitError: null,
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

async function verifySignInRequest(endpoint: string, email: string, otp: string): Promise<VerifyCodeResponse> {
  return apiJson(endpoint, jsonRequest({ email, code: otp }, { method: 'POST' }), { retryOnUnauthorized: false })
}

export function useSignInFlow() {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const codeRefs = useRef<HTMLInputElement[]>([])
  const scheduleTimeout = useTrackedTimeout()
  const code = useSixDigitCode({ inputRefs: codeRefs, scheduleTimeout })
  const [expirySeconds, , resetExpirySeconds] = useCountdown(OTP_TTL_SECONDS, state.step === 'otp')
  const [resendTimer, , resetResendTimer] = useCountdown(RESEND_COOLDOWN_SECONDS, state.step === 'otp')

  const sendCodeMutation = useMutation<SendCodeResponse, Error, string>({
    mutationFn: sendCodeEmail,
  })

  const verifyCodeMutation = useMutation<VerifyCodeResponse, Error, { endpoint: string; digits: string[] }>({
    mutationFn: ({ endpoint, digits }) => verifySignInRequest(endpoint, state.email, digits.join('')),
  })

  useEffect(() => {
    dispatch({ type: 'hydrate_sso_error', value: ssoErrorFromUrl() })
  }, [])

  const handleEmailBlur = useCallback(() => {
    dispatch({ type: 'set_touched', value: true })
  }, [])

  const resetCodeStep = useCallback(() => {
    code.reset()
    dispatch({ type: 'reset_code_step' })
  }, [code])

  const verifySignInCode = useCallback(async (endpoint: string, digits: string[]) => {
    if (digits.join('').length !== 6) return
    code.setState('checking')
    dispatch({ type: 'clear_verify_error' })
    try {
      const data = await verifyCodeMutation.mutateAsync({ endpoint, digits })

      if (data.nextStep === 'signup' && data.verificationToken) {
        const normalizedEmail = state.email.trim().toLowerCase()
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

      if (!data.role) throw new Error('Missing sign-in role')
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

  const verifyOtp = useCallback((digits: string[]) => verifySignInCode('/api/auth/verify-code', digits), [verifySignInCode])
  const verifyApp = useCallback((digits: string[]) => verifySignInCode('/api/auth/totp/verify', digits), [verifySignInCode])
  const submitOtp = useCallback(() => verifyOtp(code.digits), [code.digits, verifyOtp])
  const submitApp = useCallback(() => verifyApp(code.digits), [code.digits, verifyApp])

  useEffect(() => {
    if (state.step !== 'otp' && state.step !== 'app') return
    if (code.state !== 'idle') return
    if (!code.digits.every(Boolean)) return
    if (state.step === 'otp') verifyOtp(code.digits)
    else verifyApp(code.digits)
  }, [code.digits, code.state, state.step, verifyOtp, verifyApp])

  const result = validateEmail(state.email)
  const showFeedback = state.touched || state.submitAttempted

  const handleEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'set_email', value: event.target.value })
  }, [])

  const acceptSuggestion = useCallback(() => {
    if (!result.suggestion) return
    dispatch({ type: 'accept_suggestion', value: result.suggestion })
  }, [result.suggestion])

  const submitEmail = useCallback(async (rawEmail: string) => {
    const trimmed = rawEmail.trim()
    if (!trimmed) return

    const validation = validateEmail(trimmed)
    if (!validation.valid && !validation.suggestion) return
    const resolved = validation.suggestion ?? trimmed
    dispatch({ type: 'begin_submit' })
    try {
      const data = await sendCodeMutation.mutateAsync(resolved)
      if (data?.nextStep === 'signup') {
        router.push(`/signup?email=${encodeURIComponent(resolved)}`)
        return
      }
      if (data?.mfaRequired) {
        dispatch({ type: 'set_email', value: resolved })
        code.setState('idle')
        dispatch({ type: 'enter_app_step' })
        return
      }
      resetExpirySeconds()
      resetResendTimer()
      code.setState('idle')
      dispatch({ type: 'enter_otp', email: resolved })
    } catch (error) {
      dispatch({
        type: 'show_submit_error',
        value: error instanceof Error && error.message ? error.message : 'Could not send a sign-in code. Try again.',
      })
    }
  }, [code, resetExpirySeconds, resetResendTimer, router, sendCodeMutation])

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitEmail(state.email)
  }, [state.email, submitEmail])

  const handlePaste = useCallback((event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData?.getData('text') ?? ''
    if (pasted.trim()) queueMicrotask(() => { void submitEmail(pasted) })
  }, [submitEmail])

  const handleResend = useCallback(async () => {
    try {
      await sendCodeMutation.mutateAsync(state.email)
      resetExpirySeconds()
      resetResendTimer()
      code.reset()
      dispatch({ type: 'clear_verify_error' })
    } catch (error) {
      dispatch({
        type: 'show_verify_error',
        value: error instanceof Error && error.message ? error.message : 'Could not resend the sign-in code. Try again.',
      })
    }
  }, [code, resetExpirySeconds, resetResendTimer, sendCodeMutation, state.email])

  return {
    btnLabel: sendCodeMutation.isPending ? 'Sending…' : 'Login',
    code,
    codeRefs,
    email: state.email,
    expirySeconds,
    handleEmailChange,
    handleEmailBlur,
    handlePaste,
    handleResend,
    handleSubmit,
    isChecking: sendCodeMutation.isPending,
    resetCodeStep,
    resendTimer,
    result,
    showFeedback,
    ssoError: state.ssoError,
    submitApp,
    submitError: state.submitError,
    submitOtp,
    step: state.step,
    touched: state.touched,
    verifyApp,
    verifyError: state.verifyError,
    verifyOtp,
    acceptSuggestion,
  }
}
