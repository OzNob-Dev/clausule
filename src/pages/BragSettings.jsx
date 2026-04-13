import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { storage } from '../utils/storage'
import '../styles/brag-employee.css'
import '../styles/brag-settings.css'

// ── TOTP constants (matches MFA setup) ──────────────────────────
const DEMO_TOTP        = '123456'
const TOTP_SECRET_RAW  = 'JBSWY3DPEHPK3PXP'
const TOTP_SECRET_DISP = 'JBSW Y3DP EHPK 3PXP'
const TOTP_URI         = `otpauth://totp/Clausule:demo%40clausule.com?secret=${TOTP_SECRET_RAW}&issuer=Clausule&algorithm=SHA1&digits=6&period=30`

// ── Demo seed data ───────────────────────────────────────────────
const INITIAL_DEVICES = [
  {
    id: 'bio-seed-1',
    name: 'MacBook Pro',
    type: 'laptop',
    method: 'Touch ID',
    addedAt: '2025-11-12',
    isCurrent: true,
  },
]

// ── Helpers ──────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function inferDevice() {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua))  return { name: 'iPhone',       type: 'phone',  method: 'Face ID' }
  if (/iPad/.test(ua))    return { name: 'iPad',          type: 'tablet', method: 'Face ID' }
  if (/Android/.test(ua)) return { name: 'Android phone', type: 'phone',  method: 'Fingerprint' }
  if (/Windows/.test(ua)) return { name: 'Windows PC',    type: 'laptop', method: 'Windows Hello' }
  return                          { name: 'MacBook',       type: 'laptop', method: 'Touch ID' }
}

function DeviceIcon({ type }) {
  if (type === 'phone') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <circle cx="12" cy="17.5" r="1"/>
    </svg>
  )
  if (type === 'tablet') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <circle cx="12" cy="17.5" r="1"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="4" width="20" height="14" rx="2"/>
      <path d="M8 22h8M12 18v4"/>
    </svg>
  )
}

// ── Main component ───────────────────────────────────────────────
export default function BragSettings() {
  const navigate = useNavigate()

  // ── Biometrics ─────────────────────────────────────────────────
  const [devices, setDevices]             = useState(INITIAL_DEVICES)
  const [registering, setRegistering]     = useState(false)
  const [registerError, setRegisterError] = useState(false)
  const [passkeyAvailable, setPasskeyAvailable] = useState(null)
  const [removeTarget, setRemoveTarget]   = useState(null)

  // ── MFA — TOTP reconfigure ─────────────────────────────────────
  const [totpConfigured, setTotpConfigured] = useState(true)
  const [totpExpanded, setTotpExpanded]     = useState(false)
  const [totp, setTotp]                     = useState(['', '', '', '', '', ''])
  const [totpState, setTotpState]           = useState('idle') // idle | error | done
  const [copied, setCopied]                 = useState(false)
  const totpRefs                            = useRef([])

  // ── Delete account ─────────────────────────────────────────────
  const [deleteModal, setDeleteModal]     = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // Detect platform authenticator on mount
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

  const logout = () => { storage.clearAuth(); navigate('/') }

  // ── Passkey registration ────────────────────────────────────────
  const registerDevice = async () => {
    setRegistering(true)
    setRegisterError(false)
    try {
      await new Promise((r) => setTimeout(r, 1800))
      const { name, type, method } = inferDevice()
      const suffix = devices.filter((d) => d.name === name).length + 1
      setDevices((prev) => [
        ...prev,
        {
          id: `bio-${Date.now()}`,
          name: suffix > 1 ? `${name} (${suffix})` : name,
          type,
          method,
          addedAt: new Date().toISOString().slice(0, 10),
          isCurrent: false,
        },
      ])
    } catch {
      setRegisterError(true)
    } finally {
      setRegistering(false)
    }
  }

  const removeDevice = (id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id))
    setRemoveTarget(null)
  }

  // ── TOTP handlers ───────────────────────────────────────────────
  const verifyTotp = useCallback((digits) => {
    const code = digits.join('')
    if (code === DEMO_TOTP) {
      setTotpState('done')
      setTimeout(() => {
        setTotpConfigured(true)
        setTotpExpanded(false)
        setTotp(['', '', '', '', '', ''])
        setTotpState('idle')
      }, 600)
    } else {
      setTotpState('error')
      setTimeout(() => {
        setTotp(['', '', '', '', '', ''])
        setTotpState('idle')
        totpRefs.current[0]?.focus()
      }, 700)
    }
  }, [])

  const handleTotpChange = useCallback((i, val) => {
    const d = val.replace(/\D/g, '').slice(-1)
    setTotp((prev) => {
      const next = prev.map((v, idx) => idx === i ? d : v)
      if (d && i < 5) setTimeout(() => totpRefs.current[i + 1]?.focus(), 0)
      if (next.every(Boolean)) verifyTotp(next)
      return next
    })
  }, [verifyTotp])

  const handleTotpKey = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      setTotp((prev) => {
        if (prev[i]) return prev.map((v, idx) => idx === i ? '' : v)
        if (i > 0) setTimeout(() => totpRefs.current[i - 1]?.focus(), 0)
        return prev
      })
    } else if (e.key === 'ArrowLeft'  && i > 0) totpRefs.current[i - 1]?.focus()
      else if (e.key === 'ArrowRight' && i < 5) totpRefs.current[i + 1]?.focus()
  }, [])

  const handleTotpPaste = useCallback((e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = Array.from({ length: 6 }, (_, i) => text[i] ?? '')
    setTotp(next)
    totpRefs.current[Math.min(text.length, 5)]?.focus()
    if (next.every(Boolean)) verifyTotp(next)
  }, [verifyTotp])

  const cancelTotp = () => {
    setTotpExpanded(false)
    setTotp(['', '', '', '', '', ''])
    setTotpState('idle')
  }

  const copySecret = () => {
    navigator.clipboard?.writeText(TOTP_SECRET_RAW).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const targetDevice = devices.find((d) => d.id === removeTarget)
  const confirmReady = deleteConfirm === 'DELETE'

  return (
    <div className="be-page">

      {/* ── Rail ─────────────────────────────────────────────── */}
      <aside className="be-rail be-sidebar" aria-label="App navigation">
        <div className="be-rail-logo" aria-hidden="true">CLS</div>
        <nav className="be-rail-nav" aria-label="Primary">
          <button
            className="be-rail-btn"
            onClick={() => navigate('/brag')}
            aria-label="Brag doc"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 2l1 2.5L11.5 5l-2 2 .5 3L8 8.5 5.5 10l.5-3-2-2L6.5 4.5z"/>
              <circle cx="13" cy="12" r="1.5"/>
            </svg>
          </button>
          <button
            className="be-rail-btn-active"
            aria-label="Settings"
            aria-current="page"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="8" cy="8" r="2.5"/>
              <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"/>
            </svg>
          </button>
        </nav>
        <div className="be-rail-foot">
          <div className="be-rail-avatar" aria-hidden="true">JE</div>
          <button onClick={logout} className="be-rail-icon-btn" aria-label="Sign out">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
              <polyline points="11 11 14 8 11 5"/><line x1="14" y1="8" x2="6" y2="8"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Identity sidebar ─────────────────────────────────── */}
      <div className="be-identity be-sidebar" role="complementary" aria-label="Profile">
        <div className="be-sidebar-header">
          <div className="be-sidebar-eyebrow">Clausule · Settings</div>
        </div>
        <div className="be-sidebar-body">
          <div>
            <div className="be-sidebar-avatar" aria-hidden="true">JE</div>
            <div className="be-sidebar-name">Jordan Ellis</div>
            <div className="be-sidebar-role">Senior engineer · Platform</div>
          </div>
          <div className="be-divider" role="separator" />
          <div>
            <div className="be-notes-label">Account security</div>
            <p className="bss-identity-note">
              Manage two-factor authentication and biometric devices for phishing-resistant sign-in.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="be-main">
        <div className="be-inner">

          <div className="bss-heading">Security settings</div>
          <div className="bss-subheading">Manage how you sign in to Clausule.</div>
          <div className="bss-divider" />

          {/* ── Two-factor authentication ──────────────────── */}
          <div className="bss-section-label">Two-factor authentication</div>
          <div className="bss-card">

            {/* Email code row */}
            <div className="bss-mfa-row">
              <div className="bss-mfa-icon bss-mfa-icon--on" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="6" width="18" height="13" rx="2"/>
                  <path d="M3 10l9 6 9-6"/>
                </svg>
              </div>
              <div className="bss-mfa-info">
                <div className="bss-mfa-title">Email code</div>
                <div className="bss-mfa-sub">A one-time code sent to your email address each time you sign in.</div>
              </div>
              <span className="bss-mfa-status bss-mfa-status--on" aria-label="Email code is active">Active</span>
            </div>

            <div className="bss-mfa-divider" />

            {/* Authenticator app row */}
            <div className="bss-mfa-row">
              <div className={`bss-mfa-icon${totpConfigured ? ' bss-mfa-icon--on' : ''}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <rect x="8" y="7" width="8" height="6" rx="1"/>
                  <circle cx="12" cy="17.5" r="1"/>
                </svg>
              </div>
              <div className="bss-mfa-info">
                <div className="bss-mfa-title">Authenticator app</div>
                <div className="bss-mfa-sub">
                  {totpConfigured
                    ? 'Verified — Google Authenticator, Authy, 1Password, etc.'
                    : 'Not configured — add an authenticator app for a second factor.'}
                </div>
              </div>
              {!totpExpanded ? (
                <button
                  className="bss-mfa-reconfig-btn"
                  onClick={() => setTotpExpanded(true)}
                  aria-expanded="false"
                  aria-controls="totp-setup"
                >
                  {totpConfigured ? 'Reconfigure' : 'Set up'}
                </button>
              ) : (
                <button
                  className="bss-mfa-reconfig-btn"
                  onClick={cancelTotp}
                  aria-expanded="true"
                  aria-controls="totp-setup"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* TOTP expanded setup */}
            {totpExpanded && (
              <div id="totp-setup" className="bss-totp-body">
                <p className="bss-totp-instruction">
                  Scan the QR code with your authenticator app, or copy the key for manual entry.
                  Then enter the 6-digit code to verify.
                </p>

                <div className="bss-qr-wrap" aria-label="QR code for authenticator app">
                  <QRCodeSVG
                    value={TOTP_URI}
                    size={136}
                    bgColor="#FAF7F3"
                    fgColor="#2A221A"
                    level="M"
                  />
                </div>

                <div className="bss-secret-row">
                  <code className="bss-secret-code">{TOTP_SECRET_DISP}</code>
                  <button
                    className="bss-copy-btn"
                    onClick={copySecret}
                    aria-label="Copy secret key"
                  >
                    {copied
                      ? <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7l3.5 3.5L12 3"/></svg>
                      : <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="8" height="8" rx="1"/><path d="M2 10V3a1 1 0 0 1 1-1h7"/></svg>}
                  </button>
                </div>

                <div className="bss-demo-pill">Demo code: <strong>{DEMO_TOTP}</strong></div>

                <div
                  className={[
                    'bss-otp-row',
                    totpState === 'error' ? 'bss-otp-row--error' : '',
                    totpState === 'done'  ? 'bss-otp-row--done'  : '',
                  ].join(' ')}
                  onPaste={handleTotpPaste}
                  role="group"
                  aria-label="6-digit verification code"
                >
                  {totp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { totpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleTotpChange(i, e.target.value)}
                      onKeyDown={(e) => handleTotpKey(i, e)}
                      className="bss-otp-box"
                      aria-label={`Digit ${i + 1} of 6`}
                      autoFocus={i === 0}
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      disabled={totpState === 'done'}
                    />
                  ))}
                </div>

                {totpState === 'error' && (
                  <p className="bss-otp-error" role="alert">Incorrect code — try again</p>
                )}

                <div className="bss-totp-actions">
                  <button className="bss-totp-cancel" onClick={cancelTotp}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* ── Biometric devices ─────────────────────────── */}
          <div className="bss-section-label">Biometric login</div>
          <div className="bss-card">
            <div className="bss-card-head">
              <div>
                <div className="bss-card-title">Registered devices</div>
                <div className="bss-card-sub">
                  Each device listed here can sign you in with Face ID, Touch ID, or Windows Hello — no password required.
                </div>
              </div>
              {passkeyAvailable === true && (
                <button
                  className="bss-add-btn"
                  onClick={registerDevice}
                  disabled={registering}
                  aria-busy={registering}
                >
                  {registering ? (
                    <><span className="bss-spinner" aria-hidden="true" />Waiting for device…</>
                  ) : (
                    <>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <line x1="8" y1="3" x2="8" y2="13"/>
                        <line x1="3" y1="8" x2="13" y2="8"/>
                      </svg>
                      Add this device
                    </>
                  )}
                </button>
              )}
            </div>

            {devices.length === 0 ? (
              <p className="bss-empty">No devices registered — add this device to enable biometric sign-in.</p>
            ) : (
              <ul className="bss-device-list" aria-label="Registered biometric devices">
                {devices.map((device) => (
                  <li key={device.id} className="bss-device-row">
                    <div className="bss-device-icon">
                      <DeviceIcon type={device.type} />
                    </div>
                    <div className="bss-device-info">
                      <div className="bss-device-name">
                        {device.name}
                        {device.isCurrent && (
                          <span className="bss-current-badge">This device</span>
                        )}
                      </div>
                      <div className="bss-device-meta">
                        {device.method} · Added {formatDate(device.addedAt)}
                      </div>
                    </div>
                    <button
                      className="bss-remove-btn"
                      onClick={() => setRemoveTarget(device.id)}
                      aria-label={`Remove ${device.name}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {registerError && (
              <p className="bss-error" role="alert">
                Registration failed — check your device settings or try a different browser.
              </p>
            )}

            {passkeyAvailable === false && (
              <div className="bss-notice">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5"/>
                  <line x1="8" y1="5" x2="8" y2="8.5"/>
                  <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
                Biometric authentication isn't available in this browser. Try Chrome, Safari, or Edge on a device with a fingerprint reader or camera.
              </div>
            )}
          </div>

          {/* ── Callout ───────────────────────────────────── */}
          <div className="bss-callout">
            <svg className="bss-callout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 2a5 5 0 0 1 5 5v2H7V7a5 5 0 0 1 5-5z"/>
              <rect x="3" y="9" width="18" height="13" rx="2"/>
              <circle cx="12" cy="15.5" r="1.5"/>
            </svg>
            <div>
              <div className="bss-callout-title">Phishing-resistant sign-in</div>
              <div className="bss-callout-body">
                Passkeys are cryptographically bound to clausule.app — they can't be stolen or replayed on fake login pages. Register each device you use regularly to skip the password entirely on that device.
              </div>
            </div>
          </div>

          {/* ── Danger zone ───────────────────────────────── */}
          <div className="bss-danger-section">
            <div className="bss-danger-label">Danger zone</div>
            <div className="bss-danger-card">
              <div className="bss-danger-row">
                <div>
                  <div className="bss-danger-title">Delete account</div>
                  <div className="bss-danger-desc">
                    Permanently removes your account and all brag doc entries, files, and records. This cannot be undone.
                  </div>
                </div>
                <button
                  className="bss-btn-delete"
                  onClick={() => { setDeleteConfirm(''); setDeleteModal(true) }}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Remove device modal ───────────────────────────────── */}
      {removeTarget && (
        <div
          className="bss-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-modal-title"
          onClick={(e) => e.target === e.currentTarget && setRemoveTarget(null)}
        >
          <div className="bss-modal">
            <div className="bss-modal-title" id="remove-modal-title">
              Remove {targetDevice?.name}?
            </div>
            <div className="bss-modal-body">
              {devices.length === 1
                ? "This is your only registered device. After removing it you'll need your authenticator app to sign in."
                : `You'll no longer be able to sign in with ${targetDevice?.method} on this device.`}
            </div>
            <div className="bss-modal-actions">
              <button
                className="bss-btn-confirm-remove"
                onClick={() => removeDevice(removeTarget)}
              >
                Remove device
              </button>
              <button className="bss-btn-modal-cancel" onClick={() => setRemoveTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete account modal ──────────────────────────────── */}
      {deleteModal && (
        <div
          className="bss-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => e.target === e.currentTarget && setDeleteModal(false)}
        >
          <div className="bss-modal">
            <div className="bss-modal-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" stroke="#B83232" strokeWidth="1.8" strokeLinecap="round">
                <polyline points="3 6 5 6 17 6"/>
                <path d="M8 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/>
                <path d="M16 6l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/>
                <line x1="10" y1="11" x2="10" y2="15"/>
                <line x1="8"  y1="11" x2="8"  y2="15"/>
                <line x1="12" y1="11" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="bss-modal-title" id="delete-modal-title">
              Delete your account?
            </div>
            <div className="bss-modal-body">
              This will <strong>permanently delete</strong> your brag doc and all associated entries, evidence files, and records from our servers. This action <strong>cannot be undone</strong>.
            </div>
            <div className="bss-modal-confirm-wrap">
              <label className="bss-confirm-label" htmlFor="delete-confirm-input">
                Type <span>DELETE</span> to confirm
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                autoFocus
                className="bss-confirm-input"
              />
            </div>
            <div className="bss-modal-actions">
              <button
                disabled={!confirmReady}
                onClick={() => { storage.clearAuth(); navigate('/') }}
                className={`bss-btn-delete-confirm${confirmReady ? ' bss-btn-delete-confirm--ready' : ''}`}
              >
                Yes, permanently delete my account
              </button>
              <button className="bss-btn-modal-cancel" onClick={() => setDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
