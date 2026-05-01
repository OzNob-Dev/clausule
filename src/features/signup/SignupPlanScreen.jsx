'use client'

import { useRouter } from 'next/navigation'
import SignupProgress from '@shared/components/SignupProgress'
import SignupStepPayment from '@shared/components/SignupStepPayment'
import { authShellNarrowClassName } from '@shared/components/layout/authShellClasses'

/**
 * @param {{ accountData: { email: string, firstName: string, lastName: string } }} props
 */
export default function SignupPlanScreen({ accountData }) {
  const router = useRouter()

  const handleNext = () => {
    const params = new URLSearchParams({ email: accountData.email })
    router.push(`/signup/done?${params}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    const params = new URLSearchParams({
      email: accountData.email,
      firstName: accountData.firstName,
      lastName: accountData.lastName,
    })
    router.push(`/signup?${params}`)
  }

  return (
    <>
      <SignupProgress mobile />
      <div className={`${authShellNarrowClassName} page-enter`}>
        <SignupStepPayment
          accountData={accountData}
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </>
  )
}
