'use client'

import { Button } from '@shared/components/ui/Button'
import BragSecuritySetupPanel from '@brag/components/BragSecuritySetupPanel'

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  )
}

function AuthenticatorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <rect x="8" y="7" width="8" height="6" rx="1" />
      <circle cx="12" cy="17.5" r="1" />
    </svg>
  )
}

function StatusPill({ label, ariaLabel }) {
  return (
    <span className="bss-badge" role="status" aria-label={ariaLabel}>
      <span className="bss-badge__dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export default function BragSecurityMethodsCard({
  authenticatorAppConfigured,
  hasSecuritySnapshot,
  mfaRestrictionEnabled,
  totpExpanded,
  onTotpDone,
  onToggleTotp,
}) {
  return (
    <section className="bss-section" aria-labelledby="security-methods-title">
      <div className="bss-section-label" id="security-methods-title">Two-factor authentication</div>
      <div className="bss-card">
        <div className="bss-card-head">
          <span className="bss-card-head-title">Sign-in protection</span>
          <span className="bss-card-head-meta">2FA methods</span>
        </div>

        <div className="bss-method-row">
          <div className="bss-method-icon" aria-hidden="true">
            <EmailIcon />
          </div>
          <div className="bss-method-content">
            <div className="bss-method-title">Email code</div>
            <div className="bss-method-desc">A one-time code sent to your email address each time you sign in.</div>
          </div>
          <StatusPill ariaLabel="Email code is active" label="Active" />
        </div>

        <div className="bss-method-row">
          <div className={`bss-method-icon${authenticatorAppConfigured || hasSecuritySnapshot ? ' bss-method-icon--active' : ''}`} aria-hidden="true">
            <AuthenticatorIcon />
          </div>
          <div className="bss-method-content">
            <div className="bss-method-title">Authenticator app</div>
            <div className="bss-method-desc">
              {authenticatorAppConfigured
                ? 'Authenticator app verification is active for this account.'
                : 'Required - set up an authenticator app to unlock the rest of Clausule.'}
            </div>
          </div>
          {authenticatorAppConfigured ? (
            <StatusPill ariaLabel="Authenticator app is active" label="Active" />
          ) : hasSecuritySnapshot ? (
            <Button
              type="button"
              variant="ghost"
              className="bss-method-action"
              onClick={onToggleTotp}
              aria-expanded={totpExpanded}
              aria-controls="totp-setup"
            >
              {totpExpanded ? 'Cancel' : 'Set up'}
            </Button>
          ) : (
            <span className="bss-method-loading" aria-busy="true">Loading authenticator status...</span>
          )}
        </div>

        {!authenticatorAppConfigured && hasSecuritySnapshot && totpExpanded && (
          <BragSecuritySetupPanel onDone={onTotpDone} onCancel={onToggleTotp} />
        )}

        {!authenticatorAppConfigured && hasSecuritySnapshot && (
          <div className={`bss-alert${mfaRestrictionEnabled ? ' bss-alert--required' : ''}`} role="alert">
            <span className="bss-alert-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <div className="bss-alert-copy">
              <div className="bss-alert-title">Authenticator setup required</div>
              <p className="bss-alert-desc">
                This keeps your account protected.{' '}
                <button type="button" className="bss-alert-link" onClick={onToggleTotp}>
                  Set it up now
                </button>{' '}
                to continue using the app.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
