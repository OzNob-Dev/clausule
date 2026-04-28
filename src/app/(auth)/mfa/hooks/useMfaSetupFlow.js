'use client'
// @ts-check

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiFetch, apiJson, jsonRequest, readJson } from '@shared/utils/api'
import { useCountdown } from '@shared/hooks/useCountdown'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'
import { ROUTES } from '@shared/utils/routes'
import { useSixDigitCode } from '@mfa/hooks/useSixDigitCode'
import { useTotpSetup } from '@mfa/hooks/useTotpSetup'
import { sendCodeEmail } from '@auth/api-client/sendCodeEmail'

/** @typedef {1 | 2 | 3} MfaSetupStep */
/** @typedef {{ step: MfaSetupStep, email: string, hasMfaSetup: boolean, totpSecret: string, totpUri: string }} MfaSetupState */

/** @type {MfaSetupState} */
const INITIAL_STATE = {
  step: 1,
  email: 'your email',
  hasMfaSetup: false,
  totpSecret: '',
  totpUri: '',
}

/** @param {MfaSetupState} state */
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
  const scheduleTimeout = useTrackedTimeout()
  const otpCode = useSixDigitCode({ inputRefs: otpRefs, scheduleTimeout })
  const totpSetup = useTotpSetup({ enabled: state.step === 2 && !state.hasMfaSetup })

  const bootstrapQuery = useQuery({
    queryKey: ['auth', 'bootstrap', 'mfa-setup'],
    queryFn: async () => {
      const response = await apiFetch('/api/auth/bootstrap')
      return response.ok ? readJson(response, null) : null
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

  useEffect(() => {
    if (!totpSetup.secret) return
    dispatch({
      type: 'totp_loaded',
      secret: totpSetup.secret,
      uri: totpSetup.uri,
    })
  }, [totpSetup.secret, totpSetup.uri])

  const resendMutation = useMutation({
    mutationFn: () => sendCodeEmail(state.email),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: (digits) =>
      apiJson('/api/auth/verify-code', jsonRequest({ email: state.email, code: digits.join('') }, { method: 'POST' }), { retryOnUnauthorized: false }),
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

  useEffect(() => {
    if (otpCode.state === 'idle' && otpCode.digits.every(Boolean)) verifyOtp(otpCode.digits)
  }, [otpCode.digits, otpCode.state, verifyOtp])

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
    copied: totpSetup.copied,
    copySecret: totpSetup.copySecret,
    email: state.email,
    enterApp,
    finishSetup,
    handleResend,
    otpCode,
    otpRefs,
    resendTimer,
    resetResendTimer,
    step: state.step,
    totpCode: totpSetup.totpCode,
    totpDone: totpSetup.totpCode.state === 'done',
    totpLoading: totpSetup.loading,
    totpRefs: totpSetup.inputRefs,
    totpSecretDisp,
    totpUri: state.totpUri,
  }
}
