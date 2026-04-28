'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import '@features/signup/styles/signup-aside.css'

function PanelContent() {
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  return (
    <div className="su-panel-summary">
      <p className="font-semibold su-panel-tx1 text-[13px]">What happens next</p>
      <p className="mt-2 text-[13px] leading-[1.75] su-panel-tx2">
        Continuing creates your Clausule account, activates the fixed individual
        monthly plan for this rollout, and sends a confirmation to{' '}
        {email && <strong>{email}</strong>}.
      </p>
    </div>
  )
}

export default function SignupPlanPanelContent() {
  return (
    <Suspense>
      <PanelContent />
    </Suspense>
  )
}
