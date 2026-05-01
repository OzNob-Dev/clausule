'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { INDIVIDUAL_MONTHLY_PLAN, formatPlanLabel } from '@signup/shared/plan'
import { apiJson, jsonRequest } from '@shared/utils/api'
import { BackBtn, CtaBtn } from '@shared/components/ui/SignupButtons'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'

export default function SignupStepPayment({ accountData, onBack, onNext }) {
  const [apiError, setApiError] = useState('')

  const registerMutation = useMutation({
    mutationFn: () =>
      apiJson('/api/auth/register', jsonRequest({
        email: accountData.email,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        subscription: {
          amountCents: INDIVIDUAL_MONTHLY_PLAN.amountCents,
          currency: INDIVIDUAL_MONTHLY_PLAN.currency,
          interval: INDIVIDUAL_MONTHLY_PLAN.interval,
        },
      }, { method: 'POST' }), { retryOnUnauthorized: false }),
  })

  const handleSubscribe = async () => {
    setApiError('')

    try {
      await registerMutation.mutateAsync()
      onNext()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Network error — please check your connection and try again.')
    }
  }

  const busy = registerMutation.isPending

  return (
    <div>
      <div className="su-step-heading">Review your plan</div>
      <div className="su-step-sub mb-6">Checkout is not connected in this build, so this step does not ask for or store card details.</div>

      <div className="su-order-summary mb-6 rounded-[var(--su-r2)] bg-[var(--su-panel)] p-5">
        <div className="su-order-label mb-[14px] text-[var(--cl-text-2xs)] font-bold uppercase tracking-[0.8px] text-[var(--su-tx3)]">Order summary</div>
        <div className="su-order-row mb-2 flex items-center justify-between gap-4">
          <span className="su-order-item text-[var(--cl-text-md)] font-medium text-[var(--su-tx2)]">{INDIVIDUAL_MONTHLY_PLAN.label}</span>
          <span className="su-order-val text-[var(--cl-text-md)] font-bold text-[var(--su-tx1)]">{formatPlanLabel(INDIVIDUAL_MONTHLY_PLAN)}</span>
        </div>
        <div className="su-order-divider my-3 h-px bg-[var(--su-border-em)]" />
        <div className="su-order-row flex items-center justify-between gap-4">
          <span className="su-order-total-label text-[var(--cl-text-lg)] font-extrabold text-[var(--su-tx1)]">Sign-up flow</span>
          <span className="su-order-total-val text-[var(--cl-text-lg)] font-extrabold text-[var(--su-tx1)]">No card collected</span>
        </div>
      </div>

      {apiError ? <div className="su-api-error mb-4 rounded-[var(--su-r2)] border border-[var(--cl-danger-alpha-25)] bg-[var(--cl-danger-alpha-8)] px-4 py-3 text-[var(--cl-text-sm)] font-medium text-[var(--cl-danger-2)]" role="alert">{apiError}</div> : null}

      <CtaBtn terra onClick={handleSubscribe} disabled={busy}>
        {busy ? 'Creating account…' : <>Activate account <ArrowIcon /></>}
      </CtaBtn>
      <BackBtn onClick={onBack} />
      <div className="su-trial-note mt-4 text-center text-[var(--cl-text-sm)] leading-[1.6] text-[var(--su-tx3)]">
        Subscription checkout will be added separately. This screen currently provisions access without collecting payment details.
      </div>
    </div>
  )
}
