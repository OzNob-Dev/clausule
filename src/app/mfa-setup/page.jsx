'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@/utils/storage'
import { useSixDigitCode } from '@/hooks/useSixDigitCode'
import MfaOtpStep from '@/components/mfa/MfaOtpStep'
import MfaSuccessStep from '@/components/mfa/MfaSuccessStep'
import MfaTotpStep from '@/components/mfa/MfaTotpStep'
import '@/styles/mfa-layout.css'
import '@/styles/mfa-factors.css'
import '@/styles/code-email.css'

// ── Main component ────────────────────────────────────────────────
export default function MfaSetup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('your email')
  const [hasMfaSetup, setHasMfaSetup] = useState(false)

  const [resendTimer, setResendTimer] = useState(30)
  const otpRefs = useRef([])

  const [totpSecret, setTotpSecret]         = useState('')
  const [totpUri, setTotpUri]               = useState('')
  const [totpSecretDisp, setTotpSecretDisp] = useState('')
  const [totpLoading, setTotpLoading]       = useState(false)
  const [copied, setCopied]                 = useState(false)
  const totpRefs = useRef([])
  const timeoutRefs = useRef([])

  const scheduleTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutRefs.current.push(id)
    return id
  }, [])

  useEffect(() => {
    setEmail(storage.getEmail() || 'your email')
    setHasMfaSetup(storage.getMfaSetup())
  }, [])

  useEffect(() => () => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }, [])

  // Fetch real TOTP secret when entering step 2
  useEffect(() => {
    if (step !== 2 || totpSecret) return
    setTotpLoading(true)
    fetch('/api/auth/totp/setup', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then(({ secret, uri }) => {
        if (!secret) return
        setTotpSecret(secret)
        setTotpUri(uri)
        setTotpSecretDisp(secret.match(/.{1,4}/g)?.join(' ') ?? secret)
      })
      .catch(() => {})
      .finally(() => setTotpLoading(false))
  }, [step, totpSecret])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer((n) => n - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const otpCode = useSixDigitCode({
    inputRefs: otpRefs,
    scheduleTimeout,
  })

  const totpCode = useSixDigitCode({
    inputRefs: totpRefs,
    scheduleTimeout,
  })
  const totpDone = totpCode.state === 'done'

  const verifyOtp = useCallback(async (digits) => {
    const code = digits.join('')
    otpCode.setState('checking')
    try {
      const res = await fetch('/api/auth/verify-code', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, code }),
      })
      if (res.ok) {
        otpCode.setState('done')
        if (hasMfaSetup) {
          scheduleTimeout(() => router.replace('/brag'), 500)
        } else {
          scheduleTimeout(() => setStep(2), 500)
        }
      } else {
        otpCode.setError()
      }
    } catch {
      otpCode.setError()
    }
  }, [email, hasMfaSetup, otpCode, router, scheduleTimeout])

  const verifyTotp = useCallback(async (digits) => {
    const code = digits.join('')
    if (!totpSecret) return
    totpCode.setState('checking')
    try {
      const res = await fetch('/api/auth/totp/setup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body:    JSON.stringify({ code, secret: totpSecret }),
      })
      if (res.ok) {
        totpCode.setState('done')
      } else {
        totpCode.setError()
      }
    } catch {
      totpCode.setError()
    }
  }, [scheduleTimeout, totpCode, totpSecret])

  useEffect(() => {
    if (otpCode.state === 'idle' && otpCode.digits.every(Boolean)) {
      verifyOtp(otpCode.digits)
    }
  }, [otpCode.digits, otpCode.state, verifyOtp])

  useEffect(() => {
    if (step !== 2) return
    if (totpCode.state === 'idle' && totpCode.digits.every(Boolean)) {
      verifyTotp(totpCode.digits)
    }
  }, [step, totpCode.digits, totpCode.state, verifyTotp])

  const copySecret = () => {
    navigator.clipboard?.writeText(totpSecret).catch(() => {})
    setCopied(true)
    scheduleTimeout(() => setCopied(false), 2000)
  }

  const finishSetup = () => {
    storage.setMfaSetup(true)
    setHasMfaSetup(true)
    setStep(3)
  }

  const enterApp = () => router.push('/brag')

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
                step > n   ? 'mfa-seg--done'   : '',
                step === n ? 'mfa-seg--active' : '',
              ].join(' ')}
              aria-label={`Step ${n}: ${stepLabels[n - 1]}${step > n ? ' (complete)' : step === n ? ' (current)' : ''}`}
            />
          ))}
        </nav>

        {step === 1 && (
          <MfaOtpStep
            email={email}
            otp={otpCode.digits}
            otpRefs={otpRefs}
            otpState={otpCode.state}
            resendTimer={resendTimer}
            onChange={otpCode.handleChange}
            onKeyDown={otpCode.handleKeyDown}
            onPaste={otpCode.handlePaste}
            onResend={() => setResendTimer(30)}
          />
        )}

        {step === 2 && (
          <MfaTotpStep
            copied={copied}
            onCopySecret={copySecret}
            onContinue={finishSetup}
            totp={totpCode.digits}
            totpDone={totpDone}
            totpLoading={totpLoading}
            totpRefs={totpRefs}
            totpSecretDisp={totpSecretDisp}
            totpState={totpCode.state}
            totpUri={totpUri}
            onChange={totpCode.handleChange}
            onKeyDown={totpCode.handleKeyDown}
            onPaste={totpCode.handlePaste}
          />
        )}

        {step === 3 && <MfaSuccessStep onEnterApp={enterApp} />}

      </div>
    </div>
  )
}
