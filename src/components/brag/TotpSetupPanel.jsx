import { useState, useRef, useCallback, useEffect } from 'react'
import { apiFetch } from '@/utils/api'
import { useSixDigitCode } from '@/hooks/useSixDigitCode'
import DigitRow from '@/components/mfa/DigitRow'
import TotpSecretBlock from '@/components/mfa/TotpSecretBlock'

export default function TotpSetupPanel({ onDone, onCancel }) {
  const [secret, setSecret]       = useState('')
  const [uri, setUri]             = useState('')
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [copied, setCopied]       = useState(false)
  const totpRefs                  = useRef([])
  const timeoutRefs               = useRef([])

  const scheduleTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutRefs.current.push(id)
    return id
  }, [])

  useEffect(() => () => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }, [])

  const loadSetup = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    setSecret('')
    setUri('')
    apiFetch('/api/auth/totp/setup')
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
  const totpCode = useSixDigitCode({ inputRefs: totpRefs, scheduleTimeout })

  const verifyTotp = useCallback(async (d) => {
    const code = d.join('')
    if (!secret) return
    totpCode.setState('checking')
    try {
      const res = await apiFetch('/api/auth/totp/setup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, secret }),
      })
      if (res.ok) {
        totpCode.setState('done')
        scheduleTimeout(onDone, 600)
      } else {
        totpCode.setError()
      }
    } catch {
      totpCode.setError()
    }
  }, [scheduleTimeout, secret, onDone, totpCode])

  useEffect(() => {
    if (totpCode.state === 'idle' && totpCode.digits.every(Boolean)) verifyTotp(totpCode.digits)
  }, [totpCode.digits, totpCode.state, verifyTotp])

  const copySecret = () => {
    navigator.clipboard?.writeText(secret).catch(() => {})
    setCopied(true)
    scheduleTimeout(() => setCopied(false), 2000)
  }

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
          <TotpSecretBlock
            copied={copied}
            copyClassName="bss-copy-btn"
            qrClassName="bss-qr-wrap"
            qrSize={136}
            secret={secretDisp}
            secretClassName="bss-secret-code"
            secretRowClassName="bss-secret-row"
            uri={uri}
            onCopy={copySecret}
          />
          <DigitRow
            ariaLabel="6-digit verification code"
            digits={totpCode.digits}
            inputRefs={totpRefs}
            inputState={totpCode.state}
            variant="bss"
            onChange={totpCode.handleChange}
            onKeyDown={totpCode.handleKeyDown}
            onPaste={totpCode.handlePaste}
          />
          {totpCode.state === 'error' && (
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
