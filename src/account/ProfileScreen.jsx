'use client'

import { useProfileStore } from '@auth/store/useProfileStore'
import Layout from '@brag/components/layout'
import { ProfileActions } from '@shared/components/ui/ProfileActions'
import { ProfileField } from '@shared/components/ui/ProfileField'
import { ProfileFormCard } from '@shared/components/ui/ProfileFormCard'
import { useShallow } from 'zustand/shallow'
import { formatMobile } from '@account/utils/formatMobile'
import { useProfileForm } from '@account/hooks/useProfileForm'
import { useProfileSave } from '@account/hooks/useProfileSave'
import '@account/styles/profile.css'

export default function ProfileScreen() {
  const { profile } = useProfileStore(useShallow((state) => ({ profile: state.profile })))
  const { form, setForm, current, dirty, resetForm, commitBaseline } = useProfileForm(profile)
  const { saving, error, success, patchProfile } = useProfileSave({ current, emailChanged: false, commitBaseline })

  const onSubmit = (e) => {
    e.preventDefault()
    if (!dirty || saving) return
    void patchProfile({ mobileConfirmed: true, mobileConfirmation: current.mobile })
  }

  return (
    <Layout mainClassName="page-enter" innerClassName="profile-screen" ariaLabelledby="profile-page-title">
      <header className="main-header">
        <p className="eyebrow" aria-hidden="true">Account</p>
        <h1 id="profile-page-title" className="page-title">Personal details</h1>
        <p className="page-desc">Manage the identity, contact, and work details connected to your account.</p>
      </header>

      <div className="main-body">
        <ProfileFormCard onSubmit={onSubmit}>
          <section className="profile-section" aria-labelledby="section-identity">
            <div className="section-label" id="section-identity">Identity</div>
            <div className="field-row">
              <ProfileField
                id="first-name"
                label="First name"
                value={form.firstName}
                autoComplete="given-name"
                required
                onChange={(e) => setForm((state) => ({ ...state, firstName: e.target.value }))}
              />
              <ProfileField
                id="last-name"
                label="Last name"
                value={form.lastName}
                autoComplete="family-name"
                onChange={(e) => setForm((state) => ({ ...state, lastName: e.target.value }))}
              />
            </div>
          </section>

          <div className="section-rule" aria-hidden="true" />

          <section className="profile-section" aria-labelledby="section-contact">
            <div className="section-label" id="section-contact">Contact</div>
            <div className="field-row single field-row--compact">
              <ProfileField
                id="email"
                label="Email"
                type="email"
                value={form.email}
                autoComplete="email"
                readOnly
                aria-describedby="email-hint"
              />
            </div>
            <p className="field-hint" id="email-hint">Your sign-in email stays unchanged.</p>

            <div className="field-row single field-row--compact">
              <ProfileField
                id="mobile"
                label="Mobile"
                type="tel"
                value={form.mobile}
                autoComplete="tel"
                aria-describedby="mobile-hint"
                onChange={(e) => setForm((state) => ({ ...state, mobile: formatMobile(e.target.value) }))}
              />
            </div>
            <p className="field-hint" id="mobile-hint">Use the number you want tied to account recovery and contact updates.</p>
          </section>

          <div className="section-rule" aria-hidden="true" />

          <section className="profile-section" aria-labelledby="section-work">
            <div className="section-label" id="section-work">Work profile</div>
            <div className="field-row last">
              <ProfileField
                id="job-title"
                label="Job title"
                value={form.jobTitle}
                autoComplete="organization-title"
                onChange={(e) => setForm((state) => ({ ...state, jobTitle: e.target.value }))}
              />
              <ProfileField
                id="department"
                label="Department"
                value={form.department}
                autoComplete="organization"
                onChange={(e) => setForm((state) => ({ ...state, department: e.target.value }))}
              />
            </div>
          </section>

          {error ? <p className="profile-status profile-status--error" role="alert">{error}</p> : null}
          {success ? <p className="profile-status profile-status--success" role="status">{success}</p> : null}

          <ProfileActions onReset={resetForm} saving={saving} disabled={!dirty || saving} />
        </ProfileFormCard>
      </div>
    </Layout>
  )
}
