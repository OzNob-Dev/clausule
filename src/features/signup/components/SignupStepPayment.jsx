'use client'

import { useState } from 'react'
import { formatCardNumber, formatExpiry } from '@features/signup/utils/signupFormatting'
import { useSubscriptionStore } from '@features/signup/store/useSubscriptionStore'
import { jsonRequest } from '@shared/utils/api'
import { BackBtn, CtaBtn } from './SignupButtons'
import { FieldInput, FieldLabel } from './SignupFormField'
import { ArrowIcon } from './SignupIcons'
import { signupUi } from './signupClasses'

export default function SignupStepPayment({ accountData, initialData, onBack, onNext }) {
  const setMonthlyIndividualPlan = useSubscriptionStore((state) => state.setMonthlyIndividualPlan)
  const [cardName, setCardName] = useState(initialData.cardName)
  const [cardNum, setCardNum] = useState(initialData.cardNum)
  const [expiry, setExpiry] = useState(initialData.expiry)
  const [cvc, setCvc] = useState(initialData.cvc)
  const [busy, setBusy] = useState(false)
  const [apiError, setApiError] = useState('')

  const save = () => ({ cardName, cardNum, expiry, cvc })

  // Keep the mocked payment step isolated until a Stripe Elements flow is wired in.
  const handleSubscribe = async () => {
    setMonthlyIndividualPlan()
    const plan = useSubscriptionStore.getState()
    setBusy(true)
    setApiError('')

    try {
      const response = await fetch('/api/auth/register', jsonRequest({
          email: accountData.email,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          subscription: { amountCents: plan.amountCents, currency: plan.currency, interval: plan.interval },
        }, { method: 'POST', credentials: 'same-origin' }))

      const json = await response.json()
      if (!response.ok) {
        setApiError(json.error ?? 'Registration failed — please try again.')
        return
      }

      onNext(save())
    } catch {
      setApiError('Network error — please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className={signupUi.heading}>Payment details</div>
      <div className={signupUi.sub}>Secured by Stripe. We never store your card details.</div>

      <div className={signupUi.orderSummary}>
        <div className={signupUi.orderLabel}>Order summary</div>
        <div className={signupUi.orderRow}>
          <span className={signupUi.orderItem}>Clausule Individual</span>
          <span className={signupUi.orderValue}>$5.00 / mo</span>
        </div>
        <div className={signupUi.orderDivider} />
        <div className={signupUi.orderRow}>
          <span className={signupUi.orderTotalLabel}>Due today</span>
          <span className={signupUi.orderTotalValue}>$5.00</span>
        </div>
      </div>

      <div className={signupUi.payField}>
        <FieldLabel htmlFor="su-card-name">Name on card</FieldLabel>
        <FieldInput id="su-card-name" type="text" placeholder="Jordan Ellis" value={cardName} onChange={(event) => setCardName(event.target.value)} />
      </div>

      <div className={signupUi.payField}>
        <FieldLabel htmlFor="su-card-number">Card number</FieldLabel>
        <div className={signupUi.cardWrap}>
          <FieldInput
            id="su-card-number"
            type="text"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            value={cardNum}
            onChange={(event) => setCardNum(formatCardNumber(event.target.value))}
            className="su-card-input"
          />
          <div className={signupUi.cardIcons}>
            <div className={signupUi.cardIcon}>
              <svg viewBox="0 0 30 20" fill="none" style={{ width: 18, height: 12 }}>
                <rect width="30" height="20" rx="2" fill="#1A1FAC" />
                <text x="4" y="14" fontFamily="Arial" fontSize="9" fontWeight="900" fill="white">VISA</text>
              </svg>
            </div>
            <div className={signupUi.cardIcon}>
              <svg viewBox="0 0 30 20" style={{ width: 18, height: 12 }}>
                <circle cx="11" cy="10" r="7" fill="#EB001B" />
                <circle cx="19" cy="10" r="7" fill="#F79E1B" />
                <path d="M15 5a7 7 0 0 1 0 10 7 7 0 0 1 0-10z" fill="#FF5F00" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className={signupUi.expiryRow}>
        <div>
          <FieldLabel htmlFor="su-card-expiry">Expiry</FieldLabel>
          <FieldInput
            id="su-card-expiry"
            type="text"
            placeholder="MM / YY"
            maxLength={7}
            value={expiry}
            onChange={(event) => setExpiry(formatExpiry(event.target.value))}
          />
        </div>
        <div>
          <FieldLabel htmlFor="su-card-cvc">CVC</FieldLabel>
          <FieldInput
            id="su-card-cvc"
            type="text"
            placeholder="123"
            maxLength={4}
            value={cvc}
            onChange={(event) => setCvc(event.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      <div className={signupUi.secureNote}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, flexShrink: 0 }}>
          <rect x="3" y="7" width="10" height="8" rx="1.5" />
          <path d="M5 7V5a3 3 0 0 1 6 0v2" />
        </svg>
        256-bit SSL encryption · PCI DSS compliant · Powered by Stripe
      </div>

      {apiError && <div className={signupUi.apiError} role="alert">{apiError}</div>}

      <CtaBtn terra onClick={handleSubscribe} disabled={busy}>
        {busy ? 'Processing…' : <>Subscribe — $5/mo <ArrowIcon /></>}
      </CtaBtn>
      <BackBtn onClick={() => onBack(save())} />
      <div className={signupUi.trialNote}>
        By subscribing you agree to our <a href="#">Subscription Terms</a>. Cancel any time from your account settings.
      </div>
    </div>
  )
}
