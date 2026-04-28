'use client'

import { useShallow } from 'zustand/shallow'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { useProfileForm } from '@features/account/hooks/useProfileForm'
import { useProfileSave } from '@features/account/hooks/useProfileSave'
import { useProfileVerification } from '@features/account/hooks/useProfileVerification'
import { VerifyChangesModal } from '@features/account/components/VerifyChangesModal'
import { VerificationProvider } from '@features/account/context/VerificationContext'
import { formatMobile } from '@features/account/utils/formatMobile'
import { Button } from '@shared/components/ui/Button'
import { Field, FieldHint, FieldInput, FieldLabel } from '@shared/components/ui/Field'
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
        <div className="be-inner profile-page">
          <header className="profile-header">
            <h1 id="profile-page-title" className="profile-heading">Personal details</h1>
            <p className="profile-subheading">Manage the identity, contact, and work details connected to your account.</p>
          </header>

          <div className="profile-divider" aria-hidden="true" />

          <form className="profile-card" onSubmit={onSubmit}>
            <section className="profile-section" aria-labelledby="profile-identity-title">
              <h2 id="profile-identity-title" className="profile-section-title">Identity</h2>
              <div className="profile-fields">
                <Field className="profile-field">
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <FieldInput id="firstName" className="profile-input" value={form.firstName} autoComplete="given-name"
                    onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} required />
                </Field>
                <Field className="profile-field">
                  <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                  <FieldInput id="lastName" className="profile-input" value={form.lastName} autoComplete="family-name"
                    onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} />
                </Field>
              </div>
            </section>

            <div className="profile-section-divider" aria-hidden="true" />

            <section className="profile-section" aria-labelledby="profile-contact-title">
              <h2 id="profile-contact-title" className="profile-section-title">Contact</h2>
              <div className="profile-fields profile-fields--stacked">
                <Field className="profile-field profile-field--full">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldInput id="email" className="profile-input" type="email" value={form.email} autoComplete="email"
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
                  <FieldHint className="profile-help">{emailWarning}</FieldHint>
                </Field>
                <Field className="profile-field profile-field--full">
                  <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
                  <FieldInput id="mobile" className="profile-input" type="tel" value={form.mobile} autoComplete="tel"
                    onChange={(e) => setForm((s) => ({ ...s, mobile: formatMobile(e.target.value) }))} required />
                  <FieldHint className="profile-help">Use the number you want tied to account recovery and contact updates.</FieldHint>
                </Field>
              </div>
            </section>

            <div className="profile-section-divider" aria-hidden="true" />

            <section className="profile-section" aria-labelledby="profile-work-title">
              <h2 id="profile-work-title" className="profile-section-title">Work profile</h2>
              <div className="profile-fields">
                <Field className="profile-field">
                  <FieldLabel htmlFor="jobTitle">Job title</FieldLabel>
                  <FieldInput id="jobTitle" className="profile-input" value={form.jobTitle} autoComplete="organization-title"
                    onChange={(e) => setForm((s) => ({ ...s, jobTitle: e.target.value }))} />
                </Field>
                <Field className="profile-field">
                  <FieldLabel htmlFor="department">Department</FieldLabel>
                  <FieldInput id="department" className="profile-input" value={form.department} autoComplete="organization"
                    onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))} />
                </Field>
              </div>
            </section>

            {error   && <div className="profile-alert profile-alert--error"   role="alert">{error}</div>}
            {success && <div className="profile-alert profile-alert--success" role="status">{success}</div>}

            <div className="profile-actions">
              <Button type="button" variant="ghost" className="profile-btn profile-btn--ghost" onClick={resetForm} disabled={!dirty || saving}>
                Reset
              </Button>
              <Button type="submit" variant="primary" className="profile-btn profile-btn--primary" disabled={!dirty || saving || !baseReady}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
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
