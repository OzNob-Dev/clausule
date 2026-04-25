import { useEffect, useState } from 'react'
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
    setForm(next)
    setBaseline(next)
  }, [profile])

  const current = normalize(form)
  const initial = normalize(baseline)
  const changed = Object.entries(current).filter(([k, v]) => v !== initial[k]).map(([k]) => k)

  const emailChanged  = changed.includes('email')
  const mobileChanged = changed.includes('mobile')
  const dirty         = changed.length > 0
  const baseReady     = !!(current.firstName && validateEmail(current.email).valid && current.mobile)
  const displayName   = profileDisplayName(current)
  const initials      = profileInitials(current)
  const emailWarning  = emailChanged
    ? `We'll verify ${current.email} before saving.`
    : 'Your sign-in email stays unchanged.'

  return {
    form, setForm,
    current, initial,
    changed, dirty, emailChanged, mobileChanged,
    baseReady, displayName, initials, emailWarning,
    resetForm:      () => setForm(baseline),
    commitBaseline: (next) => setBaseline(next),
  }
}
