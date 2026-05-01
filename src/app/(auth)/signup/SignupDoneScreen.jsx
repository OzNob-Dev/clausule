'use client'

import SignupProgress from '@shared/components/SignupProgress'
import SignupStepDone from '@shared/components/SignupStepDone'
import '@signup/styles/signup-theme.css'

/**
 * @param {{ email: string }} props
 */
export default function SignupDoneScreen({ email }) {
  return (
    <>
      <SignupProgress mobile />
      <div className="su-narrow page-enter">
        <SignupStepDone email={email} />
      </div>
    </>
  )
}
