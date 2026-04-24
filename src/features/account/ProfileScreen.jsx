'use client'

import BragRail from '@features/brag/components/BragRail'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { cn } from '@shared/utils/cn'
import { useProfileForm } from '@features/account/hooks/useProfileForm'
import { useProfileSave } from '@features/account/hooks/useProfileSave'
import { useProfileVerification } from '@features/account/hooks/useProfileVerification'
import { VerifyChangesModal } from '@features/account/components/VerifyChangesModal'
import {
  pageClass, mainClass, innerClass,
  headingClass, subheadingClass, dividerClass,
  cardClass, sectionClass, sectionTitleClass, fieldsClass,
  labelClass, inputClass, helpClass,
  alertClass, alertErrorClass, alertSuccessClass,
  actionsClass, actionsBtnClass, btnClass, btnGhostClass, btnPrimaryClass,
  getFieldClass,
} from '@features/account/styles'

export default function ProfileScreen() {
  const profile  = useProfileStore((s) => s.profile)
  const security = useProfileStore((s) => s.security)

  const {
    form, setForm, current, initial,
    dirty, emailChanged, mobileChanged,
    baseReady, displayName, initials, emailWarning,
    resetForm, commitBaseline,
  } = useProfileForm(profile)

  const { saving, error, setError, success, patchProfile } = useProfileSave({
    current, emailChanged, commitBaseline,
  })

  const verification = useProfileVerification({
    current, emailChanged, mobileChanged,
    patchProfile, setError,
  })

  const ssoText = security.ssoConfigured ? 'Single sign-on active' : 'Passwordless or email sign-in'

  const onSubmit = (e) => {
    e.preventDefault()
    if (!dirty) return
    if (emailChanged || mobileChanged) { verification.openConfirm(); return }
    void patchProfile({ emailVerificationCode: '', mobileConfirmed: true, mobileConfirmation: '' })
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
                  <input id="firstName" className={inputClass} value={form.firstName} autoComplete="given-name"
                    onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} required />
                </div>
                <div className={getFieldClass()}>
                  <label className={labelClass} htmlFor="lastName">Last name</label>
                  <input id="lastName" className={inputClass} value={form.lastName} autoComplete="family-name"
                    onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <div className={sectionTitleClass}>Contact</div>
              <div className={fieldsClass}>
                <div className={getFieldClass(true)}>
                  <label className={labelClass} htmlFor="email">Email</label>
                  <input id="email" className={inputClass} type="email" value={form.email} autoComplete="email"
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
                  <p className={helpClass}>{emailWarning}</p>
                </div>
                <div className={getFieldClass(true)}>
                  <label className={labelClass} htmlFor="mobile">Mobile</label>
                  <input id="mobile" className={inputClass} type="tel" value={form.mobile} autoComplete="tel"
                    onChange={(e) => setForm((s) => ({ ...s, mobile: e.target.value }))} required />
                  <p className={helpClass}>Use the number you want tied to account recovery and contact updates.</p>
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <div className={sectionTitleClass}>Work profile</div>
              <div className={fieldsClass}>
                <div className={getFieldClass()}>
                  <label className={labelClass} htmlFor="jobTitle">Job title</label>
                  <input id="jobTitle" className={inputClass} value={form.jobTitle} autoComplete="organization-title"
                    onChange={(e) => setForm((s) => ({ ...s, jobTitle: e.target.value }))} />
                </div>
                <div className={getFieldClass()}>
                  <label className={labelClass} htmlFor="department">Department</label>
                  <input id="department" className={inputClass} value={form.department} autoComplete="organization"
                    onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))} />
                </div>
              </div>
            </div>

            {error   && <div className={cn(alertClass, alertErrorClass)}   role="alert">{error}</div>}
            {success && <div className={cn(alertClass, alertSuccessClass)} role="status">{success}</div>}

            <div className={actionsClass}>
              <button type="button" className={cn(btnClass, btnGhostClass, actionsBtnClass)}
                onClick={resetForm} disabled={!dirty || saving}>Reset</button>
              <button type="submit" className={cn(btnClass, btnPrimaryClass, actionsBtnClass)}
                disabled={!dirty || saving || !baseReady}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <VerifyChangesModal
          open={verification.confirmOpen}
          onClose={verification.resetVerification}
          saving={saving}
          finalReady={verification.finalReady}
          initial={initial}
          current={current}
          emailChanged={emailChanged}
          mobileChanged={mobileChanged}
          security={security}
          emailCode={verification.emailCode}
          setEmailCode={verification.setEmailCode}
          emailCodeState={verification.emailCodeState}
          mobileCheck={verification.mobileCheck}
          setMobileCheck={verification.setMobileCheck}
          mobileAck={verification.mobileAck}
          setMobileAck={verification.setMobileAck}
          onSubmit={verification.submitConfirm}
        />
      </main>
    </div>
  )
}
