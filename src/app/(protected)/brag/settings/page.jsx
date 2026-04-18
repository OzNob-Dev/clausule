'use client'

import { useState, useEffect } from 'react'
import BragRail from '@/components/brag/BragRail'
import TotpSetupPanel from '@/components/brag/TotpSetupPanel'
import DeviceList from '@/components/brag/DeviceList'
import DeleteAccountModal from '@/components/brag/DeleteAccountModal'
import '@/styles/brag-employee.css'
import '@/styles/brag-settings.css'

function b64urlToUint8(str) {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4)
  return Uint8Array.from(atob(padded.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
}

function bufToB64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function inferDevice() {
  const ua = navigator.userAgent
  if (/iPhone|iPod/.test(ua)) return { name: 'iPhone',       type: 'phone',  method: 'Face ID / Touch ID' }
  if (/iPad/.test(ua))        return { name: 'iPad',          type: 'tablet', method: 'Face ID / Touch ID' }
  if (/Android/.test(ua))     return { name: 'Android device', type: 'phone',  method: 'Biometrics' }
  if (/Win/.test(ua))         return { name: 'Windows PC',    type: 'laptop', method: 'Windows Hello' }
  if (/Mac/.test(ua))         return { name: 'Mac',           type: 'laptop', method: 'Touch ID' }
  return                             { name: 'My device',     type: 'laptop', method: 'Passkey' }
}

export default function BragSettings() {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' })

  const [devices, setDevices]             = useState([])
  const [devicesLoading, setDevicesLoading] = useState(true)
  const [registering, setRegistering]     = useState(false)
  const [registerError, setRegisterError] = useState(null)
  const [passkeyAvailable, setPasskeyAvailable] = useState(null)

  const [totpConfigured, setTotpConfigured] = useState(false)
  const [totpLoading, setTotpLoading]       = useState(true)
  const [totpExpanded, setTotpExpanded]     = useState(false)

  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    fetch('/api/auth/profile', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() : {})
      .then((data) => setProfile({ firstName: data.firstName ?? '', lastName: data.lastName ?? '', email: data.email ?? '' }))
      .catch(() => {})
  }, [])

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

  useEffect(() => {
    fetch('/api/auth/passkeys', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setDevices(Array.isArray(data) ? data : []))
      .catch(() => setDevices([]))
      .finally(() => setDevicesLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/auth/totp/status', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() : { configured: false })
      .then((data) => setTotpConfigured(data.configured ?? false))
      .catch(() => setTotpConfigured(false))
      .finally(() => setTotpLoading(false))
  }, [])

  const registerDevice = async () => {
    setRegistering(true)
    setRegisterError(null)
    try {
      const optRes = await fetch('/api/auth/passkeys/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({}),
      })
      if (!optRes.ok) throw new Error('Failed to get registration options')
      const { options, _signedChallenge } = await optRes.json()

      const createOptions = {
        ...options,
        challenge: b64urlToUint8(options.challenge),
        user: { ...options.user, id: b64urlToUint8(options.user.id) },
        excludeCredentials: (options.excludeCredentials ?? []).map((c) => ({
          ...c, id: b64urlToUint8(c.id),
        })),
      }

      const credential = await navigator.credentials.create({ publicKey: createOptions })
      if (!credential) throw new Error('No credential returned')

      const authDataBuf = credential.response.getAuthenticatorData?.()
        ?? credential.response.authenticatorData
      if (!authDataBuf) throw new Error('authenticatorData unavailable')

      const credJSON = {
        id:    credential.id,
        rawId: bufToB64url(credential.rawId),
        type:  credential.type,
        response: {
          clientDataJSON:    bufToB64url(credential.response.clientDataJSON),
          authenticatorData: bufToB64url(authDataBuf),
          attestationObject: bufToB64url(credential.response.attestationObject),
        },
      }

      const { name, type, method } = inferDevice()
      const verifyRes = await fetch('/api/auth/passkeys/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ credential: credJSON, _signedChallenge, deviceName: name, deviceType: type, method }),
      })
      if (!verifyRes.ok) {
        const { error } = await verifyRes.json().catch(() => ({}))
        throw new Error(error ?? 'Verification failed')
      }

      // Refresh device list from DB to get accurate record
      const listRes = await fetch('/api/auth/passkeys', { credentials: 'same-origin' })
      if (listRes.ok) {
        const data = await listRes.json()
        setDevices(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      if (err?.name !== 'NotAllowedError') setRegisterError(err?.message ?? 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const removeDevice = async (id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id))
    try {
      await fetch(`/api/auth/passkeys/${id}`, { method: 'DELETE', credentials: 'same-origin' })
    } catch {
      // Refresh from DB on failure to restore accurate state.
      fetch('/api/auth/passkeys', { credentials: 'same-origin' })
        .then((r) => r.ok ? r.json() : [])
        .then((data) => setDevices(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }

  const handleTotpDone = () => {
    setTotpConfigured(true)
    setTotpExpanded(false)
  }

  return (
    <div className="be-page">
      <BragRail activePage="settings" />

      {/* Identity sidebar */}
      <div className="be-identity be-sidebar" role="complementary" aria-label="Profile">
        <div className="be-sidebar-header">
          <div className="be-sidebar-eyebrow">Clausule · Settings</div>
        </div>
        <div className="be-sidebar-body">
          <div>
            <div className="be-sidebar-avatar" aria-hidden="true">
              {(profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '') || profile.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="be-sidebar-name">
              {profile.firstName || profile.lastName
                ? `${profile.firstName} ${profile.lastName}`.trim()
                : profile.email}
            </div>
            <div className="be-sidebar-role">{profile.email}</div>
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

      {/* Main content */}
      <main className="be-main">
        <div className="be-inner">

          <div className="bss-heading">Security settings</div>
          <div className="bss-subheading">Manage how you sign in to Clausule.</div>
          <div className="bss-divider" />

          {/* Two-factor authentication */}
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
              {!totpLoading && (
                <button
                  className="bss-mfa-reconfig-btn"
                  onClick={() => setTotpExpanded((v) => !v)}
                  aria-expanded={totpExpanded}
                  aria-controls="totp-setup"
                >
                  {totpExpanded ? 'Cancel' : totpConfigured ? 'Reconfigure' : 'Set up'}
                </button>
              )}
            </div>

            {totpExpanded && (
              <TotpSetupPanel onDone={handleTotpDone} onCancel={() => setTotpExpanded(false)} />
            )}
          </div>

          {/* Biometric devices */}
          <div className="bss-section-label">Biometric login</div>
          <div className="bss-card">
            {devicesLoading ? (
              <div className="bss-loading" aria-busy="true" aria-label="Loading devices">
                <span className="bss-spinner" aria-hidden="true" />
              </div>
            ) : (
              <DeviceList
                devices={devices}
                passkeyAvailable={passkeyAvailable}
                registering={registering}
                registerError={registerError}
                onAdd={registerDevice}
                onRemove={removeDevice}
              />
            )}
          </div>

          {/* Callout */}
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

          {/* Danger zone */}
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
                <button className="bss-btn-delete" onClick={() => setDeleteModal(true)}>
                  Delete account
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <DeleteAccountModal open={deleteModal} onClose={() => setDeleteModal(false)} />
    </div>
  )
}
