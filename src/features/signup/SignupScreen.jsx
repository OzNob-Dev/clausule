'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SignupProvider, useSignup } from '@features/signup/context/SignupContext'
import { BrandBugIcon } from '@features/auth/components/SignInBrandPanel'
import SignupAside from '@features/signup/components/SignupAside'
import SignupProgress from '@features/signup/components/SignupProgress'
import SignupStepAccount from '@features/signup/components/SignupStepAccount'
import SignupStepDone from '@features/signup/components/SignupStepDone'
import SignupStepPayment from '@features/signup/components/SignupStepPayment'
import '@features/signup/styles/signup-theme.css'
import '@features/signup/styles/signup-form.css'
import '@features/signup/styles/signup-payment.css'
import '@features/signup/styles/signup-success.css'
import '@features/signup/styles/signup-aside.css'

// ── Root component ─────────────────────────────────────────────────
function SignUpInner() {
  const searchParams = useSearchParams()
  const { step, setStep, step1Data, setStep1Data, completeSignup } = useSignup()

  const emailPrefill = searchParams.get('email') ?? ''
  const firstNamePrefill = searchParams.get('firstName') ?? ''
  const lastNamePrefill = searchParams.get('lastName') ?? ''
  const redirectedFromSignIn = Boolean(emailPrefill)

  const step1Initial = useMemo(() => ({
    ...step1Data,
    ...(emailPrefill && { email: emailPrefill }),
    ...(firstNamePrefill && { firstName: firstNamePrefill }),
    ...(lastNamePrefill && { lastName: lastNamePrefill }),
  }), [emailPrefill, firstNamePrefill, lastNamePrefill, step1Data])

  const goStep = (n) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep1 = (data) => {
    setStep1Data(data)
    goStep(2)
  }

  if (step === 1) {
    return (
      <>
        <div className="su-step1-layout">
          <div className="su-step1-form">
            <SignupStepAccount
              emailLocked={redirectedFromSignIn}
              hideSso={redirectedFromSignIn}
              onNext={handleStep1}
              initialData={step1Initial}
            />
          </div>
          <aside className="su-aside" aria-label="Plan summary">
            <SignupAside />
          </aside>
        </div>
        <p className="su-shell-signin-note">
          Already have an account?{' '}
          <Link href="/">Sign in</Link>
        </p>
      </>
    )
  }

  return (
    <div className="su-page su-fullscreen">
      <div className="su-bg-lines" aria-hidden="true" />

      <div className="su-topbar">
        <div className="su-topbar-brand">
          <div className="su-logo-bug">
            <BrandBugIcon size={14} />
          </div>
          <span className="su-brand-name">clausule</span>
        </div>
        <Link href="/" className="su-signin-link">
          Already have an account?{' '}
          <span>Sign in</span>
        </Link>
      </div>

      {step < 3 && <SignupProgress step={step} />}

      <div className="su-main">
        <div className="su-narrow">
          {step === 2 && (
            <SignupStepPayment
              onNext={completeSignup}
              onBack={() => goStep(1)}
              accountData={step1Data}
            />
          )}
          {step === 3 && <SignupStepDone email={step1Data.email} />}
        </div>
      </div>
    </div>
  )
}

export default function SignUp() {
  return (
    <SignupProvider>
      <Suspense fallback={<div className="su-page" aria-busy="true" />}>
        <SignUpInner />
      </Suspense>
    </SignupProvider>
  )
}
