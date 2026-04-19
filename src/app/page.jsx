'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { storage } from '@/utils/storage'
import { validateEmail } from '@/utils/emailValidation'
import { sendCodeEmail } from '@/utils/sendCodeEmail'
import { apiFetch } from '@/utils/api'
import { useSixDigitCode } from '@/hooks/useSixDigitCode'
import MfaLoginEmailStep from '@/components/mfa/MfaLoginEmailStep'
import MfaLoginAppStep from '@/components/mfa/MfaLoginAppStep'
import '@/styles/signin.css'
import '@/styles/mfa-layout.css'

// step values: 'email' | 'otp' | 'app'

const OTP_TTL_SECONDS = 600

// Inlined at build time — set NEXT_PUBLIC_SSO_*_ENABLED=true once credentials are configured
const SSO = {
  google:    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED    === 'true',
  microsoft: process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED === 'true',
  apple:     process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED     === 'true',
}
const ANY_SSO = SSO.google || SSO.microsoft || SSO.apple

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

  const [expirySeconds, setExpirySeconds] = useState(OTP_TTL_SECONDS)
  const [resendTimer, setResendTimer]     = useState(30)
  const [verifyError, setVerifyError]     = useState(null)

  const codeRefs    = useRef([])
  const timeoutRefs = useRef([])

  const scheduleTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutRefs.current.push(id)
    return id
  }, [])

  useEffect(() => () => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }, [])

  const code = useSixDigitCode({ inputRefs: codeRefs, scheduleTimeout })

  // Redirect already-authenticated users.
  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(async (res) => {
        if (res.ok) {
          const { user } = await res.json()
          router.replace(user.role === 'employee' ? '/brag' : '/dashboard')
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

  // Expiry countdown (OTP step only).
  useEffect(() => {
    if (step !== 'otp' || expirySeconds <= 0) return
    const id = setTimeout(() => setExpirySeconds((n) => n - 1), 1000)
    return () => clearTimeout(id)
  }, [step, expirySeconds])

  // Resend cooldown (OTP step only).
  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((n) => n - 1), 1000)
    return () => clearTimeout(id)
  }, [step, resendTimer])

  // ── Verify handlers (defined before auto-verify effect) ───────────
  const verifyOtp = useCallback(async (digits) => {
    const otp = digits.join('')
    if (otp.length !== 6) return
    code.setState('checking')
    setVerifyError(null)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: storage.getEmail(), code: otp }),
      })
      if (res.ok) {
        code.setState('done')
        const { role } = await res.json()
        scheduleTimeout(() => router.replace(role === 'employee' ? '/brag' : '/dashboard'), 400)
      } else {
        code.setError()
        setVerifyError('Incorrect code — try again')
      }
    } catch {
      code.setError()
      setVerifyError('Something went wrong — try again')
    }
  }, [code, router, scheduleTimeout])

  const verifyApp = useCallback(async (digits) => {
    const otp = digits.join('')
    if (otp.length !== 6) return
    code.setState('checking')
    setVerifyError(null)
    try {
      const res = await fetch('/api/auth/totp/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: storage.getEmail(), code: otp }),
      })
      if (res.ok) {
        code.setState('done')
        const { role } = await res.json()
        scheduleTimeout(() => router.replace(role === 'employee' ? '/brag' : '/dashboard'), 400)
      } else {
        code.setError()
        setVerifyError('Incorrect code — try again')
      }
    } catch {
      code.setError()
      setVerifyError('Something went wrong — try again')
    }
  }, [code, router, scheduleTimeout])

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
        const res  = await fetch('/api/auth/check-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: resolved }),
        })
        const data = await res.json()
        if (!data.exists) {
          setEmailStatus('new')
          router.push(`/signup?email=${encodeURIComponent(resolved)}`)
          return
        }
        status = data.hasMfa ? 'mfa' : 'registered'
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
      setExpirySeconds(OTP_TTL_SECONDS)
      setResendTimer(30)
      code.setState('idle')
      setStep('otp')
    } catch {
      // stay on email step
    } finally {
      setSending(false)
    }
  }

  const handleBlur = () => doSubmit(email)

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
      setExpirySeconds(OTP_TTL_SECONDS)
      setResendTimer(30)
      code.setState('idle')
      setVerifyError(null)
    } catch { /* ignore */ }
  }

  const isChecking   = emailStatus === 'checking' || sending
  const isNewAccount = emailStatus === 'new'

  const btnLabel = isChecking
    ? (sending ? 'Sending…' : 'Checking…')
    : isNewAccount
      ? 'Create account →'
      : 'Send code'

  // ── Render ────────────────────────────────────────────────────────
  if (step === 'otp' || step === 'app') {
    const resolvedEmail = storage.getEmail() ?? email

    return (
      <div className="mfa-wrap">
        <div className="mfa-card" role="main">
          <button
            className="mfa-back-btn"
            onClick={() => { setStep('email'); code.setState('idle'); setVerifyError(null) }}
            aria-label="Back to sign in"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="10 4 6 8 10 12" />
            </svg>
            Back
          </button>

          {step === 'otp' ? (
            <MfaLoginEmailStep
              email={resolvedEmail}
              otp={code.digits}
              otpRefs={codeRefs}
              otpState={code.state}
              expirySeconds={expirySeconds}
              resendTimer={resendTimer}
              onChange={code.handleChange}
              onKeyDown={code.handleKeyDown}
              onPaste={code.handlePaste}
              onVerify={() => verifyOtp(code.digits)}
              onResend={handleResend}
            />
          ) : (
            <MfaLoginAppStep
              email={resolvedEmail}
              otp={code.digits}
              otpRefs={codeRefs}
              otpState={code.state}
              onChange={code.handleChange}
              onKeyDown={code.handleKeyDown}
              onPaste={code.handlePaste}
              onVerify={() => verifyApp(code.digits)}
              onUseRecovery={null}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="si-wrap">
      <div className="si-card">
        {/* Left dark brand panel */}
        <div className="si-left">
          <div className="si-logo">
            <div className="si-logo-bug">
              <svg viewBox="0 0 18 18" fill="none" stroke="#FBF7F2" strokeWidth="2.2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
                <path d="M3 5h12M3 9h8M3 13h5" />
              </svg>
            </div>
            <span className="si-brand-name">clausule</span>
          </div>
          <div className="si-left-body">
            <h1 className="si-tagline">Thoughtful records.<br />Better conversations.</h1>
            <p className="si-tagline-sub">The file note tool built for managers who care about their people — and a brag doc for the people themselves.</p>
          </div>
          <div className="si-left-footer">Built for teams who care</div>
        </div>

        {/* Right light panel */}
        <div className="si-right">
          <h2 className="si-heading">Welcome back</h2>
          <p className="si-subheading">We'll send a verification code to your email.</p>

          {ssoError && (
            <p className="si-field-hint si-field-hint--error" role="alert" style={{ marginBottom: 14 }}>
              {ssoError}
            </p>
          )}

          <form className="si-form" onSubmit={handleSubmit} noValidate>
            <div className="si-field">
              <label className="si-label" htmlFor="si-email">Email</label>
              <input
                id="si-email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                onPaste={handlePaste}
                autoFocus
                autoComplete="email"
                required
                aria-invalid={showFeedback && !result.valid && !result.suggestion}
                aria-describedby="si-email-hint"
                className={[
                  'si-input',
                  showFeedback && result.error      ? 'si-input--error' : '',
                  showFeedback && result.suggestion ? 'si-input--warn'  : '',
                ].filter(Boolean).join(' ')}
              />

              <div id="si-email-hint" aria-live="polite">
                {showFeedback && result.error && (
                  <p className="si-field-hint si-field-hint--error" role="alert">
                    {result.error}
                  </p>
                )}
                {showFeedback && result.suggestion && (
                  <p className="si-field-hint si-field-hint--suggest" role="alert">
                    Did you mean{' '}
                    <button type="button" className="si-suggest-btn" onClick={acceptSuggestion}>
                      {result.suggestion}
                    </button>
                    ?
                  </p>
                )}
                {!result.error && !result.suggestion && isNewAccount && (
                  <p className="si-field-hint si-field-hint--info">
                    No account found — we'll get you set up.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className={`si-btn-primary${isNewAccount ? ' si-btn-primary--signup' : ''}`}
              disabled={!email.trim() || isChecking}
              aria-busy={isChecking}
            >
              {btnLabel}
            </button>
          </form>

          {ANY_SSO && (
            <>
              <div className="si-divider">
                <div className="si-divider-line" />
                <span className="si-divider-text">or continue with</span>
                <div className="si-divider-line" />
              </div>

              {SSO.google && (
                <button type="button" className="si-btn-sso" onClick={() => { window.location.href = '/api/auth/sso/google' }}>
                  <span className="si-sso-logo">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.77h5.47a4.67 4.67 0 0 1-2.03 3.07v2.55h3.28c1.92-1.77 3.03-4.38 3.03-7.39z" fill="#4285F4"/>
                      <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.23-2.51c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H1.07v2.6A9.99 9.99 0 0 0 10 20z" fill="#34A853"/>
                      <path d="M4.4 11.89A6.01 6.01 0 0 1 4.08 10c0-.65.11-1.29.32-1.89V5.51H1.07A10 10 0 0 0 0 10c0 1.61.38 3.14 1.07 4.49l3.33-2.6z" fill="#FBBC05"/>
                      <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.86-2.87C14.95.99 12.7 0 10 0A9.99 9.99 0 0 0 1.07 5.51l3.33 2.6C5.19 5.74 7.4 3.98 10 3.98z" fill="#EA4335"/>
                    </svg>
                  </span>
                  <span className="si-sso-label">Continue with Google</span>
                  <span className="si-sso-arrow">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>
                  </span>
                </button>
              )}

              {SSO.microsoft && (
                <button type="button" className="si-btn-sso" onClick={() => { window.location.href = '/api/auth/sso/microsoft' }}>
                  <span className="si-sso-logo">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <rect x="1" y="1" width="8.5" height="8.5" fill="#F25022"/>
                      <rect x="10.5" y="1" width="8.5" height="8.5" fill="#7FBA00"/>
                      <rect x="1" y="10.5" width="8.5" height="8.5" fill="#00A4EF"/>
                      <rect x="10.5" y="10.5" width="8.5" height="8.5" fill="#FFB900"/>
                    </svg>
                  </span>
                  <span className="si-sso-label">Continue with Microsoft</span>
                  <span className="si-sso-arrow">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>
                  </span>
                </button>
              )}

              {SSO.apple && (
                <button type="button" className="si-btn-sso" onClick={() => { window.location.href = '/api/auth/sso/apple' }}>
                  <span className="si-sso-logo">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M13.4 1c.1 1-.3 2-1 2.8-.6.7-1.6 1.3-2.6 1.2-.1-1 .4-2 1-2.7C11.5 1.6 12.5 1.1 13.4 1zm3.4 11.4c.5 1 .7 1.5.7 1.5-.4.1-2 .8-2 2.8 0 2.2 1.9 3 1.9 3s-1.3 3.3-3.1 3.3c-.9 0-1.5-.6-2.4-.6-.9 0-1.7.6-2.4.6-1.7 0-3.8-3.1-3.8-7.1 0-3.8 2.3-5.8 4.5-5.8.9 0 1.7.6 2.3.6.6 0 1.5-.7 2.6-.7 1.1 0 2.4.6 3.1 1.9l.1-.1c-1-.6-1.7-1.7-1.7-2.9 0-1.5.9-2.7 2.2-3.3z" fill="#1A1510"/>
                    </svg>
                  </span>
                  <span className="si-sso-label">Continue with Apple</span>
                  <span className="si-sso-arrow">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>
                  </span>
                </button>
              )}
            </>
          )}

            {!isNewAccount && (
              <>
                <div className="si-divider">
                  <div className="si-divider-line" />
                  <span className="si-divider-text">No account yet?</span>
                  <div className="si-divider-line" />
                </div>
                <p className="si-footer">
                  <Link href="/signup">Sign up</Link>
                </p>
              </>
            )}
        </div>
      </div>
    </div>
  )
}
