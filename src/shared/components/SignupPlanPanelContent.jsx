'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { authPanelSummaryClassName } from '@shared/components/layout/authShellClasses'

function PanelContent() {
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  return (
    <div className={authPanelSummaryClassName}>
      <p className="text-[13px] font-semibold text-[var(--cl-surface-paper)]">What happens next</p>
      <p className="mt-2 text-[13px] leading-[1.75] text-[var(--cl-surface-muted-11)]">
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
