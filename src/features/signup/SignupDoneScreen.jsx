'use client'

import SignupProgress from '@features/signup/components/SignupProgress'
import SignupStepDone from '@features/signup/components/SignupStepDone'
import '@features/signup/styles/signup-theme.css'
import '@features/signup/styles/signup-success.css'

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
