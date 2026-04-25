'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiFetch, jsonRequest } from '@shared/utils/api'
import { useCountdown } from '@shared/hooks/useCountdown'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'
import { ROUTES } from '@shared/utils/routes'
import { useSixDigitCode } from '@features/mfa/hooks/useSixDigitCode'
import { sendCodeEmail } from '@features/auth/api-client/sendCodeEmail'

const INITIAL_STATE = {
  step: 1,
  email: 'your email',
  hasMfaSetup: false,
  totpSecret: '',
  totpUri: '',
  copied: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'bootstrap_loaded':
      return {
        ...state,
        email: action.email,
        hasMfaSetup: action.hasMfaSetup,
      }
    case 'enter_totp_setup':
      return { ...state, step: 2 }
    case 'totp_loaded':
      return {
        ...state,
        totpSecret: action.secret,
        totpUri: action.uri,
      }
    case 'copy_secret':
      return { ...state, copied: true }
    case 'hide_copied':
      return { ...state, copied: false }
    case 'finish_setup':
      return { ...state, hasMfaSetup: true, step: 3 }
    default:
      return state
  }
}

export function useMfaSetupFlow() {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [resendTimer, , resetResendTimer] = useCountdown(30, state.step === 1)
  const otpRefs = useRef([])
  const totpRefs = useRef([])
  const scheduleTimeout = useTrackedTimeout()
  const otpCode = useSixDigitCode({ inputRefs: otpRefs, scheduleTimeout })
  const totpCode = useSixDigitCode({ inputRefs: totpRefs, scheduleTimeout })

  const bootstrapQuery = useQuery({
    queryKey: ['auth', 'bootstrap', 'mfa-setup'],
    queryFn: async () => {
      const response = await apiFetch('/api/auth/bootstrap')
      return response.ok ? response.json() : null
    },
    retry: false,
  })

  useEffect(() => {
    const data = bootstrapQuery.data
    if (!data) return
    dispatch({
      type: 'bootstrap_loaded',
      email: data.profile?.email || data.user?.email || 'your email',
      hasMfaSetup: Boolean(data.security?.authenticatorAppConfigured),
    })
  }, [bootstrapQuery.data])

  const totpSetupQuery = useQuery({
    queryKey: ['auth', 'totp-setup', 'mfa-screen'],
    queryFn: async () => {
      const response = await apiFetch('/api/auth/totp/setup')
      if (!response.ok) throw new Error('Could not load setup')
      return response.json()
    },
    enabled: state.step === 2 && !state.hasMfaSetup,
    retry: false,
  })

  useEffect(() => {
    if (!totpSetupQuery.data?.secret) return
    dispatch({
      type: 'totp_loaded',
      secret: totpSetupQuery.data.secret,
      uri: totpSetupQuery.data.uri ?? '',
    })
  }, [totpSetupQuery.data])

  const resendMutation = useMutation({
    mutationFn: () => sendCodeEmail(state.email),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: async (digits) => {
      const response = await fetch('/api/auth/verify-code', jsonRequest({ email: state.email, code: digits.join('') }, { method: 'POST' }))
      if (!response.ok) throw new Error('Incorrect code')
      return response
    },
  })

  const verifyTotpMutation = useMutation({
    mutationFn: async (digits) => {
      const code = digits.join('')
      if (!state.totpSecret) throw new Error('Missing secret')
      const response = await apiFetch('/api/auth/totp/setup', jsonRequest({ code, secret: state.totpSecret }, { method: 'POST' }))
      if (!response.ok) throw new Error('Incorrect code')
      return response
    },
  })

  const verifyOtp = useCallback(async (digits) => {
    otpCode.setState('checking')
    try {
      await verifyOtpMutation.mutateAsync(digits)
      otpCode.setState('done')
      if (state.hasMfaSetup) scheduleTimeout(() => router.replace(ROUTES.brag), 500)
      else scheduleTimeout(() => dispatch({ type: 'enter_totp_setup' }), 500)
    } catch {
      otpCode.setError()
    }
  }, [otpCode, router, scheduleTimeout, state.hasMfaSetup, verifyOtpMutation])

  const verifyTotp = useCallback(async (digits) => {
    if (!state.totpSecret) return
    totpCode.setState('checking')
    try {
      await verifyTotpMutation.mutateAsync(digits)
      totpCode.setState('done')
    } catch {
      totpCode.setError()
    }
  }, [state.totpSecret, totpCode, verifyTotpMutation])

  useEffect(() => {
    if (otpCode.state === 'idle' && otpCode.digits.every(Boolean)) verifyOtp(otpCode.digits)
  }, [otpCode.digits, otpCode.state, verifyOtp])

  useEffect(() => {
    if (state.step !== 2) return
    if (totpCode.state === 'idle' && totpCode.digits.every(Boolean)) verifyTotp(totpCode.digits)
  }, [state.step, totpCode.digits, totpCode.state, verifyTotp])

  const copySecret = useCallback(() => {
    navigator.clipboard?.writeText(state.totpSecret).catch(() => {})
    dispatch({ type: 'copy_secret' })
    scheduleTimeout(() => dispatch({ type: 'hide_copied' }), 2000)
  }, [scheduleTimeout, state.totpSecret])

  const finishSetup = useCallback(() => {
    dispatch({ type: 'finish_setup' })
  }, [])

  const handleResend = useCallback(async () => {
    try {
      await resendMutation.mutateAsync()
      resetResendTimer()
      otpCode.reset()
    } catch {}
  }, [otpCode, resendMutation, resetResendTimer])

  const enterApp = useCallback(() => router.push(ROUTES.brag), [router])
  const totpSecretDisp = state.totpSecret.match(/.{1,4}/g)?.join(' ') ?? state.totpSecret

  return {
    copied: state.copied,
    copySecret,
    email: state.email,
    enterApp,
    finishSetup,
    handleResend,
    otpCode,
    otpRefs,
    resendTimer,
    resetResendTimer,
    step: state.step,
    totpCode,
    totpDone: totpCode.state === 'done',
    totpLoading: totpSetupQuery.isPending,
    totpRefs,
    totpSecretDisp,
    totpUri: state.totpUri,
  }
}
