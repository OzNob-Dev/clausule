'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendCodeEmail } from '@features/auth/api-client/sendCodeEmail'
import { useSixDigitCode } from '@features/mfa/hooks/useSixDigitCode'
import { jsonRequest } from '@shared/utils/api'
import { validateEmail } from '@shared/utils/emailValidation'
import { useCountdown } from '@shared/hooks/useCountdown'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'
import { homePathForRole } from '@shared/utils/routes'

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

function ssoErrorFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const errorCode = params.get('sso_error')
  if (!errorCode) return null

  params.delete('sso_error')
  const clean = [window.location.pathname, params.toString()].filter(Boolean).join('?')
  window.history.replaceState(null, '', clean)
  return SSO_ERROR_LABELS[errorCode] ?? 'Sign-in failed — please try again.'
}

export function useSignInFlow() {
  const router = useRouter()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [sending, setSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState('idle')
  const [ssoError, setSsoError] = useState(null)
  const [verifyError, setVerifyError] = useState(null)

  const lastCheckedRef = useRef('')
  const codeRefs = useRef([])
  const scheduleTimeout = useTrackedTimeout()
  const code = useSixDigitCode({ inputRefs: codeRefs, scheduleTimeout })
  const [expirySeconds, , resetExpirySeconds] = useCountdown(OTP_TTL_SECONDS, step === 'otp')
  const [resendTimer, , resetResendTimer] = useCountdown(RESEND_COOLDOWN_SECONDS, step === 'otp')

  useEffect(() => {
    setSsoError(ssoErrorFromUrl())
  }, [])

  const resetCodeStep = useCallback(() => {
    setStep('email')
    code.setState('idle')
    setVerifyError(null)
  }, [code])

  const verifySignInCode = useCallback(async (endpoint, digits) => {
    const otp = digits.join('')
    if (otp.length !== 6) return

    code.setState('checking')
    setVerifyError(null)

    try {
      const res = await fetch(endpoint, jsonRequest({ email, code: otp }, { method: 'POST' }))
      if (!res.ok) {
        code.setError()
        setVerifyError('Incorrect code — try again')
        return
      }

      code.setState('done')
      const { role } = await res.json()
      scheduleTimeout(() => router.replace(homePathForRole(role)), 400)
    } catch {
      code.setError()
      setVerifyError('Something went wrong — try again')
    }
  }, [code, email, router, scheduleTimeout])

  const verifyOtp = useCallback((digits) => verifySignInCode('/api/auth/verify-code', digits), [verifySignInCode])
  const verifyApp = useCallback((digits) => verifySignInCode('/api/auth/totp/verify', digits), [verifySignInCode])

  useEffect(() => {
    if (step !== 'otp' && step !== 'app') return
    if (code.state !== 'idle') return
    if (!code.digits.every(Boolean)) return
    if (step === 'otp') verifyOtp(code.digits)
    else verifyApp(code.digits)
  }, [code.digits, code.state, step, verifyOtp, verifyApp])

  const result = validateEmail(email)
  const showFeedback = touched || submitAttempted

  const handleEmailChange = useCallback((event) => {
    setEmail(event.target.value)
    setSubmitAttempted(false)
    if (emailStatus !== 'idle') setEmailStatus('idle')
  }, [emailStatus])

  const acceptSuggestion = useCallback(() => {
    setEmail(result.suggestion)
    setTouched(false)
    setSubmitAttempted(false)
    setEmailStatus('idle')
    lastCheckedRef.current = ''
  }, [result.suggestion])

  const submitEmail = useCallback(async (rawEmail) => {
    const trimmed = rawEmail.trim()
    if (!trimmed) return

    const validation = validateEmail(trimmed)
    if (!validation.valid && !validation.suggestion) return
    const resolved = validation.suggestion ?? trimmed

    setSubmitAttempted(true)
    setTouched(true)

    let status = emailStatus
    if (status === 'idle' || status === 'checking' || resolved !== lastCheckedRef.current) {
      lastCheckedRef.current = resolved
      setEmailStatus('checking')

      try {
        const res = await fetch('/api/auth/check-email', jsonRequest({ email: resolved }, { method: 'POST' }))
        if (!res.ok) throw new Error('Email check failed')
        const data = await res.json()

        if (data.nextStep === 'signup') {
          setEmailStatus('new')
          router.push(`/signup?email=${encodeURIComponent(resolved)}`)
          return
        }

        if (data.nextStep === 'sso') {
          setEmailStatus('idle')
          setSsoError('Use your sign-in provider below to continue.')
          return
        }

        status = data.nextStep === 'mfa' ? 'mfa' : 'otp'
        setEmailStatus(status)
      } catch {
        setEmailStatus('idle')
        return
      }
    }

    if (status === 'mfa') {
      setEmail(resolved)
      setStep('app')
      return
    }

    setSending(true)
    try {
      await sendCodeEmail(resolved)
      resetExpirySeconds()
      resetResendTimer()
      code.setState('idle')
      setStep('otp')
    } catch {
      // Stay on email step.
    } finally {
      setSending(false)
    }
  }, [code, emailStatus, resetExpirySeconds, resetResendTimer, router])

  const handleSubmit = useCallback((event) => {
    event.preventDefault()
    submitEmail(email)
  }, [email, submitEmail])

  const handlePaste = useCallback((event) => {
    const pasted = event.clipboardData?.getData('text') ?? ''
    if (pasted.trim()) setTimeout(() => submitEmail(pasted), 0)
  }, [submitEmail])

  const handleResend = useCallback(async () => {
    try {
      await sendCodeEmail(email)
      resetExpirySeconds()
      resetResendTimer()
      code.reset()
      setVerifyError(null)
    } catch {
      // Keep the current code screen available.
    }
  }, [code, email, resetExpirySeconds, resetResendTimer])

  const isChecking = emailStatus === 'checking' || sending
  const isNewAccount = emailStatus === 'new'
  const btnLabel = isChecking ? (sending ? 'Sending…' : 'Checking…') : isNewAccount ? 'Create account →' : 'Login'
  const resolvedEmail = email

  return {
    btnLabel,
    code,
    codeRefs,
    email,
    expirySeconds,
    handleEmailChange,
    handlePaste,
    handleResend,
    handleSubmit,
    isChecking,
    isNewAccount,
    resetCodeStep,
    resendTimer,
    resolvedEmail,
    result,
    showFeedback,
    ssoError,
    step,
    touched,
    verifyApp,
    verifyError,
    verifyOtp,
    acceptSuggestion,
    setTouched,
  }
}
