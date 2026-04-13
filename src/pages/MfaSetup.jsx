import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../utils/storage'
import '../styles/mfa-setup.css'

// Demo OTP — shown as a hint since there's no real mail server
const DEMO_OTP = '847291'

export default function MfaSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1 — OTP
  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [otpState, setOtpState] = useState('idle') // idle | error | valid
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef([])

  // Step 2 — Passkey
  const [passkeySupported, setPasskeySupported] = useState(null)
  const [passkeyState, setPasskeyState]         = useState('idle') // idle | loading | success | error

  const email = storage.getEmail() || 'your email'

  // Detect platform authenticator support
  useEffect(() => {
    if (
      typeof PublicKeyCredential !== 'undefined' &&
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setPasskeySupported)
        .catch(() => setPasskeySupported(false))
    } else {
      setPasskeySupported(false)
    }
  }, [])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  // ── OTP handlers ─────────────────────────────────────────────────
  const verifyOtp = (digits) => {
    const code = digits.join('')
    if (code.length < 6) return
    if (code === DEMO_OTP) {
      setOtpState('valid')
      setTimeout(() => setStep(2), 500)
    } else {
      setOtpState('error')
      // Clear and refocus after shake
      setTimeout(() => {
        setOtp(['', '', '', '', '', ''])
        setOtpState('idle')
        inputRefs.current[0]?.focus()
      }, 700)
    }
  }

  const handleOtpChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = otp.map((d, idx) => (idx === i ? digit : d))
    setOtp(next)
    setOtpState('idle')
    if (digit && i < 5) {
      inputRefs.current[i + 1]?.focus()
    }
    if (next.every((d) => d)) verifyOtp(next)
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (otp[i]) {
        const next = otp.map((d, idx) => (idx === i ? '' : d))
        setOtp(next)
        setOtpState('idle')
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputRefs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < 5) {
      inputRefs.current[i + 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = ['', '', '', '', '', ''].map((_, i) => text[i] || '')
    setOtp(next)
    inputRefs.current[Math.min(text.length, 5)]?.focus()
    if (next.every((d) => d)) verifyOtp(next)
  }

  // ── Passkey handlers ──────────────────────────────────────────────
  const setupPasskey = async () => {
    setPasskeyState('loading')
    try {
      // In production: fetch a challenge from your server, then call
      // navigator.credentials.create({ publicKey: { challenge, ... } })
      // Here we simulate the platform prompt with a short delay.
      await new Promise((resolve, reject) => {
        // Abort if the user cancels (simulated 10% chance for realism)
        setTimeout(resolve, 1800)
      })
      setPasskeyState('success')
      storage.setMfaSetup()
      setTimeout(() => setStep(3), 600)
    } catch {
      setPasskeyState('error')
    }
  }

  const continueWithEmail = () => {
    storage.setMfaSetup()
    setStep(3)
  }

  // ── Enter app ─────────────────────────────────────────────────────
  const enterApp = () => {
    storage.setAuthed()
    storage.setRole('manager')
    navigate('/dashboard')
  }

  // ── Progress label for screen readers ────────────────────────────
  const stepLabels = ['Verify email', 'Secure your account', 'All set']

  return (
    <div className="mfa-wrap">
      <div className="mfa-card" role="main">
        {/* Progress bar */}
        <nav className="mfa-progress" aria-label="Setup progress">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={[
                'mfa-seg',
                step > n  ? 'mfa-seg--done'    : '',
                step === n ? 'mfa-seg--active'  : '',
              ].join(' ')}
              aria-label={`Step ${n}: ${stepLabels[n - 1]}${step > n ? ' (complete)' : step === n ? ' (current)' : ''}`}
            />
          ))}
        </nav>

        {/* ── Step 1: OTP ─────────────────────────────────────── */}
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
              We sent a 6-digit code to<br />
              <strong>{email}</strong>
            </p>

            <div className="mfa-demo-pill" aria-label="Demo code for testing">
              Demo code: <strong>{DEMO_OTP}</strong>
            </div>

            <div
              className={`mfa-otp-row${otpState === 'error' ? ' mfa-otp-row--error' : ''}${otpState === 'valid' ? ' mfa-otp-row--valid' : ''}`}
              onPaste={handleOtpPaste}
              role="group"
              aria-label="One-time code"
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="mfa-otp-box"
                  aria-label={`Digit ${i + 1} of 6`}
                  autoFocus={i === 0}
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  disabled={otpState === 'valid'}
                />
              ))}
            </div>

            {otpState === 'error' && (
              <p className="mfa-error" role="alert">Incorrect code — try again</p>
            )}

            <p className="mfa-resend">
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <button
                  className="mfa-resend-btn"
                  onClick={() => setResendTimer(30)}
                >
                  Resend code
                </button>
              )}
            </p>
          </div>
        )}

        {/* ── Step 2: Passkey ─────────────────────────────────── */}
        {step === 2 && (
          <div className="mfa-pane" key="passkey">
            <div className="mfa-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
                <path d="M15.9 10.5C18.2 11.5 20 13.6 20 16v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1c0-2.4 1.8-4.5 4.1-5.5" />
                <path d="M12 14v4M10 16h4" />
              </svg>
            </div>

            <h1 className="mfa-heading">Add a second factor</h1>

            {passkeySupported === null && (
              <p className="mfa-sub">Checking your device…</p>
            )}

            {passkeySupported === true && (
              <>
                <p className="mfa-sub">
                  Your device supports biometric login. Set it up for faster,
                  phishing-resistant access — no codes to type.
                </p>

                <button
                  className={`mfa-passkey-btn${passkeyState === 'success' ? ' mfa-passkey-btn--done' : ''}`}
                  onClick={setupPasskey}
                  disabled={passkeyState === 'loading' || passkeyState === 'success'}
                  aria-busy={passkeyState === 'loading'}
                >
                  {passkeyState === 'idle' && (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <ellipse cx="9" cy="16" rx="5" ry="5" />
                        <path d="M14 16h6M17 14v4" />
                        <path d="M9 11V4.5a2.5 2.5 0 0 1 5 0" />
                      </svg>
                      Set up Face ID / Touch ID / Passkey
                    </>
                  )}
                  {passkeyState === 'loading' && (
                    <>
                      <span className="mfa-spinner" aria-hidden="true" />
                      Waiting for device…
                    </>
                  )}
                  {passkeyState === 'success' && (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      Passkey registered
                    </>
                  )}
                </button>

                {passkeyState === 'error' && (
                  <p className="mfa-error" role="alert">
                    Setup failed — please try again or use email verification
                  </p>
                )}

                <button className="mfa-skip-btn" onClick={continueWithEmail}>
                  Skip, use email verification only
                </button>
              </>
            )}

            {passkeySupported === false && (
              <>
                <p className="mfa-sub">
                  Your device doesn't support biometrics or passkeys.
                  Email verification will be your second factor.
                </p>
                <div className="mfa-no-passkey-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8l9 6 9-6" />
                    <rect x="3" y="6" width="18" height="13" rx="2" />
                  </svg>
                  Email OTP active
                </div>
                <button className="mfa-passkey-btn" onClick={continueWithEmail}>
                  Continue
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Step 3: Success ──────────────────────────────────── */}
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
