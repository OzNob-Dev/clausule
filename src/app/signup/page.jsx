'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { validateEmail } from '@/utils/emailValidation'
import { storage } from '@/utils/storage'
import { sendCodeEmail } from '@/utils/sendCodeEmail'
import { SignupProvider, useSignup } from '@/contexts/SignupContext'
import '@/styles/signup.css'

const STEPS = ['Account', 'Payment', 'Done']

const INCLUDES = [
  'Brag doc with evidence rings and strength scoring',
  'Resume generator. Polished CV from your entries',
]

const NEXT_STEPS = [
  { label: 'Add your first brag doc entry', desc: '— log a win from this week, with evidence.' },
  { label: 'Generate your resume', desc: '— your CV is ready the moment you have entries.' },
  { label: 'Invite your manager', desc: '— they can add file notes on their side, you see nothing confidential.' },
]

function CheckIcon({ dark }) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke={dark ? '#1A1510' : '#F5F0EA'} strokeWidth="1.8" style={{ width: 10, height: 10 }}>
      <polyline points="2 5 4 7 8 3" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 16, height: 16 }}>
      <line x1="3" y1="8" x2="13" y2="8" />
      <polyline points="9 4 13 8 9 12" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
      <polyline points="10 4 6 8 10 12" />
    </svg>
  )
}

function CtaBtn({ onClick, terra, children, as: As = 'button', href }) {
  const cls = `su-cta-btn${terra ? ' su-cta-btn--terra' : ''}`
  if (As === 'a') {
    return <a href={href} className={cls}>{children}</a>
  }
  return <button onClick={onClick} className={cls}>{children}</button>
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="su-back-btn">
      <BackIcon /> Back
    </button>
  )
}

function FieldLabel({ children }) {
  return <label className="su-field-label">{children}</label>
}

function FieldInput({ error, onBlur, style: extra, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      className={`su-input${error ? ' su-input--error' : ''}${focused ? ' su-input--focused' : ''}`}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { setFocused(false); onBlur?.(e) }}
    />
  )
}

// ── Step 1: Account + Plan ────────────────────────────────────────
function Step1({ onNext, initialData }) {
  const [firstName, setFirstName] = useState(initialData.firstName)
  const [lastName, setLastName]   = useState(initialData.lastName)
  const [email, setEmail]         = useState(initialData.email)
  const [emailDirty, setEmailDirty] = useState(false)
  const [agreed, setAgreed]       = useState(initialData.agreed)
  const [nameError, setNameError] = useState(false)
  const [agreedError, setAgreedError] = useState(false)

  const emailResult = validateEmail(email)
  const showEmailFeedback = emailDirty && email.trim().length > 0

  const acceptSuggestion = () => {
    setEmail(emailResult.suggestion)
    setEmailDirty(false)
  }

  const handleContinue = () => {
    const noName   = !firstName.trim()
    const badEmail = !emailResult.valid && !emailResult.suggestion
    const noAgreed = !agreed
    setNameError(noName)
    setAgreedError(noAgreed)
    setEmailDirty(true)
    if (!noName && !badEmail && !noAgreed) {
      onNext({ firstName, lastName, email: emailResult.suggestion ?? email.trim() })
    }
  }

  return (
    <div>
      <div className="su-step-heading">Create your account</div>
      <div className="su-step-sub">Your brag doc, your file. Takes about 2 minutes.</div>

      {/* Name row */}
      <div className="su-name-row">
        <div className="su-name-col">
          <FieldLabel>First name</FieldLabel>
          <FieldInput
            type="text" placeholder="Jordan" value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setNameError(false) }}
            error={nameError}
          />
        </div>
        <div className="su-name-col">
          <FieldLabel>Last name</FieldLabel>
          <FieldInput
            type="text" placeholder="Ellis" value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      {/* Email */}
      <div className="su-field">
        <FieldLabel>Email</FieldLabel>
        <FieldInput
          type="email" placeholder="you@email.com" value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailDirty(true) }}
          onBlur={() => setEmailDirty(true)}
          error={showEmailFeedback && !!emailResult.error}
          aria-invalid={showEmailFeedback && !emailResult.valid}
          aria-describedby="su-email-hint"
        />
        <div id="su-email-hint">
          {showEmailFeedback && emailResult.error ? (
            <span className="su-field-hint su-field-hint--error" role="alert">{emailResult.error}</span>
          ) : showEmailFeedback && emailResult.suggestion ? (
            <span className="su-field-hint su-field-hint--suggest" role="alert">
              Did you mean{' '}
              <button type="button" className="su-suggest-btn" onClick={acceptSuggestion}>
                {emailResult.suggestion}
              </button>
              ?
            </span>
          ) : (
            <span className="su-field-hint">We'll send a verification code here each time you sign in.</span>
          )}
        </div>
      </div>

      {/* Terms */}
      <div className="su-terms">
        <label className="su-terms-label">
          <input
            type="checkbox" checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); setAgreedError(false) }}
          />
          I agree to Clausule's{' '}
          <a href="#">Terms of Service</a>{' '}and{' '}
          <a href="#">Privacy Policy</a>
        </label>
        {agreedError && (
          <div className="su-terms-error">Please agree to continue.</div>
        )}
      </div>

      <CtaBtn onClick={handleContinue}>Continue to payment <ArrowIcon /></CtaBtn>
    </div>
  )
}

// ── Step 2: Payment ───────────────────────────────────────────────
function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val) {
  let v = val.replace(/\D/g, '').slice(0, 4)
  if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2)
  return v
}

function Step2({ onNext, onBack, initialData, accountData }) {
  const [cardName, setCardName] = useState(initialData.cardName)
  const [cardNum, setCardNum]   = useState(initialData.cardNum)
  const [expiry, setExpiry]     = useState(initialData.expiry)
  const [cvc, setCvc]           = useState(initialData.cvc)
  const [busy, setBusy]         = useState(false)
  const [apiError, setApiError] = useState('')

  const save = () => ({ cardName, cardNum, expiry, cvc })

  /**
   * In production this should use Stripe.js Elements to tokenise the card
   * and obtain a real PaymentMethod ID — never send raw card data to your server.
   * The paymentMethodId below is a placeholder; replace with the value returned
   * by stripe.createPaymentMethod() in a Stripe Elements integration.
   */
  const handleSubscribe = async () => {
    setBusy(true)
    setApiError('')
    try {
      const res = await fetch('/api/payments/subscribe', {
        method:      'POST',
        credentials: 'same-origin',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: 'pm_card_visa', // replace with Stripe.js token in production
          email:           accountData.email,
          firstName:       accountData.firstName,
          lastName:        accountData.lastName,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setApiError(json.error ?? 'Payment failed — please try again.')
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
      <div className="su-step-heading">Payment details</div>
      <div className="su-step-sub">Secured by Stripe. We never store your card details.</div>

      {/* Order summary */}
      <div className="su-order-summary">
        <div className="su-order-label">Order summary</div>
        <div className="su-order-row">
          <span className="su-order-item">Clausule Individual</span>
          <span className="su-order-val">$5.00 / mo</span>
        </div>
        <div className="su-order-divider" />
        <div className="su-order-row">
          <span className="su-order-total-label">Due today</span>
          <span className="su-order-total-val">$5.00</span>
        </div>
      </div>

      {/* Name on card */}
      <div className="su-pay-field">
        <FieldLabel>Name on card</FieldLabel>
        <FieldInput type="text" placeholder="Jordan Ellis" value={cardName} onChange={(e) => setCardName(e.target.value)} />
      </div>

      {/* Card number */}
      <div className="su-pay-field su-card-input-wrap">
        <FieldLabel>Card number</FieldLabel>
        <div className="su-card-input-wrap">
          <FieldInput
            type="text" placeholder="1234 5678 9012 3456" maxLength={19}
            value={cardNum}
            onChange={(e) => setCardNum(formatCardNumber(e.target.value))}
            style={{ paddingRight: '88px' }}
          />
          <div className="su-card-icons">
            <div className="su-card-icon">
              <svg viewBox="0 0 30 20" fill="none" style={{ width: 18, height: 12 }}>
                <rect width="30" height="20" rx="2" fill="#1A1FAC" />
                <text x="4" y="14" fontFamily="Arial" fontSize="9" fontWeight="900" fill="white">VISA</text>
              </svg>
            </div>
            <div className="su-card-icon">
              <svg viewBox="0 0 30 20" style={{ width: 18, height: 12 }}>
                <circle cx="11" cy="10" r="7" fill="#EB001B" />
                <circle cx="19" cy="10" r="7" fill="#F79E1B" />
                <path d="M15 5a7 7 0 0 1 0 10 7 7 0 0 1 0-10z" fill="#FF5F00" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Expiry + CVC */}
      <div className="su-expiry-cvc-row">
        <div>
          <FieldLabel>Expiry</FieldLabel>
          <FieldInput
            type="text" placeholder="MM / YY" maxLength={7}
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          />
        </div>
        <div>
          <FieldLabel>CVC</FieldLabel>
          <FieldInput type="text" placeholder="123" maxLength={4} value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>

      {/* Secure note */}
      <div className="su-secure-note">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, flexShrink: 0 }}>
          <rect x="3" y="7" width="10" height="8" rx="1.5" />
          <path d="M5 7V5a3 3 0 0 1 6 0v2" />
        </svg>
        256-bit SSL encryption · PCI DSS compliant · Powered by Stripe
      </div>

      {apiError && (
        <div className="su-api-error" role="alert">{apiError}</div>
      )}
      <CtaBtn terra onClick={handleSubscribe} disabled={busy}>
        {busy ? 'Processing…' : <>Subscribe — $5/mo <ArrowIcon /></>}
      </CtaBtn>
      <BackBtn onClick={() => { onBack(save()) }} />
      <div className="su-trial-note">
        By subscribing you agree to our <a href="#">Subscription Terms</a>. Cancel any time from your account settings.
      </div>
    </div>
  )
}

// ── Step 3: Done ─────────────────────────────────────────────────
function Step3({ email }) {
  const router       = useRouter()
  const [busy, setBusy] = useState(false)

  const handleEnter = async () => {
    setBusy(true)
    try {
      // Store email so the MFA setup page can display it.
      storage.setEmail(email)
      // Send OTP so the user can complete sign-in via the standard flow.
      await sendCodeEmail(email)
      router.push('/mfa-setup')
    } catch {
      // On failure fall back to sign-in page where the user can retry.
      router.push('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="su-success-ring">
        <svg viewBox="0 0 34 34" fill="none" stroke="#F5F0EA" strokeWidth="2.5" strokeLinecap="round" style={{ width: 34, height: 34 }}>
          <polyline points="7 17 13 23 27 11" />
        </svg>
      </div>

      <div className="su-step-heading">You're in.</div>
      <div className="su-step-sub su-done-sub">
        Your Clausule account is ready. We've sent a confirmation to{' '}
        <strong>{email || 'you@email.com'}</strong>.
      </div>

      {/* Next steps */}
      <div className="su-includes">
        <div className="su-includes-label">What to do next</div>
        <div className="su-includes-list">
          {NEXT_STEPS.map((step) => (
            <div key={step.label} className="su-include-item">
              <div className="su-check-circle su-check-circle--acc"><CheckIcon /></div>
              <div><strong>{step.label}</strong> {step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBtn onClick={handleEnter} disabled={busy}>
        {busy ? 'Sending code…' : 'Go to my dashboard'} <ArrowIcon />
      </CtaBtn>
      <div className="su-questions-note">
        Questions? <a href="mailto:help@clausule.com">help@clausule.com</a>
      </div>
    </div>
  )
}

// ── Progress indicator ────────────────────────────────────────────
function Progress({ step }) {
  return (
    <div className="su-progress">
      <div className={`su-progress-inner${step === 1 ? ' su-progress-inner--wide' : ' su-progress-inner--narrow'}`}>
        {STEPS.map((label, i) => {
          const n = i + 1
          const done   = n < step
          const active = n === step
          return (
            <div key={label} className="su-step-wrap">
              <div className="su-step-item">
                <div className={`su-step-circle${done ? ' su-step-circle--done' : active ? ' su-step-circle--active' : ''}`}>
                  {done
                    ? <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12 }}><polyline points="3 8 6 11 13 4" /></svg>
                    : n
                  }
                </div>
                <div className={`su-step-label${active ? ' su-step-label--active' : done ? ' su-step-label--done' : ''}`}>
                  {label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`su-step-connector${done ? ' su-step-connector--done' : ''}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Aside cards ───────────────────────────────────────────────────
function PricingCard() {
  return (
    <div className="su-aside-card">
      <div className="su-aside-label">Individual plan</div>
      <div className="su-aside-price">
        $5<span className="su-aside-price-period">/mo</span>
      </div>
      <div className="su-aside-price-note">Cancel any time from your account settings.</div>
    </div>
  )
}

function IncludesCard() {
  return (
    <div className="su-aside-card">
      <div className="su-aside-label">What's included</div>
      <div className="su-aside-feature-list">
        {INCLUDES.map((feat) => (
          <div key={feat} className="su-aside-feature">
            <div className="su-aside-dot" />
            {feat}
          </div>
        ))}
      </div>
    </div>
  )
}

function Aside() {
  return (
    <div className="su-aside-wrap">
      <PricingCard />
      <IncludesCard />
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────
function SignUpInner() {
  const searchParams = useSearchParams()
  const { step, setStep, step1Data, setStep1Data, step2Data, setStep2Data, completePayment } = useSignup()

  // Hydrate email from query param on first render only
  useEffect(() => {
    const prefill = decodeURIComponent(searchParams.get('email') ?? '')
    if (prefill) setStep1Data((prev) => ({ ...prev, email: prefill }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const goStep = (n) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep1 = (data) => {
    setStep1Data(data)
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ')
    setStep2Data((prev) => ({ ...prev, cardName: prev.cardName || fullName }))
    goStep(2)
  }

  return (
    <div className="su-page">
      <div className="su-bg-lines" aria-hidden="true" />

      {/* Topbar */}
      <div className="su-topbar">
        <div className="su-topbar-brand">
          <div className="su-logo-bug">
            <svg viewBox="0 0 18 18" fill="none" stroke="#F5F0EA" strokeWidth="2.2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
              <path d="M3 5h12M3 9h8M3 13h5" />
            </svg>
          </div>
          <span className="su-brand-name">clausule</span>
        </div>
        <Link href="/" className="su-signin-link">
          Already have an account?{' '}
          <span>Sign in</span>
        </Link>
      </div>

      {/* Progress */}
      {step < 3 && <Progress step={step} />}

      {/* Main */}
      <div className="su-main">
        {step === 1 ? (
          <div className="su-step1-layout">
            <div className="su-step1-form">
              <Step1 onNext={handleStep1} initialData={step1Data} />
            </div>
            <div className="su-aside">
              <Aside />
            </div>
          </div>
        ) : (
          <div className="su-narrow">
            {step === 2 && (
              <Step2
                onNext={(data) => { setStep2Data(data); completePayment() }}
                onBack={(data) => { setStep2Data(data); goStep(1) }}
                initialData={step2Data}
                accountData={step1Data}
              />
            )}
            {step === 3 && <Step3 email={step1Data.email} />}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SignUp() {
  return (
    <SignupProvider>
      <Suspense>
        <SignUpInner />
      </Suspense>
    </SignupProvider>
  )
}
