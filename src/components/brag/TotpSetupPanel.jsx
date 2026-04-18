import { useState, useRef, useCallback, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function TotpSetupPanel({ onDone, onCancel }) {
  const [secret, setSecret]       = useState('')
  const [uri, setUri]             = useState('')
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [digits, setDigits]       = useState(['', '', '', '', '', ''])
  const [totpState, setTotpState] = useState('idle') // idle | checking | error | done
  const totpRefs                  = useRef([])

  const loadSetup = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    fetch('/api/auth/totp/setup', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.secret) {
          setLoadError(true)
          return
        }
        setSecret(data.secret)
        setUri(data.uri ?? '')
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadSetup()
  }, [loadSetup])

  const secretDisp = secret.match(/.{1,4}/g)?.join(' ') ?? secret

  const verifyTotp = useCallback(async (d) => {
    const code = d.join('')
    if (!secret) return
    setTotpState('checking')
    try {
      const res = await fetch('/api/auth/totp/setup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code, secret }),
      })
      if (res.ok) {
        setTotpState('done')
        setTimeout(onDone, 600)
      } else {
        setTotpState('error')
        setTimeout(() => {
          setDigits(['', '', '', '', '', ''])
          setTotpState('idle')
          totpRefs.current[0]?.focus()
        }, 700)
      }
    } catch {
      setTotpState('error')
      setTimeout(() => { setDigits(['', '', '', '', '', '']); setTotpState('idle') }, 700)
    }
  }, [secret, onDone])

  const handleChange = useCallback((i, val) => {
    const d = val.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = prev.map((v, idx) => idx === i ? d : v)
      if (d && i < 5) setTimeout(() => totpRefs.current[i + 1]?.focus(), 0)
      if (next.every(Boolean)) verifyTotp(next)
      return next
    })
  }, [verifyTotp])

  const handleKey = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      setDigits((prev) => {
        if (prev[i]) return prev.map((v, idx) => idx === i ? '' : v)
        if (i > 0) setTimeout(() => totpRefs.current[i - 1]?.focus(), 0)
        return prev
      })
    } else if (e.key === 'ArrowLeft'  && i > 0) totpRefs.current[i - 1]?.focus()
      else if (e.key === 'ArrowRight' && i < 5) totpRefs.current[i + 1]?.focus()
  }, [])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = Array.from({ length: 6 }, (_, i) => text[i] ?? '')
    setDigits(next)
    totpRefs.current[Math.min(text.length, 5)]?.focus()
    if (next.every(Boolean)) verifyTotp(next)
  }, [verifyTotp])

  const copySecret = () => {
    navigator.clipboard?.writeText(secret).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const disabled = totpState === 'done' || totpState === 'checking'

  return (
    <div id="totp-setup" className="bss-totp-body">
      <p className="bss-totp-instruction">
        Scan the QR code with your authenticator app, or copy the key for manual entry.
        Then enter the 6-digit code to verify.
      </p>

      {loading ? (
        <div className="bss-loading" aria-busy="true" aria-label="Generating secret">
          <span className="bss-spinner" aria-hidden="true" />
        </div>
      ) : loadError ? (
        <div className="bss-error" role="alert">
          We couldn&apos;t generate your authenticator setup right now.
          <div className="bss-totp-actions">
            <button className="bss-mfa-reconfig-btn" onClick={loadSetup}>Try again</button>
          </div>
        </div>
      ) : (
        <>
          {uri && (
            <div className="bss-qr-wrap" aria-label="QR code for authenticator app">
              <QRCodeSVG value={uri} size={136} bgColor="#FAF7F3" fgColor="#2A221A" level="M" />
            </div>
          )}

          <div className="bss-secret-row">
            <code className="bss-secret-code">{secretDisp}</code>
            <button className="bss-copy-btn" onClick={copySecret} aria-label="Copy secret key">
              {copied
                ? <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7l3.5 3.5L12 3"/></svg>
                : <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="8" height="8" rx="1"/><path d="M2 10V3a1 1 0 0 1 1-1h7"/></svg>}
            </button>
          </div>

          <div
            className={['bss-otp-row', totpState === 'error' ? 'bss-otp-row--error' : '', totpState === 'done' ? 'bss-otp-row--done' : ''].join(' ')}
            onPaste={handlePaste}
            role="group"
            aria-label="6-digit verification code"
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { totpRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                className="bss-otp-box"
                aria-label={`Digit ${i + 1} of 6`}
                autoFocus={i === 0}
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                disabled={disabled}
              />
            ))}
          </div>

          {totpState === 'error' && (
            <p className="bss-otp-error" role="alert">Incorrect code — try again</p>
          )}
        </>
      )}

      <div className="bss-totp-actions">
        <button className="bss-totp-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
