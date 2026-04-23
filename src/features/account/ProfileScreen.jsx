'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@shared/components/ui/Modal'
import BragRail from '@features/brag/components/BragRail'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import { useAuth } from '@features/auth/context/AuthContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { apiFetch, jsonRequest } from '@shared/utils/api'
import { cn } from '@shared/utils/cn'
import { validateEmail } from '@shared/utils/emailValidation'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-settings-core.css'

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
  return cn('min-w-0', full && 'col-span-full')
}

const inputClass = 'block min-w-0 w-full box-border min-h-[42px] rounded-[var(--r)] border-[1.5px] border-[rgba(60,45,35,0.12)] bg-transparent px-3 py-[10px] font-inherit text-[#2A221A]'
const inputFocusClass = 'outline-none focus-visible:border-[#2A221A] focus-visible:shadow-[0_0_0_3px_rgba(60,45,35,0.08)]'
const copyClass = 'text-xs leading-[1.6] text-tm'
const buttonBaseClass = 'cursor-pointer rounded-[var(--r)] px-4 py-[11px] font-sans text-[13px] font-bold transition-[background-color,border-color,opacity,color] duration-150 disabled:cursor-default disabled:opacity-45'
const ghostButtonClass = `${buttonBaseClass} border-[1.5px] border-[rgba(60,45,35,0.14)] bg-transparent text-tm hover:border-[rgba(60,45,35,0.24)] hover:text-tp disabled:hover:border-[rgba(60,45,35,0.14)] disabled:hover:text-tm`
const primaryButtonClass = `${buttonBaseClass} border-0 bg-acc text-[#FAF7F3] hover:opacity-90 disabled:hover:opacity-45`

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
        <div className="be-inner max-w-[640px]">
          <h1 id="profile-page-title" className="bss-heading">Personal details</h1>
          <p className="bss-subheading">Manage the identity, contact, and work details connected to your account.</p>
          <div className="bss-divider" />

          <form className="rounded-[var(--r2)] border border-[rgba(60,45,35,0.1)] bg-card px-[22px] py-[18px] max-[680px]:p-[18px]" onSubmit={onSubmit}>
            <div>
              <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.8px] text-tm">Identity</div>
              <div className="grid grid-cols-2 gap-[14px] max-[680px]:grid-cols-1">
                <div className={fieldClass()}>
                  <label className="mb-1.5 block text-xs font-bold text-[#2A221A]" htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    className={`${inputClass} ${inputFocusClass}`}
                    value={form.firstName}
                    autoComplete="given-name"
                    onChange={(event) => setForm((state) => ({ ...state, firstName: event.target.value }))}
                    required
                  />
                </div>
                <div className={fieldClass()}>
                  <label className="mb-1.5 block text-xs font-bold text-[#2A221A]" htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    className={`${inputClass} ${inputFocusClass}`}
                    value={form.lastName}
                    autoComplete="family-name"
                    onChange={(event) => setForm((state) => ({ ...state, lastName: event.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-[rgba(60,45,35,0.1)] pt-5">
              <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.8px] text-tm">Contact</div>
              <div className="grid grid-cols-2 gap-[14px] max-[680px]:grid-cols-1">
                <div className={fieldClass(true)}>
                  <label className="mb-1.5 block text-xs font-bold text-[#2A221A]" htmlFor="email">Email</label>
                  <input
                    id="email"
                    className={`${inputClass} ${inputFocusClass}`}
                    type="email"
                    value={form.email}
                    autoComplete="email"
                    onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                    required
                  />
                  <p className="mt-2 text-xs leading-[1.6] text-tm">{emailWarning}</p>
                </div>
                <div className={fieldClass(true)}>
                  <label className="mb-1.5 block text-xs font-bold text-[#2A221A]" htmlFor="mobile">Mobile</label>
                  <input
                    id="mobile"
                    className={`${inputClass} ${inputFocusClass}`}
                    type="tel"
                    value={form.mobile}
                    autoComplete="tel"
                    onChange={(event) => setForm((state) => ({ ...state, mobile: event.target.value }))}
                    required
                  />
                  <p className="mt-2 text-xs leading-[1.6] text-tm">Use the number you want tied to account recovery and contact updates.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-[rgba(60,45,35,0.1)] pt-5">
              <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.8px] text-tm">Work profile</div>
              <div className="grid grid-cols-2 gap-[14px] max-[680px]:grid-cols-1">
                <div className={fieldClass()}>
                  <label className="mb-1.5 block text-xs font-bold text-[#2A221A]" htmlFor="jobTitle">Job title</label>
                  <input
                    id="jobTitle"
                    className={`${inputClass} ${inputFocusClass}`}
                    value={form.jobTitle}
                    autoComplete="organization-title"
                    onChange={(event) => setForm((state) => ({ ...state, jobTitle: event.target.value }))}
                  />
                </div>
                <div className={fieldClass()}>
                  <label className="mb-1.5 block text-xs font-bold text-[#2A221A]" htmlFor="department">Department</label>
                  <input
                    id="department"
                    className={`${inputClass} ${inputFocusClass}`}
                    value={form.department}
                    autoComplete="organization"
                    onChange={(event) => setForm((state) => ({ ...state, department: event.target.value }))}
                  />
                </div>
              </div>
            </div>

            {error && <div className="mt-4 rounded-[14px] bg-[rgba(184,50,50,0.08)] px-[14px] py-3 text-xs leading-[1.55] text-[#9e2d2d]" role="alert">{error}</div>}
            {success && <div className="mt-4 rounded-[14px] bg-[rgba(53,121,73,0.08)] px-[14px] py-3 text-xs leading-[1.55] text-[#2f6f43]" role="status">{success}</div>}

            <div className="mt-5 flex justify-end gap-2.5 border-t border-[rgba(60,45,35,0.1)] pt-[18px] max-[680px]:flex-col-reverse">
              <button type="button" className={ghostButtonClass} onClick={() => setForm(baseline)} disabled={!dirty || saving}>Reset</button>
              <button type="submit" className={primaryButtonClass} disabled={!dirty || saving || !baseReady}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <Modal
          open={confirmOpen}
          onClose={resetVerification}
          title="Verify changes"
          footer={
            <>
              <button type="button" className={ghostButtonClass} onClick={resetVerification} disabled={saving}>Cancel</button>
              <button type="button" className={primaryButtonClass} onClick={submitConfirm} disabled={saving || !finalReady}>Finalise</button>
            </>
          }
        >
          <div className="grid gap-4">
            <p className={copyClass}>
              We need a final check before saving contact changes.
            </p>

            <dl className="grid grid-cols-[auto_1fr] gap-x-[14px] gap-y-2 rounded-[16px] bg-[rgba(60,45,35,0.04)] p-[14px] max-[680px]:grid-cols-1">
              {emailChanged && (
                <>
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-tm">Email</dt>
                  <dd className="m-0 text-right text-xs font-bold text-tp max-[680px]:text-left">{initial.email || 'Not set'}{' -> '}{current.email}</dd>
                </>
              )}
              {mobileChanged && (
                <>
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-tm">Mobile</dt>
                  <dd className="m-0 text-right text-xs font-bold text-tp max-[680px]:text-left">{initial.mobile || 'Not set'}{' -> '}{current.mobile}</dd>
                </>
              )}
            </dl>

            {emailChanged && (
              <div className="grid gap-2.5">
                <div className="text-[13px] font-extrabold text-tp">Email verification</div>
                <div className={copyClass}>
                  A code was sent to {current.email}. Enter it here to confirm the new sign-in email.
                </div>
                <input
                  className={`${inputClass} ${inputFocusClass}`}
                  inputMode="numeric"
                  value={emailCode}
                  onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                />
                <div className={cn(copyClass, 'min-h-[18px]')}>
                  {emailCodeState === 'sending' && 'Sending code...'}
                  {emailCodeState === 'sent' && 'Code sent'}
                  {emailCodeState === 'error' && 'Code delivery failed'}
                </div>
              </div>
            )}

            {mobileChanged && (
              <div className={cn(
                'grid gap-2.5 rounded-[16px] bg-[rgba(200,83,42,0.07)] p-[14px]',
                !security.ssoConfigured && 'bg-[rgba(184,50,50,0.1)]'
              )}>
                <div className="text-[13px] font-extrabold text-tp">Mobile change warning</div>
                <p className="m-0 text-xs leading-[1.6] text-tp">
                  {security.ssoConfigured
                    ? 'You sign in with SSO, so this should not interrupt your 2FA setup.'
                    : 'This can affect your 2FA and recovery path if you did not sign in with SSO.'}
                </p>
                <label className="flex items-center gap-2.5 text-xs font-bold text-tp">
                  <input className="h-4 w-4" type="checkbox" checked={mobileAck} onChange={(event) => setMobileAck(event.target.checked)} />
                  I understand and want to continue
                </label>
                <input
                  className={`${inputClass} ${inputFocusClass}`}
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
