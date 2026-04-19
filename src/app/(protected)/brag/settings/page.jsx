'use client'

import { useState } from 'react'
import BragRail from '@/components/brag/BragRail'
import TotpSetupPanel from '@/components/brag/TotpSetupPanel'
import DeleteAccountModal from '@/components/brag/DeleteAccountModal'
import SsoStatusSection from '@/components/brag/SsoStatusSection'
import { useProfileStore } from '@/stores/useProfileStore'
import '@/styles/brag-shell.css'
import '@/styles/brag-settings-core.css'
import '@/styles/brag-settings-totp.css'

export default function BragSettings() {
  const profile = useProfileStore((state) => state.profile)
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const setSecurity = useProfileStore((state) => state.setSecurity)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const mfaRestrictionEnabled = hasSecuritySnapshot && !authenticatorAppConfigured

  const [totpExpanded, setTotpExpanded]     = useState(false)

  const [deleteModal, setDeleteModal] = useState(false)

  const handleTotpDone = () => {
    setSecurity({ authenticatorAppConfigured: true })
    setTotpExpanded(false)
  }

  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : profile.email || 'Your profile'

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
            <div className="be-sidebar-name">{displayName}</div>
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

          {ssoConfigured && (
            <SsoStatusSection
              avatarInitials={avatarInitials}
              displayName={displayName}
              email={profile.email}
            />
          )}

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
                  <div className={`bss-mfa-icon${authenticatorAppConfigured || hasSecuritySnapshot ? ' bss-mfa-icon--on' : ''}`} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="5" y="2" width="14" height="20" rx="2"/>
                      <rect x="8" y="7" width="8" height="6" rx="1"/>
                      <circle cx="12" cy="17.5" r="1"/>
                    </svg>
                  </div>
                  
                  <div className="bss-mfa-info">
                    <div className="bss-mfa-title">Authenticator app</div>
                    <div className="bss-mfa-sub">
                      {authenticatorAppConfigured
                        ? 'Authenticator app verification is active for this account.'
                        : 'Required — set up an authenticator app to unlock the rest of Clausule.'}
                    </div>
                  </div>
                  {authenticatorAppConfigured ? (
                    <span className="bss-mfa-status bss-mfa-status--on" aria-label="Authenticator app is active">Active</span>
                  ) : hasSecuritySnapshot && (
                    <button
                      className="bss-mfa-reconfig-btn"
                      onClick={() => setTotpExpanded((v) => !v)}
                      aria-expanded={totpExpanded}
                      aria-controls="totp-setup"
                    >
                      {totpExpanded ? 'Cancel' : 'Set up'}
                    </button>
                  )}
                </div>

                {!hasSecuritySnapshot && (
                  <div className="bss-loading-state" aria-busy="true">
                    <span className="bss-loading-state__dot" aria-hidden="true" />
                    Loading authenticator status…
                  </div>
                )}

                {hasSecuritySnapshot && !authenticatorAppConfigured && !totpExpanded && (
                  <div className={`bss-totp-empty${mfaRestrictionEnabled ? ' bss-totp-empty--required' : ''}`} role="status" aria-live="polite">
                    <div className="bss-totp-empty-title">Authenticator setup required</div>
                    <p className="bss-totp-empty-copy">
                      This keeps your account protected. Set it up now to continue using the app.
                    </p>
                  </div>
                )}

                {!authenticatorAppConfigured && totpExpanded && hasSecuritySnapshot && (
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
