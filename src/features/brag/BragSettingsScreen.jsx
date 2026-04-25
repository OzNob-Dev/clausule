'use client'

import { useState } from 'react'
import BragRail from '@features/brag/components/BragRail'
import BragSettingsDangerZone from '@features/brag/components/BragSettingsDangerZone'
import BragSettingsIdentity from '@features/brag/components/BragSettingsIdentity'
import DeleteAccountModal from '@features/brag/components/DeleteAccountModal'
import MfaSecuritySection from '@features/brag/components/MfaSecuritySection'
import SsoStatusSection from '@features/brag/components/SsoStatusSection'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { useProfileQuery, useTotpStatusQuery } from '@shared/queries/useProfileQuery'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import { REMINDER_METHODS, REMINDER_FREQUENCIES } from '@shared/constants/reminders'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-settings-core.css'
import '@features/brag/styles/brag-settings-totp.css'

export default function BragSettings() {
  const profile = useProfileStore((state) => state.profile)
  const setProfile = useProfileStore((state) => state.setProfile)
  const setSecurity = useProfileStore((state) => state.setSecurity)
  const authenticatorAppConfigured = useProfileStore((state) => state.security.authenticatorAppConfigured)
  const ssoConfigured = useProfileStore((state) => state.security.ssoConfigured)
  const hasSecuritySnapshot = useProfileStore((state) => state.hasSecuritySnapshot)
  const showMfaSection = !ssoConfigured
  const mfaRestrictionEnabled = showMfaSection && hasSecuritySnapshot && !authenticatorAppConfigured

  const [totpExpanded, setTotpExpanded]           = useState(false)
  const [reminderMethod, setReminderMethod]         = useState('email')
  const [reminderFrequency, setReminderFrequency]   = useState('weekly')
  const [deleteModal, setDeleteModal]               = useState(false)

  useProfileQuery({
    onSuccess: (data) => {
      const profileData = {
        firstName:  typeof data?.firstName  === 'string' ? data.firstName  : undefined,
        lastName:   typeof data?.lastName   === 'string' ? data.lastName   : undefined,
        email:      typeof data?.email      === 'string' ? data.email      : undefined,
        mobile:     typeof data?.mobile     === 'string' ? data.mobile     : undefined,
        jobTitle:   typeof data?.jobTitle   === 'string' ? data.jobTitle   : undefined,
        department: typeof data?.department === 'string' ? data.department : undefined,
      }
      if (Object.values(profileData).some((v) => v !== undefined)) setProfile(profileData)
    },
  })

  useTotpStatusQuery({
    onSuccess: (data) => {
      if (typeof data?.configured === 'boolean') {
        setSecurity({ authenticatorAppConfigured: data.configured })
      }
    },
  })

  const handleTotpDone = () => {
    setSecurity({ authenticatorAppConfigured: true })
    setTotpExpanded(false)
  }

  const displayName    = profileDisplayName(profile)
  const avatarInitials = profileInitials(profile)

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
                  {REMINDER_METHODS.map(({ value, label, desc }) => (
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
                  {REMINDER_FREQUENCIES.map(({ value, label }) => (
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
