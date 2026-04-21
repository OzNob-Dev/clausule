'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@shared/components/ui/Button'
import { Modal } from '@shared/components/ui/Modal'
import BragRail from '@features/brag/components/BragRail'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { apiFetch, jsonRequest } from '@shared/utils/api'
import { validateEmail } from '@shared/utils/emailValidation'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-settings-core.css'
import '@features/account/styles/profile.css'

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
  return `profile-field${full ? ' profile-field--full' : ''}`
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
    <div className="be-page">
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

      <main className="be-main" aria-labelledby="profile-page-title">
        <div className="be-inner profile-page">
          <h1 id="profile-page-title" className="bss-heading">Personal details</h1>
          <p className="bss-subheading">Manage the identity, contact, and work details connected to your account.</p>
          <div className="bss-divider" />

          <form className="profile-card" onSubmit={onSubmit}>
            <div className="profile-section">
              <div className="profile-section-title">Identity</div>
              <div className="profile-fields">
                <div className={fieldClass()}>
                  <label className="profile-label" htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    className="profile-input"
                    value={form.firstName}
                    autoComplete="given-name"
                    onChange={(event) => setForm((state) => ({ ...state, firstName: event.target.value }))}
                    required
                  />
                </div>
                <div className={fieldClass()}>
                  <label className="profile-label" htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    className="profile-input"
                    value={form.lastName}
                    autoComplete="family-name"
                    onChange={(event) => setForm((state) => ({ ...state, lastName: event.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-section-title">Contact</div>
              <div className="profile-fields">
                <div className={fieldClass(true)}>
                  <label className="profile-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    className="profile-input"
                    type="email"
                    value={form.email}
                    autoComplete="email"
                    onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                    required
                  />
                  <p className="profile-help">{emailWarning}</p>
                </div>
                <div className={fieldClass(true)}>
                  <label className="profile-label" htmlFor="mobile">Mobile</label>
                  <input
                    id="mobile"
                    className="profile-input"
                    type="tel"
                    value={form.mobile}
                    autoComplete="tel"
                    onChange={(event) => setForm((state) => ({ ...state, mobile: event.target.value }))}
                    required
                  />
                  <p className="profile-help">Use the number you want tied to account recovery and contact updates.</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-section-title">Work profile</div>
              <div className="profile-fields">
                <div className={fieldClass()}>
                  <label className="profile-label" htmlFor="jobTitle">Job title</label>
                  <input
                    id="jobTitle"
                    className="profile-input"
                    value={form.jobTitle}
                    autoComplete="organization-title"
                    onChange={(event) => setForm((state) => ({ ...state, jobTitle: event.target.value }))}
                  />
                </div>
                <div className={fieldClass()}>
                  <label className="profile-label" htmlFor="department">Department</label>
                  <input
                    id="department"
                    className="profile-input"
                    value={form.department}
                    autoComplete="organization"
                    onChange={(event) => setForm((state) => ({ ...state, department: event.target.value }))}
                  />
                </div>
              </div>
            </div>

            {error && <div className="profile-alert profile-alert--error" role="alert">{error}</div>}
            {success && <div className="profile-alert profile-alert--success" role="status">{success}</div>}

            <div className="profile-actions">
              <Button type="button" variant="ghost" onClick={() => setForm(baseline)} disabled={!dirty || saving}>Reset</Button>
              <Button type="submit" variant="primary" disabled={!dirty || saving || !baseReady}>{saving ? 'Saving...' : 'Save changes'}</Button>
            </div>
          </form>
        </div>

        <Modal
          open={confirmOpen}
          onClose={resetVerification}
          title="Verify changes"
          footer={
            <>
              <Button type="button" variant="ghost" onClick={resetVerification} disabled={saving}>Cancel</Button>
              <Button type="button" variant="primary" onClick={submitConfirm} disabled={saving || !finalReady}>Finalise</Button>
            </>
          }
        >
          <div className="profile-modal">
            <p className="profile-modal-copy">
              We need a final check before saving contact changes.
            </p>

            <dl className="profile-change-list">
              {emailChanged && (
                <>
                  <dt>Email</dt>
                  <dd>{initial.email || 'Not set'}{' -> '}{current.email}</dd>
                </>
              )}
              {mobileChanged && (
                <>
                  <dt>Mobile</dt>
                  <dd>{initial.mobile || 'Not set'}{' -> '}{current.mobile}</dd>
                </>
              )}
            </dl>

            {emailChanged && (
              <div className="profile-verify">
                <div className="profile-verify-title">Email verification</div>
                <div className="profile-verify-copy">
                  A code was sent to {current.email}. Enter it here to confirm the new sign-in email.
                </div>
                <input
                  className="profile-input"
                  inputMode="numeric"
                  value={emailCode}
                  onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                />
                <div className="profile-verify-meta">
                  {emailCodeState === 'sending' && 'Sending code...'}
                  {emailCodeState === 'sent' && 'Code sent'}
                  {emailCodeState === 'error' && 'Code delivery failed'}
                </div>
              </div>
            )}

            {mobileChanged && (
              <div className={`profile-warning${security.ssoConfigured ? '' : ' profile-warning--strong'}`}>
                <div className="profile-warning-title">Mobile change warning</div>
                <p>
                  {security.ssoConfigured
                    ? 'You sign in with SSO, so this should not interrupt your 2FA setup.'
                    : 'This can affect your 2FA and recovery path if you did not sign in with SSO.'}
                </p>
                <label className="profile-check">
                  <input type="checkbox" checked={mobileAck} onChange={(event) => setMobileAck(event.target.checked)} />
                  I understand and want to continue
                </label>
                <input
                  className="profile-input"
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
