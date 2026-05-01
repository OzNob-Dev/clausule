'use client'

import { useProfileStore } from '@auth/store/useProfileStore'
import { ProfileField } from '@shared/components/ui/ProfileField'
import { SectionCard } from '@shared/components/ui/SectionCard'
import PageHeader from '@shared/components/ui/PageHeader'
import { useShallow } from 'zustand/shallow'
import { formatMobile } from '@account/utils/formatMobile'
import { useProfileForm } from '@account/hooks/useProfileForm'
import { useProfileSave } from '@account/hooks/useProfileSave'
import { Button } from '@shared/components/ui/Button'
import '@brag/styles/brag-settings-core.css'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'

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
    <>
      <PageHeader
        className="bss-header"
        eyebrow="Account"
        eyebrowAriaHidden
        eyebrowClassName="bss-eyebrow"
        title="Personal details"
        titleClassName="bss-heading"
        titleId="profile-page-title"
        description="Manage the identity, contact, and work details connected to your account."
        descriptionClassName="bss-subheading"
      />
      <div className="bss-divider" />
      <SectionCard
        as="form"
        ariaLabel="Personal details form"
        title="Your profile"
        meta="Account settings"
        titleClassName="bss-card-head-title"
        metaClassName="bss-card-head-meta"
        bodyClassName="px-10 py-9 max-[860px]:px-6"
        onSubmit={onSubmit}
      >
        <div className="bss-form">
          <section className="bss-column flex flex-col" aria-labelledby="section-identity">
            <div className="section-label mb-[22px] flex items-center gap-[10px] text-[var(--cl-text-xs)] font-bold uppercase tracking-[2px] text-[var(--cl-accent-deep)] after:h-[0.5px] after:flex-1 after:bg-[var(--cl-accent-alpha-22)] after:content-['']" id="section-identity">Identity</div>
            <div className="field-row mb-6 grid grid-cols-2 gap-7 max-[860px]:grid-cols-1">
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
          <section className="bss-column flex flex-col" aria-labelledby="section-contact">
            <div className="section-label mb-[22px] flex items-center gap-[10px] text-[var(--cl-text-xs)] font-bold uppercase tracking-[2px] text-[var(--cl-accent-deep)] after:h-[0.5px] after:flex-1 after:bg-[var(--cl-accent-alpha-22)] after:content-['']" id="section-contact">Contact</div>
            <div className="field-row single mb-1.5 grid grid-cols-1 gap-7">
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
            <p className="field-hint -mt-1 mb-6 text-[var(--cl-text-sm)] leading-[1.5] text-[var(--cl-surface-muted-9)]" id="email-hint">Your sign-in email stays unchanged.</p>

            <div className="field-row single mb-1.5 grid grid-cols-1 gap-7">
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
            <p className="field-hint -mt-1 mb-6 text-[var(--cl-text-sm)] leading-[1.5] text-[var(--cl-surface-muted-9)]" id="mobile-hint">Use the number you want tied to account recovery and contact updates.</p>
          </section>
          <section className="bss-column flex flex-col" aria-labelledby="section-work">
            <div className="section-label mb-[22px] flex items-center gap-[10px] text-[var(--cl-text-xs)] font-bold uppercase tracking-[2px] text-[var(--cl-accent-deep)] after:h-[0.5px] after:flex-1 after:bg-[var(--cl-accent-alpha-22)] after:content-['']" id="section-work">Work profile</div>
            <div className="field-row last grid grid-cols-2 gap-7 max-[860px]:grid-cols-1">
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

          {error ? <p className="profile-status profile-status--error mt-5 text-[var(--cl-text-base)] leading-[1.5] text-[var(--cl-danger-4)]" role="alert">{error}</p> : null}
          {success ? <p className="profile-status profile-status--success mt-5 text-[var(--cl-text-base)] leading-[1.5] text-[var(--cl-success)]" role="status">{success}</p> : null}
          <div className="section-rule my-7 h-[0.5px] bg-[var(--cl-ink-alpha-10)]" aria-hidden="true" />
          <div className="form-buttons flex items-center justify-end gap-3 max-[560px]:flex-col-reverse max-[560px]:items-stretch">
            <Button type="button" variant="ghost" className="be-comp-cancel" onClick={resetForm} disabled={!dirty || saving}>Reset</Button>
            <Button type="submit" variant="primary" className="be-comp-save" disabled={!dirty || saving}>
              <CheckIcon className="h-[13px] w-[13px] fill-none stroke-[var(--cl-surface-muted-16)] [stroke-width:2.5]" />
              Send feedback
            </Button>
          </div>
        </div>
      </SectionCard>
    </>
  )
}
