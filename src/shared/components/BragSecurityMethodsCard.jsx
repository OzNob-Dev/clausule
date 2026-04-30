'use client'
import './BragSecurityMethodsCard.css'

import { Button } from '@shared/components/ui/Button'
import { SectionCard } from '@shared/components/ui/SectionCard'
import BragSecuritySetupPanel from '@shared/components/BragSecuritySetupPanel'
import { TimerIcon } from '@shared/components/ui/icon/TimerIcon'
import { MailIcon } from '@shared/components/ui/icon/MailIcon'
import { DeviceLockIcon } from '@shared/components/ui/icon/DeviceLockIcon'

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
      <SectionCard
        titleClassName="bss-card-head-title"
        metaClassName="bss-card-head-meta"
        title="Sign-in protection"
        meta="2FA methods"
      >

        <div className="bss-method-row">
          <div className="bss-method-icon" aria-hidden="true">
            <MailIcon />
          </div>
          <div className="bss-method-content">
            <div className="bss-method-title">Email code</div>
            <div className="bss-method-desc">A one-time code sent to your email address each time you sign in.</div>
          </div>
          <StatusPill ariaLabel="Email code is active" label="Active" />
        </div>

        <div className="bss-method-row">
          <div className={`bss-method-icon${authenticatorAppConfigured || hasSecuritySnapshot ? ' bss-method-icon--active' : ''}`} aria-hidden="true">
            <DeviceLockIcon size={24} />
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
              variant="primary"
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
              <TimerIcon />
            </span>
            <div className="bss-alert-copy">
              <div className="bss-alert-title">Authenticator setup required</div>
              <p className="bss-alert-desc">
                This keeps your account protected.{' '}
                <button type="button" As="link" className="alert-link" onClick={onToggleTotp}>
                  Set it up now
                </button>{' '}
                to continue using the app.
              </p>
            </div>
          </div>
        )}
      </SectionCard>
    </section>
  )
}
