// @ts-check
import { useEffect, useMemo, useState } from 'react'
import { validateEmail } from '@shared/utils/emailValidation'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  jobTitle: '',
  department: '',
}

/** @param {{ firstName: string, lastName: string, email: string, mobile: string, jobTitle: string, department: string }} form
 * @returns {Record<string, string>}
 */
function normalize(form) {
  return {
    firstName:  form.firstName.trim(),
    lastName:   form.lastName.trim(),
    email:      form.email.trim().toLowerCase(),
    mobile:     form.mobile.trim(),
    jobTitle:   form.jobTitle.trim(),
    department: form.department.trim(),
  }
}

/** @param {{ firstName?: string, lastName?: string, email?: string, mobile?: string, jobTitle?: string, department?: string }} profile */
export function useProfileForm(profile) {
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [baseline, setBaseline] = useState(EMPTY_FORM)

  useEffect(() => {
    const next = {
      firstName:  profile.firstName  ?? '',
      lastName:   profile.lastName   ?? '',
      email:      profile.email      ?? '',
      mobile:     profile.mobile     ?? '',
      jobTitle:   profile.jobTitle   ?? '',
      department: profile.department ?? '',
    }
    const normalizedNext = normalize(next)
    const normalizedBaseline = normalize(baseline)
    const normalizedForm = normalize(form)
    const localEdits = Object.keys(normalizedForm).some((key) => normalizedForm[key] !== normalizedBaseline[key])
    const alreadyHydrated = Object.keys(normalizedNext).every((key) => normalizedNext[key] === normalizedBaseline[key])

    if (localEdits || alreadyHydrated) return

    setForm(next)
    setBaseline(next)
  }, [
    baseline,
    form,
    profile.department,
    profile.email,
    profile.firstName,
    profile.jobTitle,
    profile.lastName,
    profile.mobile,
  ])

  const derived = useMemo(() => {
    const current = normalize(form)
    const initial = normalize(baseline)
    const changed = Object.entries(current).filter(([key, value]) => value !== initial[key]).map(([key]) => key)
    const emailChanged = changed.includes('email')

    return {
      current,
      initial,
      changed,
      dirty: changed.length > 0,
      emailChanged,
      mobileChanged: changed.includes('mobile'),
      baseReady: !!(current.firstName && validateEmail(current.email).valid && current.mobile),
      displayName: profileDisplayName(current),
      initials: profileInitials(current),
      emailWarning: emailChanged
        ? `We'll verify ${current.email} before saving.`
        : 'Your sign-in email stays unchanged.',
    }
  }, [baseline, form])

  return {
    form, setForm,
    ...derived,
    resetForm:      () => setForm(baseline),
    commitBaseline: (/** @type {typeof EMPTY_FORM} */ next) => {
      setForm(next)
      setBaseline(next)
    },
  }
}
