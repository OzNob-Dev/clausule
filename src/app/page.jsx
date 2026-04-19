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
          <form className="si-form" onSubmit={handleSubmit} noValidate>
            <h2 className="si-heading">Sign in</h2>
            <p className="si-subheading">We'll send a verification code to your email.</p>

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

            {!isNewAccount && (
              <p className="si-footer">
                No account yet?{' '}
                <Link href="/signup">Sign up</Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
