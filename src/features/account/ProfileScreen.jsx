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
import { cn } from '@shared/utils/cn'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  jobTitle: '',
  department: '',
}

// Layout
const pageClass = 'flex w-full min-h-screen bg-[var(--canvas)]'
const mainClass = 'flex-1 min-w-0 overflow-y-auto bg-[#F5F0EA]'
const innerClass = 'max-w-[640px] mx-auto px-8 pt-11 pb-24'

// Typography (from brag-settings-core)
const headingClass = 'text-[22px] font-black tracking-[-0.5px] text-[#2A221A] mb-1.5'
const subheadingClass = 'text-[13px] text-tm mb-7'
const dividerClass = 'h-px bg-gradient-to-r from-[#C94F2A] via-[#F8D37B] to-[rgba(60,45,35,0.08)] mb-6'

// Card & sections
const cardClass = 'bg-[#FAF7F3] border border-[rgba(60,45,35,0.1)] rounded-[var(--r2)] px-[22px] py-[18px]'
const sectionClass = '[&+&]:mt-5 [&+&]:pt-5 [&+&]:border-t [&+&]:border-[rgba(60,45,35,0.1)]'
const sectionTitleClass = 'text-[9px] font-bold uppercase tracking-[0.8px] text-tm mb-3'
const fieldsClass = 'grid grid-cols-2 gap-[14px] max-[680px]:grid-cols-1'

// Form
const labelClass = 'block text-xs font-bold text-[#2A221A] mb-1.5'
const inputClass = 'block box-border min-w-0 w-full min-h-[42px] px-3 py-2.5 rounded-[var(--r)] border-[1.5px] border-[rgba(60,45,35,0.12)] bg-transparent text-[#2A221A] font-[inherit] focus-visible:outline-none focus-visible:border-[#2A221A] focus-visible:shadow-[0_0_0_3px_rgba(60,45,35,0.08)]'
const helpClass = 'text-xs leading-relaxed text-tm mt-2'

// Alerts
const alertClass = 'mt-4 rounded-[14px] px-[14px] py-3 text-xs leading-[1.55]'
const alertErrorClass = 'bg-[rgba(184,50,50,0.08)] text-[#9e2d2d]'
const alertSuccessClass = 'bg-[rgba(53,121,73,0.08)] text-[#2f6f43]'

// Buttons
const btnClass = 'rounded-[var(--r)] px-4 py-[11px] font-sans text-[13px] font-bold transition-[background-color,border-color,opacity,color] duration-150 cursor-pointer disabled:cursor-default disabled:opacity-45'
const btnGhostClass = 'border-[1.5px] border-[rgba(60,45,35,0.14)] bg-transparent text-tm hover:enabled:border-[rgba(60,45,35,0.24)] hover:enabled:text-tp'
const btnPrimaryClass = 'border-none bg-acc text-[#FAF7F3] hover:enabled:opacity-90'
const actionsClass = 'mt-5 pt-[18px] border-t border-[rgba(60,45,35,0.1)] flex justify-end gap-2.5 max-[680px]:flex-col-reverse'
const actionsBtnClass = 'max-[680px]:w-full'

// Modal
const modalClass = 'grid gap-4'
const modalCopyClass = 'text-xs leading-relaxed text-tm'
const changeListClass = 'grid grid-cols-[auto_1fr] gap-x-[14px] gap-y-2 m-0 p-[14px] rounded-2xl bg-[rgba(60,45,35,0.04)] max-[680px]:grid-cols-1'
const changeListDtClass = 'text-[11px] font-extrabold uppercase tracking-[0.14em] text-tm'
const changeListDdClass = 'm-0 text-xs font-bold text-tp text-right max-[680px]:text-left'
const verifyClass = 'grid gap-2.5'
const verifyTitleClass = 'text-[13px] font-extrabold text-tp'
const verifyMetaClass = 'min-h-[18px] text-xs leading-relaxed text-tm'
const warningBaseClass = 'grid gap-2.5 p-[14px] rounded-2xl'
const warningTitleClass = 'text-[13px] font-extrabold text-tp'
const checkClass = 'flex items-center gap-2.5 text-xs font-bold text-tp'

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

function getFieldClass(full = false) {
  return cn('min-w-0', full && 'col-span-full')
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
    <div className={pageClass}>
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

      <main className={mainClass} aria-labelledby="profile-page-title">
        <div className={innerClass}>
          <h1 id="profile-page-title" className={headingClass}>Personal details</h1>
          <p className={subheadingClass}>Manage the identity, contact, and work details connected to your account.</p>
          <div className={dividerClass} />

          <form className={cardClass} onSubmit={onSubmit}>
            <div className={sectionClass}>
              <div className={sectionTitleClass}>Identity</div>
              <div className={fieldsClass}>
                <div className={getFieldClass()}>
                  <label className={labelClass} htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    className={inputClass}
                    value={form.firstName}
                    autoComplete="given-name"
                    onChange={(event) => setForm((state) => ({ ...state, firstName: event.target.value }))}
                    required
                  />
                </div>
                <div className={getFieldClass()}>
                  <label className={labelClass} htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    className={inputClass}
                    value={form.lastName}
                    autoComplete="family-name"
                    onChange={(event) => setForm((state) => ({ ...state, lastName: event.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <div className={sectionTitleClass}>Contact</div>
              <div className={fieldsClass}>
                <div className={getFieldClass(true)}>
                  <label className={labelClass} htmlFor="email">Email</label>
                  <input
                    id="email"
                    className={inputClass}
                    type="email"
                    value={form.email}
                    autoComplete="email"
                    onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                    required
                  />
                  <p className={helpClass}>{emailWarning}</p>
                </div>
                <div className={getFieldClass(true)}>
                  <label className={labelClass} htmlFor="mobile">Mobile</label>
                  <input
                    id="mobile"
                    className={inputClass}
                    type="tel"
                    value={form.mobile}
                    autoComplete="tel"
                    onChange={(event) => setForm((state) => ({ ...state, mobile: event.target.value }))}
                    required
                  />
                  <p className={helpClass}>Use the number you want tied to account recovery and contact updates.</p>
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <div className={sectionTitleClass}>Work profile</div>
              <div className={fieldsClass}>
                <div className={getFieldClass()}>
                  <label className={labelClass} htmlFor="jobTitle">Job title</label>
                  <input
                    id="jobTitle"
                    className={inputClass}
                    value={form.jobTitle}
                    autoComplete="organization-title"
                    onChange={(event) => setForm((state) => ({ ...state, jobTitle: event.target.value }))}
                  />
                </div>
                <div className={getFieldClass()}>
                  <label className={labelClass} htmlFor="department">Department</label>
                  <input
                    id="department"
                    className={inputClass}
                    value={form.department}
                    autoComplete="organization"
                    onChange={(event) => setForm((state) => ({ ...state, department: event.target.value }))}
                  />
                </div>
              </div>
            </div>

            {error && <div className={cn(alertClass, alertErrorClass)} role="alert">{error}</div>}
            {success && <div className={cn(alertClass, alertSuccessClass)} role="status">{success}</div>}

            <div className={actionsClass}>
              <button type="button" className={cn(btnClass, btnGhostClass, actionsBtnClass)} onClick={() => setForm(baseline)} disabled={!dirty || saving}>Reset</button>
              <button type="submit" className={cn(btnClass, btnPrimaryClass, actionsBtnClass)} disabled={!dirty || saving || !baseReady}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <Modal
          open={confirmOpen}
          onClose={resetVerification}
          title="Verify changes"
          footer={
            <>
              <button type="button" className={cn(btnClass, btnGhostClass)} onClick={resetVerification} disabled={saving}>Cancel</button>
              <button type="button" className={cn(btnClass, btnPrimaryClass)} onClick={submitConfirm} disabled={saving || !finalReady}>Finalise</button>
            </>
          }
        >
          <div className={modalClass}>
            <p className={modalCopyClass}>
              We need a final check before saving contact changes.
            </p>

            <dl className={changeListClass}>
              {emailChanged && (
                <>
                  <dt className={changeListDtClass}>Email</dt>
                  <dd className={changeListDdClass}>{initial.email || 'Not set'}{' -> '}{current.email}</dd>
                </>
              )}
              {mobileChanged && (
                <>
                  <dt className={changeListDtClass}>Mobile</dt>
                  <dd className={changeListDdClass}>{initial.mobile || 'Not set'}{' -> '}{current.mobile}</dd>
                </>
              )}
            </dl>

            {emailChanged && (
              <div className={verifyClass}>
                <div className={verifyTitleClass}>Email verification</div>
                <div className={modalCopyClass}>
                  A code was sent to {current.email}. Enter it here to confirm the new sign-in email.
                </div>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={emailCode}
                  onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                />
                <div className={verifyMetaClass}>
                  {emailCodeState === 'sending' && 'Sending code...'}
                  {emailCodeState === 'sent' && 'Code sent'}
                  {emailCodeState === 'error' && 'Code delivery failed'}
                </div>
              </div>
            )}

            {mobileChanged && (
              <div className={cn(warningBaseClass, security.ssoConfigured ? 'bg-[rgba(200,83,42,0.07)]' : 'bg-[rgba(184,50,50,0.1)]')}>
                <div className={warningTitleClass}>Mobile change warning</div>
                <p className="m-0 text-xs leading-relaxed text-tp">
                  {security.ssoConfigured
                    ? 'You sign in with SSO, so this should not interrupt your 2FA setup.'
                    : 'This can affect your 2FA and recovery path if you did not sign in with SSO.'}
                </p>
                <label className={checkClass}>
                  <input type="checkbox" className="w-4 h-4" checked={mobileAck} onChange={(event) => setMobileAck(event.target.checked)} />
                  I understand and want to continue
                </label>
                <input
                  className={inputClass}
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
