'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SignupProvider, useSignup } from '@/contexts/SignupContext'
import { useProfileStore } from '@/stores/useProfileStore'
import SignupAside from '@/components/signup/SignupAside'
import SignupProgress from '@/components/signup/SignupProgress'
import SignupStepAccount from '@/components/signup/SignupStepAccount'
import SignupStepDone from '@/components/signup/SignupStepDone'
import SignupStepPayment from '@/components/signup/SignupStepPayment'
import '@/styles/signup-theme.css'
import '@/styles/signup-form.css'
import '@/styles/signup-payment.css'
import '@/styles/signup-success.css'
import '@/styles/signup-aside.css'

// ── Root component ─────────────────────────────────────────────────
function SignUpInner() {
  const searchParams = useSearchParams()
  const { step, setStep, step1Data, setStep1Data, step2Data, setStep2Data, completePayment } = useSignup()
  const setProfile = useProfileStore((state) => state.setProfile)

  const emailPrefill = decodeURIComponent(searchParams.get('email') ?? '')
  const step1Initial = emailPrefill ? { ...step1Data, email: emailPrefill } : step1Data

  const goStep = (n) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep1 = (data) => {
    setStep1Data(data)
    setProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    })
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ')
    setStep2Data((prev) => ({ ...prev, cardName: prev.cardName || fullName }))
    goStep(2)
  }

  return (
    <div className="su-page">
      <div className="su-bg-lines" aria-hidden="true" />

      {/* Topbar */}
      <div className="su-topbar">
        <div className="su-topbar-brand">
          <div className="su-logo-bug">
            <svg viewBox="0 0 18 18" fill="none" stroke="#F5F0EA" strokeWidth="2.2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
              <path d="M3 5h12M3 9h8M3 13h5" />
            </svg>
          </div>
          <span className="su-brand-name">clausule</span>
        </div>
        <Link href="/" className="su-signin-link">
          Already have an account?{' '}
          <span>Sign in</span>
        </Link>
      </div>

      {/* Progress */}
      {step < 3 && <SignupProgress step={step} />}

      {/* Main */}
      <div className="su-main">
        {step === 1 ? (
          <div className="su-step1-layout">
            <div className="su-step1-form">
              <SignupStepAccount onNext={handleStep1} initialData={step1Initial} />
            </div>
            <div className="su-aside">
              <SignupAside />
            </div>
          </div>
        ) : (
          <div className="su-narrow">
            {step === 2 && (
              <SignupStepPayment
                onNext={(data) => { setStep2Data(data); completePayment() }}
                onBack={(data) => { setStep2Data(data); goStep(1) }}
                initialData={step2Data}
                accountData={step1Data}
              />
            )}
            {step === 3 && <SignupStepDone email={step1Data.email} />}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SignUp() {
  return (
    <SignupProvider>
      <Suspense>
        <SignUpInner />
      </Suspense>
    </SignupProvider>
  )
}
