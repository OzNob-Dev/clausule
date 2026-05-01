'use client'

import SignupProgress from '@shared/components/SignupProgress'
import SignupStepDone from '@shared/components/SignupStepDone'
import { authShellNarrowClassName } from '@shared/components/layout/authShellClasses'

/**
 * @param {{ email: string }} props
 */
export default function SignupDoneScreen({ email }) {
  return (
    <>
      <SignupProgress mobile />
      <div className={`${authShellNarrowClassName} page-enter`}>
        <SignupStepDone email={email} />
      </div>
    </>
  )
}
