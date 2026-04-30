'use client'
import './SignupStepPayment.css'

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
      <div className="su-step-sub">Checkout is not connected in this build, so this step does not ask for or store card details.</div>

      <div className="su-order-summary">
        <div className="su-order-label">Order summary</div>
        <div className="su-order-row">
          <span className="su-order-item">{INDIVIDUAL_MONTHLY_PLAN.label}</span>
          <span className="su-order-val">{formatPlanLabel(INDIVIDUAL_MONTHLY_PLAN)}</span>
        </div>
        <div className="su-order-divider" />
        <div className="su-order-row">
          <span className="su-order-total-label">Sign-up flow</span>
          <span className="su-order-total-val">No card collected</span>
        </div>
      </div>

      {apiError && <div className="su-api-error" role="alert">{apiError}</div>}

      <CtaBtn terra onClick={handleSubscribe} disabled={busy}>
        {busy ? 'Creating account…' : <>Activate account <ArrowIcon /></>}
      </CtaBtn>
      <BackBtn onClick={onBack} />
      <div className="su-trial-note">
        Subscription checkout will be added separately. This screen currently provisions access without collecting payment details.
      </div>
    </div>
  )
}
