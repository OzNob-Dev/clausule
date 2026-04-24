import { useEffect, useMemo, useState } from 'react'
import { validateEmail } from '@shared/utils/emailValidation'

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

  const current = useMemo(() => normalize(form),     [form])
  const initial = useMemo(() => normalize(baseline), [baseline])
  const changed = useMemo(
    () => Object.entries(current).filter(([k, v]) => v !== initial[k]).map(([k]) => k),
    [current, initial]
  )

  const emailChanged  = changed.includes('email')
  const mobileChanged = changed.includes('mobile')
  const dirty         = changed.length > 0
  const baseReady     = !!(current.firstName && validateEmail(current.email).valid && current.mobile)
  const displayName   = [current.firstName, current.lastName].filter(Boolean).join(' ').trim() || 'Your profile'
  const initials      = ((current.firstName[0] ?? '') + (current.lastName[0] ?? '')).toUpperCase()
                        || current.email?.[0]?.toUpperCase() || 'U'
  const emailWarning  = emailChanged
    ? `We'll verify ${current.email} before saving.`
    : 'Your sign-in email stays unchanged.'

  return {
    form, setForm,
    current, initial,
    changed, dirty, emailChanged, mobileChanged,
    baseReady, displayName, initials, emailWarning,
    resetForm:       () => setForm(baseline),
    commitBaseline:  (next) => setBaseline(next),
  }
}
