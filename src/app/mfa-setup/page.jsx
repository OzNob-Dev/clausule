'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { storage } from '@/utils/storage'
import CodeEmail from '@/components/ui/CodeEmail'
import '@/styles/mfa-setup.css'
import '@/styles/code-email.css'

const DEMO_TOTP        = '123456'
const TOTP_SECRET_RAW  = 'JBSWY3DPEHPK3PXP'
const TOTP_SECRET_DISP = 'JBSW Y3DP EHPK 3PXP'
const TOTP_URI         = `otpauth://totp/Clausule:demo%40clausule.com?secret=${TOTP_SECRET_RAW}&issuer=Clausule&algorithm=SHA1&digits=6&period=30`

// ── 6-box digit input ────────────────────────────────────────────
function DigitRow({ digits, inputState, inputRefs, onChange, onKeyDown, onPaste }) {
  return (
    <div
      className={[
        'mfa-otp-row',
        inputState === 'error' ? 'mfa-otp-row--error' : '',
        inputState === 'done'  ? 'mfa-otp-row--valid' : '',
      ].join(' ')}
      onPaste={onPaste}
      role="group"
      aria-label="6-digit code"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="mfa-otp-box"
          aria-label={`Digit ${i + 1} of 6`}
          autoFocus={i === 0}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          disabled={inputState === 'done'}
        />
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────
export default function MfaSetup() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1 — email OTP
  const [otp, setOtp]             = useState(['','','','','',''])
  const [otpState, setOtpState]   = useState('idle') // idle | error | done
  const [resendTimer, setResendTimer] = useState(30)
  const otpRefs = useRef([])

  // Step 2 — authenticator TOTP
  const [totp, setTotp]           = useState(['','','','','',''])
  const [totpState, setTotpState] = useState('idle') // idle | error | done
  const [copied, setCopied]       = useState(false)
  const totpRefs = useRef([])

  // Step 2 — biometrics
  const [passkeyAvailable, setPasskeyAvailable] = useState(null)
  const [passkeyState, setPasskeyState]         = useState('idle') // idle | loading | done | error

  const email    = storage.getEmail() || 'your email'
  const totpDone = totpState === 'done'

  // Detect platform authenticator once on mount
  useEffect(() => {
    if (
      typeof PublicKeyCredential !== 'undefined' &&
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setPasskeyAvailable)
        .catch(() => setPasskeyAvailable(false))
    } else {
      setPasskeyAvailable(false)
    }
  }, [])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((n) => n - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  // ── TOTP demo verify (local only) ────────────────────────────
  const verify = useCallback((digits, target, setDig, setSt, onMatch) => {
    const code = digits.join('')
    if (code === target) {
      setSt('done')
      onMatch()
    } else {
      setSt('error')
      setTimeout(() => {
        setDig(['','','','','',''])
        setSt('idle')
      }, 700)
    }
  }, [])

  // ── Email OTP: server-side verification ───────────────────────
  const verifyOtp = useCallback(async (digits) => {
    const code = digits.join('')
    try {
      const res  = await fetch('/api/auth/verify-code', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, code }),
      })
      if (res.ok) {
        setOtpState('done')
        setTimeout(() => setStep(2), 500)
      } else {
        setOtpState('error')
        setTimeout(() => { setOtp(['','','','','','']); setOtpState('idle') }, 700)
      }
    } catch {
      setOtpState('error')
      setTimeout(() => { setOtp(['','','','','','']); setOtpState('idle') }, 700)
    }
  }, [email])

  // ── OTP handlers ─────────────────────────────────────────────
  const handleOtpChange = useCallback((i, val) => {
    const d = val.replace(/\D/g, '').slice(-1)
    setOtp((prev) => {
      const next = prev.map((v, idx) => idx === i ? d : v)
      if (d && i < 5) setTimeout(() => otpRefs.current[i + 1]?.focus(), 0)
      if (next.every(Boolean)) verifyOtp(next)
      return next
    })
  }, [verifyOtp])

  const handleOtpKey = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      setOtp((prev) => {
        if (prev[i]) return prev.map((v, idx) => idx === i ? '' : v)
        if (i > 0) setTimeout(() => otpRefs.current[i - 1]?.focus(), 0)
        return prev
      })
    } else if (e.key === 'ArrowLeft' && i > 0)  otpRefs.current[i - 1]?.focus()
      else if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus()
  }, [])

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = Array.from({ length: 6 }, (_, i) => text[i] ?? '')
    setOtp(next)
    otpRefs.current[Math.min(text.length, 5)]?.focus()
    if (next.every(Boolean)) verifyOtp(next)
  }, [verifyOtp])

  // ── TOTP handlers ─────────────────────────────────────────────
  const handleTotpChange = useCallback((i, val) => {
    const d = val.replace(/\D/g, '').slice(-1)
    setTotp((prev) => {
      const next = prev.map((v, idx) => idx === i ? d : v)
      if (d && i < 5) setTimeout(() => totpRefs.current[i + 1]?.focus(), 0)
      if (next.every(Boolean)) verify(next, DEMO_TOTP, setTotp, setTotpState, () => {})
      return next
    })
  }, [verify])

  const handleTotpKey = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      setTotp((prev) => {
        if (prev[i]) return prev.map((v, idx) => idx === i ? '' : v)
        if (i > 0) setTimeout(() => totpRefs.current[i - 1]?.focus(), 0)
        return prev
      })
    } else if (e.key === 'ArrowLeft' && i > 0)  totpRefs.current[i - 1]?.focus()
      else if (e.key === 'ArrowRight' && i < 5) totpRefs.current[i + 1]?.focus()
  }, [])

  const handleTotpPaste = useCallback((e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = Array.from({ length: 6 }, (_, i) => text[i] ?? '')
    setTotp(next)
    totpRefs.current[Math.min(text.length, 5)]?.focus()
    if (next.every(Boolean)) verify(next, DEMO_TOTP, setTotp, setTotpState, () => {})
  }, [verify])

  // ── Passkey ───────────────────────────────────────────────────
  const setupPasskey = async () => {
    setPasskeyState('loading')
    try {
      await new Promise((r) => setTimeout(r, 1800))
      setPasskeyState('done')
    } catch {
      setPasskeyState('error')
    }
  }

  const copySecret = () => {
    navigator.clipboard?.writeText(TOTP_SECRET_RAW).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const finishSetup = () => {
    setStep(3)
  }

  const enterApp = () => {
    router.push('/brag')
  }

  const stepLabels = ['Verify email', 'Secure account', 'All set']

  return (
    <div className="mfa-wrap">
      <div className="mfa-card" role="main">

        {/* Progress */}
        <nav className="mfa-progress" aria-label="Setup progress">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={[
                'mfa-seg',
                step > n  ? 'mfa-seg--done'   : '',
                step === n ? 'mfa-seg--active' : '',
              ].join(' ')}
              aria-label={`Step ${n}: ${stepLabels[n - 1]}${step > n ? ' (complete)' : step === n ? ' (current)' : ''}`}
            />
          ))}
        </nav>

        {/* ── Step 1: Email OTP ─────────────────────────────── */}
        {step === 1 && (
          <div className="mfa-pane" key="otp">
            <div className="mfa-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <path d="M3 10l9 6 9-6" />
              </svg>
            </div>
            <h1 className="mfa-heading">Check your email</h1>
            <p className="mfa-sub">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <CodeEmail to={email} />
            <DigitRow
              digits={otp} inputState={otpState} inputRefs={otpRefs}
              onChange={handleOtpChange} onKeyDown={handleOtpKey} onPaste={handleOtpPaste}
            />
            {otpState === 'error' && <p className="mfa-error" role="alert">Incorrect code — try again</p>}
            <p className="mfa-resend">
              {resendTimer > 0
                ? <span>Resend in {resendTimer}s</span>
                : <button className="mfa-resend-btn" onClick={() => setResendTimer(30)}>Resend code</button>}
            </p>
          </div>
        )}

        {/* ── Step 2: Authenticator + Biometrics ────────────── */}
        {step === 2 && (
          <div className="mfa-pane mfa-pane--factors" key="factors">
            <h1 className="mfa-heading">Secure your account</h1>
            <p className="mfa-sub">Set up an authenticator app, then optionally add biometrics.</p>

            {/* Card 1 — Authenticator */}
            <div className={`mfa-factor-card${totpDone ? ' mfa-factor-card--done' : ''}`}>
              <div className="mfa-factor-head">
                <div className={`mfa-factor-badge${totpDone ? ' mfa-factor-badge--done' : ''}`}>
                  {totpDone
                    ? <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 6l3 3 5-5"/></svg>
                    : '1'}
                </div>
                <div>
                  <div className="mfa-factor-title">Authenticator app</div>
                  <div className="mfa-factor-sub">
                    {totpDone ? 'Verified and active' : 'Google Authenticator, Authy, 1Password, etc.'}
                  </div>
                </div>
              </div>

              {!totpDone && (
                <div className="mfa-factor-body">
                  <p className="mfa-factor-instruction">
                    Scan with your authenticator app, or copy the key below for manual entry.
                  </p>
                  <div className="mfa-qr-wrap" aria-label="QR code for authenticator app">
                    <QRCodeSVG
                      value={TOTP_URI}
                      size={148}
                      bgColor="#FAF7F3"
                      fgColor="#2A221A"
                      level="M"
                    />
                  </div>
                  <div className="mfa-secret-row">
                    <code className="mfa-secret">{TOTP_SECRET_DISP}</code>
                    <button className="mfa-copy-btn" onClick={copySecret} aria-label="Copy secret key">
                      {copied
                        ? <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7l3.5 3.5L12 3"/></svg>
                        : <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="8" height="8" rx="1"/><path d="M2 10V3a1 1 0 0 1 1-1h7"/></svg>}
                    </button>
                  </div>
                  <div className="mfa-demo-pill mfa-demo-pill--sm">Demo code: <strong>{DEMO_TOTP}</strong></div>
                  <DigitRow
                    digits={totp} inputState={totpState} inputRefs={totpRefs}
                    onChange={handleTotpChange} onKeyDown={handleTotpKey} onPaste={handleTotpPaste}
                  />
                  {totpState === 'error' && <p className="mfa-error" role="alert">Incorrect code — try again</p>}
                </div>
              )}
            </div>

            {/* Card 2 — Biometrics (locked until TOTP done) */}
            <div
              className={[
                'mfa-factor-card',
                !totpDone         ? 'mfa-factor-card--locked' : '',
                passkeyState === 'done' ? 'mfa-factor-card--done' : '',
              ].join(' ')}
              aria-disabled={!totpDone}
            >
              <div className="mfa-factor-head">
                <div className={[
                  'mfa-factor-badge',
                  !totpDone               ? 'mfa-factor-badge--locked' : '',
                  passkeyState === 'done' ? 'mfa-factor-badge--done'   : '',
                ].join(' ')}>
                  {passkeyState === 'done'
                    ? <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 6l3 3 5-5"/></svg>
                    : !totpDone
                      ? <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2.5" y="5" width="7" height="5.5" rx="1"/><path d="M4 5V3.5a2 2 0 0 1 4 0V5"/></svg>
                      : '2'}
                </div>
                <div>
                  <div className="mfa-factor-title">Biometrics / Passkey</div>
                  <div className="mfa-factor-sub">
                    {!totpDone
                      ? 'Complete step 1 to unlock'
                      : passkeyState === 'done'
                        ? 'Registered on this device'
                        : passkeyAvailable === false
                          ? 'Not supported on this device'
                          : 'Face ID, Touch ID, Windows Hello'}
                  </div>
                </div>
              </div>

              {totpDone && passkeyState !== 'done' && (
                <div className="mfa-factor-body">
                  {passkeyAvailable === null && (
                    <p className="mfa-factor-instruction">Checking device…</p>
                  )}
                  {passkeyAvailable === true && (
                    <>
                      <p className="mfa-factor-instruction">
                        Add biometric login for faster, phishing-resistant sign-in on this device.
                      </p>
                      <button
                        className="mfa-passkey-btn"
                        onClick={setupPasskey}
                        disabled={passkeyState === 'loading'}
                        aria-busy={passkeyState === 'loading'}
                      >
                        {passkeyState === 'loading'
                          ? <><span className="mfa-spinner" aria-hidden="true" />Waiting for device…</>
                          : <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                <ellipse cx="9" cy="16" rx="5" ry="5"/>
                                <path d="M14 16h6M17 14v4"/>
                                <path d="M9 11V4.5a2.5 2.5 0 0 1 5 0"/>
                              </svg>
                              Set up Face ID / Touch ID / Passkey
                            </>}
                      </button>
                      {passkeyState === 'error' && (
                        <p className="mfa-error" role="alert">Setup failed — you can skip and add it later</p>
                      )}
                    </>
                  )}
                  {passkeyAvailable === false && (
                    <p className="mfa-factor-instruction">
                      Biometrics aren't available here. You can add a passkey later from Settings.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Continue (visible once TOTP verified) */}
            {totpDone && (
              <div className="mfa-factor-actions">
                <button className="mfa-enter-btn" onClick={finishSetup}>
                  Continue
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
                {passkeyAvailable === true && passkeyState === 'idle' && (
                  <button className="mfa-skip-btn" onClick={finishSetup}>Skip biometrics for now</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Success ───────────────────────────────── */}
        {step === 3 && (
          <div className="mfa-pane mfa-pane--center" key="success">
            <div className="mfa-success-ring" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mfa-heading">You're protected</h1>
            <p className="mfa-sub">
              Your account is secured with multi-factor authentication.
              You'll verify your identity each time you sign in.
            </p>
            <button className="mfa-enter-btn" onClick={enterApp}>
              Enter Clausule
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
