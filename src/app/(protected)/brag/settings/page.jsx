'use client'

import { useState, useEffect } from 'react'
import BragRail from '@/components/brag/BragRail'
import TotpSetupPanel from '@/components/brag/TotpSetupPanel'
import DeviceList from '@/components/brag/DeviceList'
import DeleteAccountModal from '@/components/brag/DeleteAccountModal'
import '@/styles/brag-employee.css'
import '@/styles/brag-settings.css'

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

function inferDevice() {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua))  return { name: 'iPhone',        type: 'phone',  method: 'Face ID' }
  if (/iPad/.test(ua))    return { name: 'iPad',           type: 'tablet', method: 'Face ID' }
  if (/Android/.test(ua)) return { name: 'Android phone',  type: 'phone',  method: 'Fingerprint' }
  if (/Windows/.test(ua)) return { name: 'Windows PC',     type: 'laptop', method: 'Windows Hello' }
  return                         { name: 'MacBook',         type: 'laptop', method: 'Touch ID' }
}

export default function BragSettings() {
  const [devices, setDevices]             = useState(INITIAL_DEVICES)
  const [registering, setRegistering]     = useState(false)
  const [registerError, setRegisterError] = useState(false)
  const [passkeyAvailable, setPasskeyAvailable] = useState(null)

  const [totpConfigured, setTotpConfigured] = useState(true)
  const [totpExpanded, setTotpExpanded]     = useState(false)

  const [deleteModal, setDeleteModal] = useState(false)

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

  const removeDevice = (id) => setDevices((prev) => prev.filter((d) => d.id !== id))

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
              <button
                className="bss-mfa-reconfig-btn"
                onClick={() => setTotpExpanded((v) => !v)}
                aria-expanded={totpExpanded}
                aria-controls="totp-setup"
              >
                {totpExpanded ? 'Cancel' : totpConfigured ? 'Reconfigure' : 'Set up'}
              </button>
            </div>

            {totpExpanded && (
              <TotpSetupPanel onDone={handleTotpDone} onCancel={() => setTotpExpanded(false)} />
            )}
          </div>

          {/* Biometric devices */}
          <div className="bss-section-label">Biometric login</div>
          <div className="bss-card">
            <DeviceList
              devices={devices}
              passkeyAvailable={passkeyAvailable}
              registering={registering}
              registerError={registerError}
              onAdd={registerDevice}
              onRemove={removeDevice}
            />
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
