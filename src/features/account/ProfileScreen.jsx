'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@shared/components/ui/Modal'
import BragRail from '@features/brag/components/BragRail'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { apiFetch, jsonRequest } from '@shared/utils/api'
import { validateEmail } from '@shared/utils/emailValidation'
import '@features/brag/styles/brag-shell.css'
import { cn } from '@shared/utils/cn'
import { bragSettingsUi, bragShell, profileUi } from '@features/brag/components/bragClasses'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  jobTitle: '',
  department: '',
}

function normalize(form) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim().toLowerCase(),
    mobile: form.mobile.trim(),
    jobTitle: form.jobTitle.trim(),
    department: form.department.trim(),
  }
}

function fieldClass(full = false) {
  return cn(profileUi.field, full && profileUi.fieldFull)
}

export default function ProfileScreen() {
  const router = useRouter()
  const { updateUser } = useAuth()
  const profile = useProfileStore((state) => state.profile)
  const security = useProfileStore((state) => state.security)
  const setProfile = useProfileStore((state) => state.setProfile)
  const [form, setForm] = useState(EMPTY_FORM)
  const [baseline, setBaseline] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [emailCodeState, setEmailCodeState] = useState('idle')
  const [mobileCheck, setMobileCheck] = useState('')
  const [mobileAck, setMobileAck] = useState(false)

  const resetVerification = () => {
    setConfirmOpen(false)
    setEmailCode('')
    setEmailCodeState('idle')
    setMobileCheck('')
    setMobileAck(false)
  }

  useEffect(() => {
    const next = {
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      mobile: profile.mobile ?? '',
      jobTitle: profile.jobTitle ?? '',
      department: profile.department ?? '',
    }

    setForm(next)
    setBaseline(next)
  }, [profile])

  const current = useMemo(() => normalize(form), [form])
  const initial = useMemo(() => normalize(baseline), [baseline])
  const changed = useMemo(
    () => Object.entries(current).filter(([key, value]) => value !== initial[key]).map(([key]) => key),
    [current, initial]
  )
  const emailChanged = changed.includes('email')
  const mobileChanged = changed.includes('mobile')
  const dirty = changed.length > 0
  const baseReady = current.firstName && validateEmail(current.email).valid && current.mobile
  const verificationReady = !emailChanged || (emailCodeState === 'sent' && emailCode.trim().length === 6)
  const mobileReady = !mobileChanged || (mobileCheck.trim() === current.mobile && mobileAck)
  const finalReady = baseReady && verificationReady && mobileReady
  const displayName = [current.firstName, current.lastName].filter(Boolean).join(' ').trim() || 'Your profile'
  const initials = ((current.firstName[0] ?? '') + (current.lastName[0] ?? '')).toUpperCase() || current.email?.[0]?.toUpperCase() || 'U'
  const ssoText = security.ssoConfigured ? 'Single sign-on active' : 'Passwordless or email sign-in'
  const emailWarning = emailChanged ? `We'll verify ${current.email} before saving.` : 'Your sign-in email stays unchanged.'

  useEffect(() => {
    if (!confirmOpen || !emailChanged || emailCodeState !== 'idle') return

    let active = true
    setEmailCodeState('sending')

    apiFetch('/api/auth/send-code', jsonRequest({ email: current.email }, { method: 'POST' }))
      .then(async (response) => {
        if (!active) return
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to send verification code')
        }
        setEmailCodeState('sent')
      })
      .catch((err) => {
        if (!active) return
        setEmailCodeState('error')
        setError(err.message || 'Failed to send verification code')
      })

    return () => {
      active = false
    }
  }, [confirmOpen, current.email, emailChanged, emailCodeState])

  const patchProfile = async ({ emailVerificationCode }) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiFetch('/api/auth/profile', jsonRequest({
        ...current,
        emailVerificationCode,
        mobileConfirmed: !mobileChanged || (mobileCheck.trim() === current.mobile && mobileAck),
        mobileConfirmation: mobileCheck.trim(),
      }, { method: 'PATCH' }))

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to save profile')

      setProfile(data.profile)
      updateUser({ email: data.user?.email ?? current.email })
      setBaseline(current)
      resetVerification()
      setSuccess('Profile saved')

      if (emailChanged) {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
      }

      router.refresh()
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (!dirty) return
    if (emailChanged || mobileChanged) {
      setError('')
      setConfirmOpen(true)
      return
    }
    void patchProfile({})
  }

  const submitConfirm = () => {
    if (emailChanged && emailCode.trim().length !== 6) {
      setError('Enter the 6-digit code we sent to the new email.')
      return
    }
    if (mobileChanged && !mobileReady) {
      setError('Confirm the new mobile number before saving.')
      return
    }
    void patchProfile({ emailVerificationCode: emailChanged ? emailCode.trim() : '' })
  }

  return (
    <div className={bragShell.page}>
      <BragRail activePage="profile" />
      <BragIdentitySidebar
        avatarInitials={initials}
        displayName={displayName}
        email={current.email}
        noteLabel="Profile"
        note="Keep the contact details tied to your account current. Email changes are verified before they go live."
        overviewLabel="Sign-in"
        status={ssoText}
        statusSub={current.mobile || 'Mobile not set'}
      />

      <main className={bragShell.main} aria-labelledby="profile-page-title">
        <div className={cn(bragShell.inner, profileUi.page)}>
          <h1 id="profile-page-title" className={bragSettingsUi.heading}>Personal details</h1>
          <p className={bragSettingsUi.subheading}>Manage the identity, contact, and work details connected to your account.</p>
          <div className={bragSettingsUi.divider} />

          <form className={profileUi.card} onSubmit={onSubmit}>
            <div className={profileUi.section}>
              <div className={profileUi.sectionTitle}>Identity</div>
              <div className={profileUi.fields}>
                <div className={fieldClass()}>
                  <label className={profileUi.label} htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    className={profileUi.input}
                    value={form.firstName}
                    autoComplete="given-name"
                    onChange={(event) => setForm((state) => ({ ...state, firstName: event.target.value }))}
                    required
                  />
                </div>
                <div className={fieldClass()}>
                  <label className={profileUi.label} htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    className={profileUi.input}
                    value={form.lastName}
                    autoComplete="family-name"
                    onChange={(event) => setForm((state) => ({ ...state, lastName: event.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className={profileUi.sectionSpacing}>
              <div className={profileUi.sectionTitle}>Contact</div>
              <div className={profileUi.fields}>
                <div className={fieldClass(true)}>
                  <label className={profileUi.label} htmlFor="email">Email</label>
                  <input
                    id="email"
                    className={profileUi.input}
                    type="email"
                    value={form.email}
                    autoComplete="email"
                    onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                    required
                  />
                  <p className={profileUi.help}>{emailWarning}</p>
                </div>
                <div className={fieldClass(true)}>
                  <label className={profileUi.label} htmlFor="mobile">Mobile</label>
                  <input
                    id="mobile"
                    className={profileUi.input}
                    type="tel"
                    value={form.mobile}
                    autoComplete="tel"
                    onChange={(event) => setForm((state) => ({ ...state, mobile: event.target.value }))}
                    required
                  />
                  <p className={profileUi.help}>Use the number you want tied to account recovery and contact updates.</p>
                </div>
              </div>
            </div>

            <div className={profileUi.sectionSpacing}>
              <div className={profileUi.sectionTitle}>Work profile</div>
              <div className={profileUi.fields}>
                <div className={fieldClass()}>
                  <label className={profileUi.label} htmlFor="jobTitle">Job title</label>
                  <input
                    id="jobTitle"
                    className={profileUi.input}
                    value={form.jobTitle}
                    autoComplete="organization-title"
                    onChange={(event) => setForm((state) => ({ ...state, jobTitle: event.target.value }))}
                  />
                </div>
                <div className={fieldClass()}>
                  <label className={profileUi.label} htmlFor="department">Department</label>
                  <input
                    id="department"
                    className={profileUi.input}
                    value={form.department}
                    autoComplete="organization"
                    onChange={(event) => setForm((state) => ({ ...state, department: event.target.value }))}
                  />
                </div>
              </div>
            </div>

            {error && <div className={cn(profileUi.alert, profileUi.alertError)} role="alert">{error}</div>}
            {success && <div className={cn(profileUi.alert, profileUi.alertSuccess)} role="status">{success}</div>}

            <div className={profileUi.actions}>
              <button type="button" className={cn(profileUi.btn, profileUi.btnGhost)} onClick={() => setForm(baseline)} disabled={!dirty || saving}>Reset</button>
              <button type="submit" className={cn(profileUi.btn, profileUi.btnPrimary)} disabled={!dirty || saving || !baseReady}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <Modal
          open={confirmOpen}
          onClose={resetVerification}
          title="Verify changes"
          footer={
            <>
              <button type="button" className={cn(profileUi.btn, profileUi.btnGhost)} onClick={resetVerification} disabled={saving}>Cancel</button>
              <button type="button" className={cn(profileUi.btn, profileUi.btnPrimary)} onClick={submitConfirm} disabled={saving || !finalReady}>Finalise</button>
            </>
          }
        >
          <div className={profileUi.modal}>
            <p className={profileUi.modalCopy}>
              We need a final check before saving contact changes.
            </p>

            <dl className={profileUi.changeList}>
              {emailChanged && (
                <>
                  <dt className={profileUi.changeTerm}>Email</dt>
                  <dd className={profileUi.changeDesc}>{initial.email || 'Not set'}{' -> '}{current.email}</dd>
                </>
              )}
              {mobileChanged && (
                <>
                  <dt className={profileUi.changeTerm}>Mobile</dt>
                  <dd className={profileUi.changeDesc}>{initial.mobile || 'Not set'}{' -> '}{current.mobile}</dd>
                </>
              )}
            </dl>

            {emailChanged && (
              <div className={profileUi.verify}>
                <div className={profileUi.verifyTitle}>Email verification</div>
                <div className={profileUi.verifyCopy}>
                  A code was sent to {current.email}. Enter it here to confirm the new sign-in email.
                </div>
                <input
                  className={profileUi.input}
                  inputMode="numeric"
                  value={emailCode}
                  onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                />
                <div className={profileUi.verifyMeta}>
                  {emailCodeState === 'sending' && 'Sending code...'}
                  {emailCodeState === 'sent' && 'Code sent'}
                  {emailCodeState === 'error' && 'Code delivery failed'}
                </div>
              </div>
            )}

            {mobileChanged && (
              <div className={cn(profileUi.warning, !security.ssoConfigured && profileUi.warningStrong)}>
                <div className={profileUi.warningTitle}>Mobile change warning</div>
                <p className={profileUi.warningCopy}>
                  {security.ssoConfigured
                    ? 'You sign in with SSO, so this should not interrupt your 2FA setup.'
                    : 'This can affect your 2FA and recovery path if you did not sign in with SSO.'}
                </p>
                <label className={profileUi.check}>
                  <input type="checkbox" checked={mobileAck} onChange={(event) => setMobileAck(event.target.checked)} />
                  I understand and want to continue
                </label>
                <input
                  className={profileUi.input}
                  value={mobileCheck}
                  onChange={(event) => setMobileCheck(event.target.value)}
                  placeholder="Re-enter the new mobile number"
                />
              </div>
            )}
          </div>
        </Modal>
      </main>
    </div>
  )
}
