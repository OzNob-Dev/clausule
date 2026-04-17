'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { storage } from '@/utils/storage'
import { validateEmail } from '@/utils/emailValidation'
import { sendCodeEmail } from '@/utils/sendCodeEmail'
import '@/styles/signin.css'

// emailStatus values:
//   'idle'       — not yet checked
//   'checking'   — API call in flight
//   'registered' — account exists → show "Send code"
//   'new'        — no account    → show "Create account"

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail]               = useState('')
  const [touched, setTouched]           = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [sending, setSending]           = useState(false)
  const [emailStatus, setEmailStatus]   = useState('idle')

  // Track the last email we ran a check on to avoid redundant requests.
  const lastCheckedRef = useRef('')

  useEffect(() => {
    if (storage.isAuthed() && storage.isMfaSetup()) {
      router.replace('/dashboard')
    }
  }, [router])

  const result       = validateEmail(email)
  const showFeedback = touched || submitAttempted

  // Reset status whenever the user edits the email field.
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setSubmitAttempted(false)
    if (emailStatus !== 'idle') setEmailStatus('idle')
  }

  // Check on blur if the email is valid and differs from the last check.
  const handleBlur = async () => {
    const trimmed = email.trim()
    if (!trimmed) return
    setTouched(true)

    const v = validateEmail(trimmed)
    const resolved = v.suggestion ?? (v.valid ? trimmed : null)
    if (!resolved || resolved === lastCheckedRef.current) return

    lastCheckedRef.current = resolved
    setEmailStatus('checking')

    try {
      const res  = await fetch('/api/auth/check-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: resolved }),
      })
      const data = await res.json()
      setEmailStatus(data.exists ? 'registered' : 'new')
    } catch {
      // Network error — fall back to 'idle' and let submit handle it.
      setEmailStatus('idle')
    }
  }

  const acceptSuggestion = () => {
    setEmail(result.suggestion)
    setTouched(false)
    setSubmitAttempted(false)
    setEmailStatus('idle')
    lastCheckedRef.current = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitAttempted(true)

    if (!result.valid) return

    const resolved = result.suggestion ?? email.trim()

    // If we haven't checked yet, do it now before deciding what to do.
    if (emailStatus === 'idle' || emailStatus === 'checking') {
      setEmailStatus('checking')
      try {
        const res  = await fetch('/api/auth/check-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: resolved }),
        })
        const data = await res.json()
        const status = data.exists ? 'registered' : 'new'
        setEmailStatus(status)
        if (status === 'new') {
          router.push(`/signup?email=${encodeURIComponent(resolved)}`)
          return
        }
      } catch {
        setEmailStatus('idle')
        return
      }
    }

    // Email not registered — redirect to signup.
    if (emailStatus === 'new') {
      router.push(`/signup?email=${encodeURIComponent(resolved)}`)
      return
    }

    // Email registered — send OTP.
    storage.setEmail(resolved)
    setSending(true)
    try {
      await sendCodeEmail(resolved)
      router.push('/mfa-setup')
    } catch (err) {
    } finally {
      setSending(false)
    }
  }

  // Derive button label and style from emailStatus.
  const isChecking   = emailStatus === 'checking' || sending
  const isNewAccount = emailStatus === 'new'

  const btnLabel = isChecking
    ? (sending ? 'Sending…' : 'Checking…')
    : isNewAccount
      ? 'Create account →'
      : 'Send code'

  return (
    <div className="si-wrap">
      <div className="si-card">
        {/* Left panel */}
        <div className="si-left">
          <div className="si-logo">
            CLAU<span className="si-logo-accent">SULE</span>
          </div>
          <div>
            <h1 className="si-tagline">
              Capture Every Win.<br />Retain Every Insight.
            </h1>
            <p className="si-tagline-sub">
              Transforming daily interactions into a permanent record of professional impact.
            </p>
          </div>
        </div>

        {/* Right panel */}
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
                autoFocus
                autoComplete="email"
                required
                aria-invalid={showFeedback && !result.valid && !result.suggestion}
                aria-describedby="si-email-hint"
                className={[
                  'si-input',
                  showFeedback && result.error   ? 'si-input--error' : '',
                  showFeedback && result.suggestion ? 'si-input--warn' : '',
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
                    No account found - we'll get you set up.
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

            {/* Hide the static sign-up link once we know it's a new email */}
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
