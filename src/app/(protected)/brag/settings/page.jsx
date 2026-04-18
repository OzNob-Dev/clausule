'use client'

import { useEffect, useState } from 'react'
import BragRail from '@/components/brag/BragRail'
import TotpSetupPanel from '@/components/brag/TotpSetupPanel'
import DeleteAccountModal from '@/components/brag/DeleteAccountModal'
import { useProfileStore } from '@/stores/useProfileStore'
import '@/styles/brag-employee.css'
import '@/styles/brag-settings.css'

export default function BragSettings() {
  const profile = useProfileStore((state) => state.profile)
  const setProfile = useProfileStore((state) => state.setProfile)

  const [totpConfigured, setTotpConfigured] = useState(false)
  const [totpLoading, setTotpLoading]       = useState(true)
  const [totpExpanded, setTotpExpanded]     = useState(false)

  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    fetch('/api/auth/profile', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() : {})
      .then((data) => setProfile({ firstName: data.firstName ?? '', lastName: data.lastName ?? '', email: data.email ?? '' }))
      .catch(() => {})
  }, [setProfile])

  useEffect(() => {
    fetch('/api/auth/totp/status', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() : { configured: false })
      .then((data) => setTotpConfigured(data.configured ?? false))
      .catch(() => setTotpConfigured(false))
      .finally(() => setTotpLoading(false))
  }, [])

  const handleTotpDone = () => {
    setTotpConfigured(true)
    setTotpExpanded(false)
  }

  const avatarInitials =
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'

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
            <div key={avatarInitials} className="be-sidebar-avatar be-avatar-pop" aria-hidden="true">
              {avatarInitials}
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
              Manage two-factor authentication for secure sign-in.
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
