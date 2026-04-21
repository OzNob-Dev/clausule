'use client'

import { useEffect, useState } from 'react'
import BragRail from '@features/brag/components/BragRail'
import BragSettingsDangerZone from '@features/brag/components/BragSettingsDangerZone'
import BragSettingsIdentity from '@features/brag/components/BragSettingsIdentity'
import DeleteAccountModal from '@features/brag/components/DeleteAccountModal'
import MfaSecuritySection from '@features/brag/components/MfaSecuritySection'
import SsoStatusSection from '@features/brag/components/SsoStatusSection'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { apiFetch } from '@shared/utils/api'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-settings-core.css'
import '@features/brag/styles/brag-settings-totp.css'

const reminderMethods = [
  { value: 'email', label: 'Email', desc: 'Send reminders to the inbox tied to this account.' },
  { value: 'sms', label: 'SMS', desc: 'Send reminders by text message to the mobile number on file.' },
]

const reminderFrequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

function profileDisplayName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || 'Your profile'
}

export default function BragSettings() {
  const profile = useProfileStore((state) => state.profile)
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const setSecurity = useProfileStore((state) => state.setSecurity)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const showMfaSection = !ssoConfigured
  const mfaRestrictionEnabled = showMfaSection && hasSecuritySnapshot && !authenticatorAppConfigured

  const [totpExpanded, setTotpExpanded]     = useState(false)
  const [reminderMethod, setReminderMethod] = useState('email')
  const [reminderFrequency, setReminderFrequency] = useState('weekly')

  const [deleteModal, setDeleteModal] = useState(false)

  const handleTotpDone = () => {
    setSecurity({ authenticatorAppConfigured: true })
    setTotpExpanded(false)
  }

  useEffect(() => {
    const controller = new AbortController()

    apiFetch('/api/auth/totp/status', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (typeof data?.configured === 'boolean') setSecurity({ authenticatorAppConfigured: data.configured })
      })
      .catch(() => {})

    return () => controller.abort()
  }, [setSecurity])

  const displayName = profileDisplayName(profile)

  const avatarInitials =
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <div className="be-page">
      <BragRail activePage="settings" />

      <BragSettingsIdentity avatarInitials={avatarInitials} displayName={displayName} email={profile.email} />

      <main className="be-main" aria-labelledby="brag-settings-title">
        <div className="be-inner">
          <h1 id="brag-settings-title" className="bss-heading">Security settings</h1>
          <p className="bss-subheading">Manage how you sign in to Clausule.</p>
          <div className="bss-divider" />

          {ssoConfigured && (
            <SsoStatusSection
              avatarInitials={avatarInitials}
              displayName={displayName}
              email={profile.email}
            />
          )}

          {showMfaSection && (
            <MfaSecuritySection
              authenticatorAppConfigured={authenticatorAppConfigured}
              hasSecuritySnapshot={hasSecuritySnapshot}
              mfaRestrictionEnabled={mfaRestrictionEnabled}
              totpExpanded={totpExpanded}
              onTotpDone={handleTotpDone}
              onToggleTotp={() => setTotpExpanded((v) => !v)}
            />
          )}

          <section className="bss-reminders" aria-labelledby="bss-reminders-title">
            <div className="bss-section-label" id="bss-reminders-title">Reminder preferences</div>
            <div className="bss-card bss-reminder-card">
              <div className="bss-reminder-head">
                <div>
                  <div className="bss-reminder-title">Delivery and frequency</div>
                  <div className="bss-reminder-desc">Choose where reminders arrive and how often they repeat.</div>
                </div>
                <div className="bss-reminder-summary" aria-live="polite">
                  {reminderMethod.toUpperCase()} · {reminderFrequency}
                </div>
              </div>

              <fieldset className="bss-reminder-group">
                <legend className="bss-reminder-legend">Delivery method</legend>
                <div className="bss-reminder-grid">
                  {reminderMethods.map(({ value, label, desc }) => (
                    <label key={value} className={`bss-reminder-option${reminderMethod === value ? ' bss-reminder-option--active' : ''}`}>
                      <input
                        className="bss-reminder-input"
                        type="radio"
                        name="reminder-method"
                        value={value}
                        checked={reminderMethod === value}
                        onChange={() => setReminderMethod(value)}
                      />
                      <span className="bss-reminder-option-body">
                        <span className="bss-reminder-option-title">{label}</span>
                        <span className="bss-reminder-option-desc">{desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="bss-reminder-group">
                <legend className="bss-reminder-legend">Reminder frequency</legend>
                <div className="bss-frequency-grid">
                  {reminderFrequencies.map(({ value, label }) => (
                    <label key={value} className={`bss-frequency-option${reminderFrequency === value ? ' bss-frequency-option--active' : ''}`}>
                      <input
                        className="bss-reminder-input"
                        type="radio"
                        name="reminder-frequency"
                        value={value}
                        checked={reminderFrequency === value}
                        onChange={() => setReminderFrequency(value)}
                      />
                      <span className="bss-frequency-text">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>

          <BragSettingsDangerZone onDelete={() => setDeleteModal(true)} />
        </div>
      </main>

      <DeleteAccountModal open={deleteModal} onClose={() => setDeleteModal(false)} />
    </div>
  )
}
