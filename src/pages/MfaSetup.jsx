import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { storage } from '../utils/storage'
import '../styles/mfa-setup.css'

const DEMO_OTP    = '847291'
const DEMO_TOTP   = '123456'
const TOTP_SECRET = 'JBSWY3DPEHPK3PXP'
const TOTP_SECRET_DISPLAY = 'JBSW Y3DP EHPK 3PXP'
// Real otpauth URI — scannable by Google Authenticator, Authy, 1Password, etc.
const TOTP_URI = `otpauth://totp/Clausule:demo%40clausule.com?secret=${TOTP_SECRET}&issuer=Clausule&algorithm=SHA1&digits=6&period=30`

// ── Reusable 6-box digit row ─────────────────────────────────────
function DigitRow({ digits, state, refs, onChange, onKeyDown, onPaste, autoFocusFirst, disabled }) {
  return (
    <div
      className={`mfa-otp-row${state === 'error' ? ' mfa-otp-row--error' : ''}${state === 'done' ? ' mfa-otp-row--valid' : ''}`}
      onPaste={onPaste}
      role="group"
      aria-label="6-digit code"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="mfa-otp-box"
          aria-label={`Digit ${i + 1} of 6`}
          autoFocus={autoFocusFirst && i === 0}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          disabled={disabled || state === 'done'}
        />
      ))}
    </div>
  )
}

export default function MfaSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // ── Step 1 — email OTP ────────────────────────────────────────
  const [otp, setOtp]               = useState(['','','','','',''])
  const [otpState, setOtpState]     = useState('idle')
  const [resendTimer, setResendTimer] = useState(30)
  const otpRefs = useRef([])

  // ── Step 2 — authenticator ────────────────────────────────────
  const [totpDigits, setTotpDigits] = useState(['','','','','',''])
  const [totpState, setTotpState]   = useState('idle') // idle | error | done
  const [secretCopied, setSecretCopied] = useState(false)
  const totpRefs = useRef([])

  // ── Step 2 — biometrics (unlocks after TOTP done) ─────────────
  const [passkeySupported, setPasskeySupported] = useState(null)
  const [passkeyState, setPasskeyState]         = useState('idle') // idle | loading | done | error

  const email = storage.getEmail() || 'your email'
  const totpDone = totpState === 'done'

  // Detect platform authenticator
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

  // ── Shared digit-box logic ────────────────────────────────────
  const makeHandlers = (digits, setDigits, setState, targetCode, refs, onSuccess) => ({
    verify(d) {
      const code = d.join('')
      if (code.length < 6) return
      if (code === targetCode) {
        setState('done')
        onSuccess()
      } else {
        setState('error')
        setTimeout(() => {
          setDigits(['','','','','',''])
          setState('idle')
          refs.current[0]?.focus()
        }, 700)
      }
    },
    change(i, val) {
      const digit = val.replace(/\D/g, '').slice(-1)
      const next = digits.map((d, idx) => (idx === i ? digit : d))
      setDigits(next)
      setState('idle')
      if (digit && i < 5) refs.current[i + 1]?.focus()
      if (next.every((d) => d)) {
        const code = next.join('')
        if (code === targetCode) { setState('done'); onSuccess() }
        else {
          setState('error')
          setTimeout(() => { setDigits(['','','','','','']); setState('idle'); refs.current[0]?.focus() }, 700)
        }
      }
    },
    keyDown(i, e) {
      if (e.key === 'Backspace') {
        if (digits[i]) { const n = digits.map((d,idx)=>idx===i?'':d); setDigits(n); setState('idle') }
        else if (i > 0) refs.current[i - 1]?.focus()
      } else if (e.key === 'ArrowLeft'  && i > 0) refs.current[i - 1]?.focus()
        else if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
    },
    paste(e) {
      e.preventDefault()
      const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      if (!text) return
      const next = Array(6).fill('').map((_, i) => text[i] || '')
      setDigits(next)
      refs.current[Math.min(text.length, 5)]?.focus()
      if (next.every((d) => d)) {
        const code = next.join('')
        if (code === targetCode) { setState('done'); onSuccess() }
        else { setState('error'); setTimeout(() => { setDigits(['','','','','','']); setState('idle'); refs.current[0]?.focus() }, 700) }
      }
    },
  })

  const otpHandlers  = makeHandlers(otp,  setOtp,  setOtpState,  DEMO_OTP,  otpRefs,  () => setTimeout(() => setStep(2), 500))
  const totpHandlers = makeHandlers(totpDigits, setTotpDigits, setTotpState, DEMO_TOTP, totpRefs, () => {})

  // ── Passkey setup ─────────────────────────────────────────────
  const setupPasskey = async () => {
    setPasskeyState('loading')
    try {
      // Production: fetch challenge → navigator.credentials.create({ publicKey: … })
      await new Promise((r) => setTimeout(r, 1800))
      setPasskeyState('done')
    } catch {
      setPasskeyState('error')
    }
  }

  // ── Copy secret ───────────────────────────────────────────────
  const copySecret = () => {
    navigator.clipboard?.writeText(TOTP_SECRET.replace(/\s/g, '')).catch(() => {})
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  // ── Continue to success ───────────────────────────────────────
  const finishSetup = () => {
    storage.setMfaSetup()
    setStep(3)
  }

  const enterApp = () => {
    storage.setAuthed()
    storage.setRole('manager')
    navigate('/dashboard')
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
              className={['mfa-seg', step > n ? 'mfa-seg--done' : '', step === n ? 'mfa-seg--active' : ''].join(' ')}
              aria-label={`Step ${n}: ${stepLabels[n - 1]}${step > n ? ' (complete)' : step === n ? ' (current)' : ''}`}
            />
          ))}
        </nav>

        {/* ── Step 1: Email OTP ──────────────────────────────── */}
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
              We sent a 6-digit code to<br /><strong>{email}</strong>
            </p>
            <div className="mfa-demo-pill" aria-label="Demo code for testing">
              Demo code: <strong>{DEMO_OTP}</strong>
            </div>
            <DigitRow
              digits={otp} state={otpState} refs={otpRefs}
              onChange={otpHandlers.change} onKeyDown={otpHandlers.keyDown}
              onPaste={otpHandlers.paste} autoFocusFirst
            />
            {otpState === 'error' && <p className="mfa-error" role="alert">Incorrect code — try again</p>}
            <p className="mfa-resend">
              {resendTimer > 0
                ? <span>Resend in {resendTimer}s</span>
                : <button className="mfa-resend-btn" onClick={() => setResendTimer(30)}>Resend code</button>}
            </p>
          </div>
        )}

        {/* ── Step 2: MFA + Biometrics ───────────────────────── */}
        {step === 2 && (
          <div className="mfa-pane mfa-pane--factors" key="factors">
            <h1 className="mfa-heading">Secure your account</h1>
            <p className="mfa-sub">Set up an authenticator app, then optionally add biometrics.</p>

            {/* ── Factor card 1: Authenticator ── */}
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
                    Scan with your authenticator app, or enter the key manually.
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
                    <code className="mfa-secret">{TOTP_SECRET_DISPLAY}</code>
                    <button className="mfa-copy-btn" onClick={copySecret} aria-label="Copy secret key">
                      {secretCopied
                        ? <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7l3.5 3.5L12 3"/></svg>
                        : <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="8" height="8" rx="1"/><path d="M2 10V3a1 1 0 0 1 1-1h7"/></svg>}
                    </button>
                  </div>
                  <div className="mfa-demo-pill mfa-demo-pill--sm">
                    Demo code: <strong>{DEMO_TOTP}</strong>
                  </div>
                  <DigitRow
                    digits={totpDigits} state={totpState} refs={totpRefs}
                    onChange={totpHandlers.change} onKeyDown={totpHandlers.keyDown}
                    onPaste={totpHandlers.paste} autoFocusFirst
                  />
                  {totpState === 'error' && <p className="mfa-error" role="alert">Incorrect code — try again</p>}
                </div>
              )}
            </div>

            {/* ── Factor card 2: Biometrics (locked until TOTP done) ── */}
            <div
              className={`mfa-factor-card${!totpDone ? ' mfa-factor-card--locked' : ''}${passkeyState === 'done' ? ' mfa-factor-card--done' : ''}`}
              aria-disabled={!totpDone}
            >
              <div className="mfa-factor-head">
                <div className={`mfa-factor-badge${!totpDone ? ' mfa-factor-badge--locked' : passkeyState === 'done' ? ' mfa-factor-badge--done' : ''}`}>
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
                        : passkeySupported === false
                          ? 'Not supported on this device'
                          : 'Face ID, Touch ID, Windows Hello'}
                  </div>
                </div>
              </div>

              {totpDone && passkeyState !== 'done' && (
                <div className="mfa-factor-body">
                  {passkeySupported === null && <p className="mfa-factor-instruction">Checking device capabilities…</p>}

                  {passkeySupported === true && (
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
                          : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                              <ellipse cx="9" cy="16" rx="5" ry="5"/><path d="M14 16h6M17 14v4"/><path d="M9 11V4.5a2.5 2.5 0 0 1 5 0"/>
                            </svg>Set up Face ID / Touch ID / Passkey</>}
                      </button>
                      {passkeyState === 'error' && <p className="mfa-error" role="alert">Setup failed — you can skip and add it later</p>}
                    </>
                  )}

                  {passkeySupported === false && (
                    <p className="mfa-factor-instruction">
                      Biometrics aren't available on this device. You can add a passkey later from Settings.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Continue */}
            {totpDone && (
              <div className="mfa-factor-actions">
                <button className="mfa-enter-btn" onClick={finishSetup}>
                  Continue
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
                {passkeySupported === true && passkeyState === 'idle' && (
                  <button className="mfa-skip-btn" onClick={finishSetup}>
                    Skip biometrics for now
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Success ────────────────────────────────── */}
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
