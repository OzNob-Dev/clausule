'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SignupProvider, useSignup } from '@features/signup/context/SignupContext'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import SignupAside from '@features/signup/components/SignupAside'
import SignupProgress from '@features/signup/components/SignupProgress'
import SignupStepAccount from '@features/signup/components/SignupStepAccount'
import SignupStepDone from '@features/signup/components/SignupStepDone'
import SignupStepPayment from '@features/signup/components/SignupStepPayment'
import { authShell } from '@features/signup/components/signupClasses'

// ── Root component ─────────────────────────────────────────────────
function SignUpInner() {
  const searchParams = useSearchParams()
  const { step, setStep, step1Data, setStep1Data, step2Data, setStep2Data, completePayment } = useSignup()
  const setProfile = useProfileStore((state) => state.setProfile)

  const emailPrefill     = decodeURIComponent(searchParams.get('email')     ?? '')
  const firstNamePrefill = decodeURIComponent(searchParams.get('firstName') ?? '')
  const lastNamePrefill  = decodeURIComponent(searchParams.get('lastName')  ?? '')
  const redirectedFromSignIn = Boolean(emailPrefill)

  const step1Initial = {
    ...step1Data,
    ...(emailPrefill     && { email:     emailPrefill }),
    ...(firstNamePrefill && { firstName: firstNamePrefill }),
    ...(lastNamePrefill  && { lastName:  lastNamePrefill }),
  }

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

  if (step === 1) {
    return (
      <div className={`${authShell.page} ${authShell.ruled} ${authShell.shellWrap}`}>
        <div className={authShell.shell}>
          <div className={authShell.darkPanel}>
            <div className={authShell.brandRow}>
              <div className={authShell.brandBug}>
                <svg viewBox="0 0 18 18" fill="none" stroke="#FBF7F2" strokeWidth="2.2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
                  <path d="M3 5h12M3 9h8M3 13h5" />
                </svg>
              </div>
              <Link href="/" className={authShell.brandTextDark}>clausule</Link>
            </div>
            <div className={authShell.leftBody}>
              <h1 className={authShell.headline}>Thoughtful records.<br />Better conversations.</h1>
              <p className={authShell.headlineSub}>The file note tool built for managers who care about their people — and a brag doc for the people themselves.</p>
            </div>
            <div className={authShell.footer}>Built for teams who care</div>
          </div>

          <div className={authShell.lightPanel}>
            <div className={authShell.stepLayout}>
              <div>
                <SignupStepAccount
                  emailLocked={redirectedFromSignIn}
                  hideSso={redirectedFromSignIn}
                  onNext={handleStep1}
                  initialData={step1Initial}
                />
              </div>
              <aside aria-label="Plan summary">
                <SignupAside />
              </aside>
            </div>
            <p className={authShell.signinNote}>
              Already have an account?{' '}
              <Link href="/" className={authShell.signinLink}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${authShell.page} ${authShell.ruled}`}>
      <div className={authShell.topbar}>
        <div className={authShell.topbarBrand}>
          <div className={authShell.topbarBug}>
            <svg viewBox="0 0 18 18" fill="none" stroke="#F5F0EA" strokeWidth="2.2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
              <path d="M3 5h12M3 9h8M3 13h5" />
            </svg>
          </div>
          <span className={authShell.brandTextLight}>clausule</span>
        </div>
        <Link href="/" className="text-[13px] font-semibold text-[#3D3228]">
          Already have an account?{' '}
          <span>Sign in</span>
        </Link>
      </div>

      {step < 3 && <SignupProgress step={step} />}

      <div className={authShell.main}>
        <div className={authShell.narrow}>
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
