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
import '@features/brag/styles/brag-settings-totp.css'
import { cn } from '@shared/utils/cn'
import { bragSettingsUi, bragShell } from '@features/brag/components/bragClasses'

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
  const setProfile = useProfileStore((state) => state.setProfile)
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

    apiFetch('/api/auth/profile', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const profileData = {
          firstName: typeof data?.firstName === 'string' ? data.firstName : undefined,
          lastName: typeof data?.lastName === 'string' ? data.lastName : undefined,
          email: typeof data?.email === 'string' ? data.email : undefined,
          mobile: typeof data?.mobile === 'string' ? data.mobile : undefined,
          jobTitle: typeof data?.jobTitle === 'string' ? data.jobTitle : undefined,
          department: typeof data?.department === 'string' ? data.department : undefined,
        }

        if (Object.values(profileData).some((value) => value !== undefined)) setProfile(profileData)
      })
      .catch(() => {})

    apiFetch('/api/auth/totp/status', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (typeof data?.configured === 'boolean') setSecurity({ authenticatorAppConfigured: data.configured })
      })
      .catch(() => {})

    return () => controller.abort()
  }, [setProfile, setSecurity])

  const displayName = profileDisplayName(profile)

  const avatarInitials =
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <div className={bragShell.page}>
      <BragRail activePage="settings" />

      <BragSettingsIdentity avatarInitials={avatarInitials} displayName={displayName} email={profile.email} />

      <main className={bragShell.main} aria-labelledby="brag-settings-title">
        <div className={bragShell.inner}>
          <h1 id="brag-settings-title" className={bragSettingsUi.heading}>Security settings</h1>
          <p className={bragSettingsUi.subheading}>Manage how you sign in to Clausule.</p>
          <div className={bragSettingsUi.divider} />

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

          <section aria-labelledby="bss-reminders-title">
            <div className={bragSettingsUi.sectionLabel} id="bss-reminders-title">Reminder preferences</div>
            <div className={bragSettingsUi.card}>
              <div className={bragSettingsUi.remindersHead}>
                <div>
                  <div className={bragSettingsUi.remindersTitle}>Delivery and frequency</div>
                  <div className={bragSettingsUi.remindersDesc}>Choose where reminders arrive and how often they repeat.</div>
                </div>
                <div className={bragSettingsUi.remindersSummary} aria-live="polite">
                  {reminderMethod.toUpperCase()} · {reminderFrequency}
                </div>
              </div>

              <fieldset className={bragSettingsUi.reminderGroup}>
                <legend className={bragSettingsUi.reminderLegend}>Delivery method</legend>
                <div className={bragSettingsUi.reminderGrid}>
                  {reminderMethods.map(({ value, label, desc }) => (
                    <label key={value} className={cn(bragSettingsUi.reminderOption, reminderMethod === value && bragSettingsUi.reminderOptionActive)}>
                      <input
                        className={bragSettingsUi.reminderInput}
                        type="radio"
                        name="reminder-method"
                        value={value}
                        checked={reminderMethod === value}
                        onChange={() => setReminderMethod(value)}
                      />
                      <span className={bragSettingsUi.reminderOptionBody}>
                        <span className={bragSettingsUi.reminderOptionTitle}>{label}</span>
                        <span className={bragSettingsUi.reminderOptionDesc}>{desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className={bragSettingsUi.reminderGroup}>
                <legend className={bragSettingsUi.reminderLegend}>Reminder frequency</legend>
                <div className={bragSettingsUi.frequencyGrid}>
                  {reminderFrequencies.map(({ value, label }) => (
                    <label key={value} className={cn(bragSettingsUi.frequencyOption, reminderFrequency === value && bragSettingsUi.frequencyOptionActive)}>
                      <input
                        className={bragSettingsUi.reminderInput}
                        type="radio"
                        name="reminder-frequency"
                        value={value}
                        checked={reminderFrequency === value}
                        onChange={() => setReminderFrequency(value)}
                      />
                      <span className={bragSettingsUi.frequencyText}>{label}</span>
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
