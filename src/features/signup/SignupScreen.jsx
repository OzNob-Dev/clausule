'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import SignupProgress from '@features/signup/components/SignupProgress'
import SignupStepAccount from '@features/signup/components/SignupStepAccount'
import '@features/signup/styles/signup-theme.css'
import '@features/signup/styles/signup-form.css'
import '@shared/styles/page-loader.css'

function SignUpInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const emailPrefill = searchParams.get('email') ?? ''
  const firstNamePrefill = searchParams.get('firstName') ?? ''
  const lastNamePrefill = searchParams.get('lastName') ?? ''
  const redirectedFromSignIn = Boolean(emailPrefill)

  const initialData = useMemo(() => ({
    ...(emailPrefill && { email: emailPrefill }),
    ...(firstNamePrefill && { firstName: firstNamePrefill }),
    ...(lastNamePrefill && { lastName: lastNamePrefill }),
  }), [emailPrefill, firstNamePrefill, lastNamePrefill])

  const handleStep1 = (data) => {
    const params = new URLSearchParams({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    })
    router.push(`/signup/plan?${params}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <SignupProgress mobile />
      <div className="su-narrow">
        <SignupStepAccount
          emailLocked={redirectedFromSignIn}
          hideSso={redirectedFromSignIn}
          onNext={handleStep1}
          initialData={initialData}
        />
      </div>
      <p className="su-shell-signin-note">
        Already have an account?{' '}
        <Link href="/">Sign in</Link>
      </p>
    </>
  )
}

export default function SignUp() {
  return (
    <Suspense fallback={<div className="su-page" aria-busy="true" />}>
      <SignUpInner />
    </Suspense>
  )
}
