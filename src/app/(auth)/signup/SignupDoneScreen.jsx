'use client'

import SignupProgress from '@signup/components/SignupProgress'
import SignupStepDone from '@signup/components/SignupStepDone'
import '@signup/styles/signup-theme.css'
import '@signup/styles/signup-success.css'

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
