'use client'

import { useShallow } from 'zustand/shallow'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { useProfileForm } from '@features/account/hooks/useProfileForm'
import { useProfileSave } from '@features/account/hooks/useProfileSave'
import { useProfileVerification } from '@features/account/hooks/useProfileVerification'
import { VerifyChangesModal } from '@features/account/components/VerifyChangesModal'
import { VerificationProvider } from '@features/account/context/VerificationContext'
import '@features/brag/styles/brag-settings-core.css'
import '@features/account/styles/profile.css'
import '@shared/styles/page-loader.css'

export default function ProfileScreen() {
  const { profile, security } = useProfileStore(useShallow((state) => ({
    profile: state.profile,
    security: state.security,
  })))

  const {
    form, setForm, current, initial,
    dirty, emailChanged, mobileChanged,
    baseReady, emailWarning,
    resetForm, commitBaseline,
  } = useProfileForm(profile)

  const { saving, error, setError, success, patchProfile } = useProfileSave({
    current, emailChanged, commitBaseline,
  })

  const verification = useProfileVerification({
    current, emailChanged, mobileChanged,
    patchProfile, setError,
  })

  const onSubmit = (e) => {
    e.preventDefault()
    if (!dirty) return
    if (emailChanged || mobileChanged) { verification.openConfirm(); return }
    void patchProfile({ emailVerificationCode: '', mobileConfirmed: true, mobileConfirmation: '' })
  }

  return (
    <main className="be-main page-enter" aria-labelledby="profile-page-title">
        <div className="be-inner">
          <h1 id="profile-page-title" className="bss-heading">Personal details</h1>
          <p className="bss-subheading">Manage the identity, contact, and work details connected to your account.</p>
          <div className="bss-divider" />

          <form className="profile-card" onSubmit={onSubmit}>
            <div className="profile-section">
              <div className="profile-section-title">Identity</div>
              <div className="profile-fields">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="firstName">First name</label>
                  <input id="firstName" className="profile-input" value={form.firstName} autoComplete="given-name"
                    onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} required />
                </div>
                <div className="profile-field">
                  <label className="profile-label" htmlFor="lastName">Last name</label>
                  <input id="lastName" className="profile-input" value={form.lastName} autoComplete="family-name"
                    onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-section-title">Contact</div>
              <div className="profile-fields">
                <div className="profile-field profile-field--full">
                  <label className="profile-label" htmlFor="email">Email</label>
                  <input id="email" className="profile-input" type="email" value={form.email} autoComplete="email"
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
                  <p className="profile-help">{emailWarning}</p>
                </div>
                <div className="profile-field profile-field--full">
                  <label className="profile-label" htmlFor="mobile">Mobile</label>
                  <input id="mobile" className="profile-input" type="tel" value={form.mobile} autoComplete="tel"
                    onChange={(e) => setForm((s) => ({ ...s, mobile: e.target.value }))} required />
                  <p className="profile-help">Use the number you want tied to account recovery and contact updates.</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-section-title">Work profile</div>
              <div className="profile-fields">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="jobTitle">Job title</label>
                  <input id="jobTitle" className="profile-input" value={form.jobTitle} autoComplete="organization-title"
                    onChange={(e) => setForm((s) => ({ ...s, jobTitle: e.target.value }))} />
                </div>
                <div className="profile-field">
                  <label className="profile-label" htmlFor="department">Department</label>
                  <input id="department" className="profile-input" value={form.department} autoComplete="organization"
                    onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))} />
                </div>
              </div>
            </div>

            {error   && <div className="profile-alert profile-alert--error"   role="alert">{error}</div>}
            {success && <div className="profile-alert profile-alert--success" role="status">{success}</div>}

            <div className="profile-actions">
              <button type="button" className="profile-btn profile-btn--ghost"
                onClick={resetForm} disabled={!dirty || saving}>Reset</button>
              <button type="submit" className="profile-btn profile-btn--primary"
                disabled={!dirty || saving || !baseReady}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <VerificationProvider
          verification={verification}
          saving={saving}
          emailChanged={emailChanged}
          mobileChanged={mobileChanged}
          initial={initial}
          current={current}
          security={security}
        >
          <VerifyChangesModal
            open={verification.confirmOpen}
            onClose={verification.resetVerification}
            onSubmit={verification.submitConfirm}
          />
        </VerificationProvider>
    </main>
  )
}
