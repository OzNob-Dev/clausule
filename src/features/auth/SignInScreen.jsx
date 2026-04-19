'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@shared/utils/storage'
import { validateEmail } from '@shared/utils/emailValidation'
import { sendCodeEmail } from '@features/auth/api-client/sendCodeEmail'
import { apiFetch, jsonRequest } from '@shared/utils/api'
import { useCountdown } from '@shared/hooks/useCountdown'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'
import { homePathForRole } from '@shared/utils/routes'
import { ssoConfigFromEnv } from '@shared/utils/sso'
import { useSixDigitCode } from '@features/mfa/hooks/useSixDigitCode'
import SignInBrandPanel from '@features/auth/components/SignInBrandPanel'
import SignInEmailForm from '@features/auth/components/SignInEmailForm'
import SignUpPrompt from '@features/auth/components/SignUpPrompt'
import SsoButtons from '@features/auth/components/SsoButtons'
import MfaLoginEmailStep from '@features/mfa/components/MfaLoginEmailStep'
import MfaLoginAppStep from '@features/mfa/components/MfaLoginAppStep'
import '@features/auth/styles/signin.css'
import '@features/mfa/styles/mfa-layout.css'

// step values: 'email' | 'otp' | 'app'

const OTP_TTL_SECONDS = 600

const SESSION_COOKIE = 'clausule_session='

const SSO_ERROR_LABELS = {
  not_configured:      'That sign-in method is not yet enabled.',
  state_mismatch:      'Sign-in session expired — please try again.',
  invalid_state:       'Sign-in session invalid — please try again.',
  missing_params:      'Sign-in was incomplete — please try again.',
  token_exchange_failed: 'Could not connect to the sign-in provider.',
  no_email:            'Your account did not share an email address.',
  account_error:       'Account error — please try again or use email.',
  sso_denied:          'Sign-in was cancelled.',
}

export default function SignIn() {
  const router = useRouter()

  // ── Shared state ──────────────────────────────────────────────────
  const [step, setStep]           = useState('email')
  const [email, setEmail]         = useState('')
  const [touched, setTouched]     = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [sending, setSending]     = useState(false)
  const [emailStatus, setEmailStatus] = useState('idle')
  const lastCheckedRef            = useRef('')
  const [ssoError, setSsoError]   = useState(null)

  const [expirySeconds, , resetExpirySeconds] = useCountdown(OTP_TTL_SECONDS, step === 'otp')
  const [resendTimer, , resetResendTimer] = useCountdown(30, step === 'otp')
  const [verifyError, setVerifyError]     = useState(null)

  const codeRefs    = useRef([])
  const scheduleTimeout = useTrackedTimeout()

  const code = useSixDigitCode({ inputRefs: codeRefs, scheduleTimeout })

  // Redirect already-authenticated users.
  useEffect(() => {
    if (!document.cookie.split('; ').some((cookie) => cookie.startsWith(SESSION_COOKIE))) return
    apiFetch('/api/auth/me')
      .then(async (res) => {
        if (res.ok) {
          const { user } = await res.json()
          router.replace(homePathForRole(user.role))
        }
      })
      .catch(() => {})
  }, [router])

  // Pick up SSO error from redirect query param and clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err    = params.get('sso_error')
    if (!err) return
    setSsoError(SSO_ERROR_LABELS[err] ?? 'Sign-in failed — please try again.')
    params.delete('sso_error')
    const clean = [window.location.pathname, params.toString()].filter(Boolean).join('?')
    window.history.replaceState(null, '', clean)
  }, [])

  // ── Verify handlers (defined before auto-verify effect) ───────────
  const verifySignInCode = useCallback(async (endpoint, digits) => {
    const otp = digits.join('')
    if (otp.length !== 6) return
    code.setState('checking')
    setVerifyError(null)
    try {
      const res = await fetch(endpoint, jsonRequest({ email: storage.getEmail(), code: otp }, { method: 'POST' }))
      if (res.ok) {
        code.setState('done')
        const { role } = await res.json()
        scheduleTimeout(() => router.replace(homePathForRole(role)), 400)
      } else {
        code.setError()
        setVerifyError('Incorrect code — try again')
      }
    } catch {
      code.setError()
      setVerifyError('Something went wrong — try again')
    }
  }, [code, router, scheduleTimeout])

  const verifyOtp = useCallback((digits) => verifySignInCode('/api/auth/verify-code', digits), [verifySignInCode])
  const verifyApp = useCallback((digits) => verifySignInCode('/api/auth/totp/verify', digits), [verifySignInCode])

  // Auto-verify when all 6 digits are filled.
  useEffect(() => {
    if (step !== 'otp' && step !== 'app') return
    if (code.state !== 'idle') return
    if (!code.digits.every(Boolean)) return
    if (step === 'otp') verifyOtp(code.digits)
    else verifyApp(code.digits)
  }, [code.digits, code.state, step, verifyOtp, verifyApp])

  // ── Email step logic ──────────────────────────────────────────────
  const result       = validateEmail(email)
  const showFeedback = touched || submitAttempted

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setSubmitAttempted(false)
    if (emailStatus !== 'idle') setEmailStatus('idle')
  }

  const doSubmit = async (rawEmail) => {
    const trimmed = rawEmail.trim()
    if (!trimmed) return

    const v = validateEmail(trimmed)
    if (!v.valid && !v.suggestion) return
    const resolved = v.suggestion ?? trimmed

    setSubmitAttempted(true)
    setTouched(true)

    let status = emailStatus
    if (status === 'idle' || status === 'checking' || resolved !== lastCheckedRef.current) {
      lastCheckedRef.current = resolved
      setEmailStatus('checking')
      try {
        const res  = await fetch('/api/auth/check-email', jsonRequest({ email: resolved }, { method: 'POST' }))
        if (!res.ok) throw new Error('Email check failed')
        const data = await res.json()
        if (!data.exists) {
          setEmailStatus('new')
          router.push(`/signup?email=${encodeURIComponent(resolved)}`)
          return
        }
        if (data.isDeleted || !data.isActive) {
          setEmailStatus('new')
          router.push(`/signup?email=${encodeURIComponent(resolved)}`)
          return
        }
        if (data.hasSso && data.ssoProvider) {
          storage.setEmail(resolved)
          window.location.href = `/api/auth/sso/${data.ssoProvider}`
          return
        }
        status = data.hasMfa ? 'mfa' : 'otp'
        setEmailStatus(status)
      } catch {
        setEmailStatus('idle')
        return
      }
    }

    storage.setEmail(resolved)

    if (status === 'mfa') {
      setStep('app')
      return
    }

    // No TOTP — send email OTP.
    setSending(true)
    try {
      await sendCodeEmail(resolved)
      resetExpirySeconds()
      resetResendTimer()
      code.setState('idle')
      setStep('otp')
    } catch {
      // stay on email step
    } finally {
      setSending(false)
    }
  }

  const handleBlur = () => setTouched(true)

  const handlePaste = (e) => {
    const pasted = e.clipboardData?.getData('text') ?? ''
    if (pasted.trim()) setTimeout(() => doSubmit(pasted), 0)
  }

  const acceptSuggestion = () => {
    setEmail(result.suggestion)
    setTouched(false)
    setSubmitAttempted(false)
    setEmailStatus('idle')
    lastCheckedRef.current = ''
  }

  const handleSubmit = (e) => { e.preventDefault(); doSubmit(email) }

  const handleResend = async () => {
    try {
      await sendCodeEmail(storage.getEmail() ?? email)
      resetExpirySeconds()
      resetResendTimer()
      code.reset()
      setVerifyError(null)
    } catch { /* ignore */ }
  }

  const isChecking   = emailStatus === 'checking' || sending
  const isNewAccount = emailStatus === 'new'

  const btnLabel = isChecking
    ? (sending ? 'Sending…' : 'Checking…')
    : isNewAccount
      ? 'Create account →'
      : 'Login'

  // ── Render ────────────────────────────────────────────────────────
  if (step === 'app') {
    const resolvedEmail = storage.getEmail() ?? email

    return (
      <MfaLoginAppStep
        email={resolvedEmail}
        otp={code.digits}
        otpRefs={codeRefs}
        otpState={code.state}
        onBack={() => { setStep('email'); code.setState('idle'); setVerifyError(null) }}
        onChange={code.handleChange}
        onKeyDown={code.handleKeyDown}
        onPaste={code.handlePaste}
        onVerify={() => verifyApp(code.digits)}
        onUseRecovery={null}
      />
    )
  }

  if (step === 'otp') {
    const resolvedEmail = storage.getEmail() ?? email

    return (
      <MfaLoginEmailStep
        email={resolvedEmail}
        otp={code.digits}
        otpRefs={codeRefs}
        otpState={code.state}
        expirySeconds={expirySeconds}
        resendTimer={resendTimer}
        onBack={() => { setStep('email'); code.setState('idle'); setVerifyError(null) }}
        onChange={code.handleChange}
        onKeyDown={code.handleKeyDown}
        onPaste={code.handlePaste}
        onVerify={() => verifyOtp(code.digits)}
        onResend={handleResend}
      />
    )
  }

  return (
    <div className="si-wrap">
      <div className="si-card">
        <SignInBrandPanel />

        <div className="si-right">
          <SignInEmailForm
            email={email}
            result={result}
            showFeedback={showFeedback}
            isChecking={isChecking}
            isNewAccount={isNewAccount}
            btnLabel={btnLabel}
            ssoError={ssoError}
            onAcceptSuggestion={acceptSuggestion}
            onBlur={handleBlur}
            onChange={handleEmailChange}
            onPaste={handlePaste}
            onSubmit={handleSubmit}
          />
          <SsoButtons config={ssoConfigFromEnv} />
          {!isNewAccount && <SignUpPrompt />}
        </div>
      </div>
    </div>
  )
}
