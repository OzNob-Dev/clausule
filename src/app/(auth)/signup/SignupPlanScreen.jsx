'use client'

import { useRouter } from 'next/navigation'
import SignupProgress from '@shared/components/SignupProgress'
import SignupStepPayment from '@shared/components/SignupStepPayment'
import '@signup/styles/signup-theme.css'
import '@signup/styles/signup-form.css'
import '@signup/styles/signup-payment.css'
import '@shared/styles/page-loader.css'

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
      <div className="su-narrow page-enter">
        <SignupStepPayment
          accountData={accountData}
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </>
  )
}
