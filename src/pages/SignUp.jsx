import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Light oatmeal palette — scoped to this page only
const P = {
  canvas:    '#F5F0EA',
  card:      '#FDFCFA',
  panel:     '#EDE8E0',
  tx1:       '#1A1510',
  tx2:       '#3D3228',
  tx3:       '#5B4E42',
  tx4:       '#786B5F',
  acc:       '#D05A34',
  accDk:     '#A75743',
  accBg:     'rgba(208,90,52,0.1)',
  border:    'rgba(26,21,16,0.1)',
  borderEm:  'rgba(26,21,16,0.18)',
  r:         '10px',
  r2:        '16px',
  font:      "'DM Sans', sans-serif",
}

const STEPS = ['You', 'Plan', 'Payment', 'Done']

const INCLUDES = [
  'Brag doc with evidence rings and strength scoring',
  'Resume generator — polished CV from your entries',
  'Semantic search across all your file notes',
  'Manager-side file notes for up to 5 team members',
  'Pattern detection and cross-team insights',
]

const NEXT_STEPS = [
  { label: 'Add your first brag doc entry', desc: '— log a win from this week, with evidence.' },
  { label: 'Generate your resume', desc: '— your CV is ready the moment you have entries.' },
  { label: 'Invite your manager', desc: '— they can add file notes on their side, you see nothing confidential.' },
]

function CheckIcon({ color = P.canvas }) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke={color} strokeWidth="1.8" style={{ width: 10, height: 10 }}>
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

function CtaBtn({ onClick, terra, children, as: As = 'button', href, style: extraStyle }) {
  const base = {
    width: '100%',
    background: terra ? P.acc : P.tx1,
    color: P.canvas,
    border: 'none',
    borderRadius: P.r,
    fontSize: '15px',
    fontWeight: 800,
    padding: '15px',
    cursor: 'pointer',
    fontFamily: P.font,
    letterSpacing: '-0.2px',
    transition: 'opacity 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    ...extraStyle,
  }
  if (As === 'a') {
    return (
      <a href={href} style={base}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
      >
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} style={base}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      fontSize: '13px', fontWeight: 600, color: P.tx3,
      cursor: 'pointer', marginTop: '16px', justifyContent: 'center',
      background: 'transparent', border: 'none', fontFamily: P.font,
      transition: 'color 0.12s', width: '100%',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.color = P.tx1 }}
      onMouseLeave={(e) => { e.currentTarget.style.color = P.tx3 }}
    >
      <BackIcon /> Back
    </button>
  )
}

function FieldLabel({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: '10px', fontWeight: 700, color: P.tx3,
      textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px',
    }}>{children}</label>
  )
}

function FieldInput({ error, style: extra, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: P.card,
        border: `1.5px solid ${error ? '#C0392B' : focused ? P.tx1 : P.borderEm}`,
        borderRadius: P.r,
        padding: '12px 14px',
        fontSize: '15px',
        fontWeight: 500,
        color: P.tx1,
        outline: 'none',
        fontFamily: P.font,
        transition: 'border-color 0.18s',
        ...extra,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

// ── Step 1: Account ─────────────────────────────────────────────────────────
function Step1({ onNext }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [agreed, setAgreed]       = useState(false)
  const [errors, setErrors]       = useState({})

  const validate = () => {
    const e = {}
    if (!firstName.trim()) e.firstName = true
    if (!email.trim())     e.email = true
    if (!password)         e.password = true
    if (!agreed)           e.agreed = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = () => {
    if (validate()) onNext({ firstName, lastName, email, password })
  }

  return (
    <div>
      <div style={{ fontSize: '30px', fontWeight: 900, color: P.tx1, letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: '6px' }}>
        Create your account
      </div>
      <div style={{ fontSize: '14px', color: P.tx3, lineHeight: 1.65, marginBottom: '32px' }}>
        Your brag doc, your file. Takes about 2 minutes.
      </div>

      {/* Social proof */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        marginBottom: '32px', padding: '14px 18px',
        background: P.panel, borderRadius: P.r2,
      }}>
        <div style={{ display: 'flex' }}>
          {[
            ['SC', P.tx1],
            ['PL', '#5B4E42'],
            ['AM', '#3D3228'],
          ].map(([initials, bg], i) => (
            <div key={initials} style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: `2px solid ${P.canvas}`,
              background: bg, color: P.canvas,
              fontSize: '9px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              marginLeft: i === 0 ? 0 : '-8px',
            }}>
              {initials}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: P.tx2, lineHeight: 1.45 }}>
          Join <span style={{ color: P.tx1, fontWeight: 700 }}>214 managers and employees</span> already using Clausule to build better careers.
        </div>
      </div>

      {/* Name row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>First name</FieldLabel>
          <FieldInput
            type="text" placeholder="Jordan" value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setErrors(ev => ({ ...ev, firstName: false })) }}
            error={errors.firstName}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Last name</FieldLabel>
          <FieldInput
            type="text" placeholder="Ellis" value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      {/* Email */}
      <div style={{ marginBottom: '18px' }}>
        <FieldLabel>Work email</FieldLabel>
        <FieldInput
          type="email" placeholder="you@company.com" value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors(ev => ({ ...ev, email: false })) }}
          error={errors.email}
        />
        <div style={{ fontSize: '11px', fontWeight: 500, color: P.tx4, marginTop: '5px' }}>
          We'll send your receipt and setup link here.
        </div>
      </div>

      {/* Password */}
      <div style={{ marginBottom: '24px' }}>
        <FieldLabel>Password</FieldLabel>
        <FieldInput
          type="password" placeholder="At least 8 characters" value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors(ev => ({ ...ev, password: false })) }}
          error={errors.password}
        />
      </div>

      {/* Terms */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: P.tx2, lineHeight: 1.5,
        }}>
          <input
            type="checkbox" checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); setErrors(ev => ({ ...ev, agreed: false })) }}
            style={{ marginTop: '3px', accentColor: P.tx1, flexShrink: 0 }}
          />
          I agree to Clausule's{' '}
          <a href="#" style={{ color: P.tx1 }}>Terms of Service</a>{' '}and{' '}
          <a href="#" style={{ color: P.tx1 }}>Privacy Policy</a>
        </label>
        {errors.agreed && (
          <div style={{ fontSize: '11px', color: '#C0392B', marginTop: '4px' }}>Please agree to continue.</div>
        )}
      </div>

      <CtaBtn onClick={handleContinue}>Continue <ArrowIcon /></CtaBtn>
      <div style={{ fontSize: '11px', fontWeight: 500, color: P.tx4, textAlign: 'center', marginTop: '14px' }}>
        No card required until the next step.
      </div>
    </div>
  )
}

// ── Step 2: Plan ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    badge: null,
    desc: 'Your brag doc, unlimited entries, CV generator. No expiry.',
    amount: '$0',
    period: 'forever',
    saves: null,
  },
  {
    id: 'monthly',
    name: 'Individual',
    badge: 'Most popular',
    badgePopular: true,
    desc: 'Everything in Free, plus semantic search, pattern detection, and manager file notes.',
    amount: '$9',
    period: 'per month',
    saves: null,
  },
  {
    id: 'annual',
    name: 'Individual',
    badge: 'Annual',
    badgePopular: false,
    desc: 'Everything in Individual, billed yearly. Two months free.',
    amount: '$7',
    period: 'per month',
    saves: 'Save $24/yr',
  },
]

function Step2({ onNext, onBack }) {
  const [selected, setSelected] = useState('monthly')

  const handleContinue = () => {
    if (selected === 'free') {
      onNext({ plan: 'free', skipPayment: true })
    } else {
      onNext({ plan: selected, skipPayment: false })
    }
  }

  const ctaLabel = selected === 'free'
    ? 'Continue with Free'
    : selected === 'monthly'
    ? 'Continue with Individual — $9/mo'
    : 'Continue with Individual — $7/mo'

  return (
    <div>
      <div style={{ fontSize: '30px', fontWeight: 900, color: P.tx1, letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: '6px' }}>
        Choose your plan
      </div>
      <div style={{ fontSize: '14px', color: P.tx3, lineHeight: 1.65, marginBottom: '32px' }}>
        Start free, upgrade when you're ready. Cancel any time.
      </div>

      {/* Plan cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        {PLANS.map((plan) => {
          const sel = selected === plan.id
          return (
            <div key={plan.id} onClick={() => setSelected(plan.id)} style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '18px 20px',
              background: sel ? P.canvas : P.card,
              border: `1.5px solid ${sel ? P.tx1 : P.borderEm}`,
              borderRadius: P.r2,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              {/* Radio */}
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: `1.5px solid ${sel ? P.tx1 : P.borderEm}`,
                background: sel ? P.tx1 : 'transparent',
                flexShrink: 0, marginTop: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {sel && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: P.canvas }} />}
              </div>
              {/* Body */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: P.tx1 }}>{plan.name}</span>
                  {plan.badge && (
                    <span style={{
                      fontSize: '10px', fontWeight: 800, padding: '2px 8px',
                      borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.4px',
                      background: plan.badgePopular ? 'rgba(208,90,52,0.12)' : 'rgba(26,21,16,0.08)',
                      color: plan.badgePopular ? P.accDk : P.tx2,
                    }}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: P.tx3, lineHeight: 1.55 }}>{plan.desc}</div>
              </div>
              {/* Price */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, paddingTop: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: P.tx1, letterSpacing: '-0.5px', lineHeight: 1 }}>{plan.amount}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: P.tx4, marginTop: '2px' }}>{plan.period}</span>
                {plan.saves && <span style={{ fontSize: '10px', fontWeight: 700, color: P.accDk, marginTop: '3px' }}>{plan.saves}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* What's included */}
      <div style={{ background: P.panel, borderRadius: P.r2, padding: '18px 20px', marginBottom: '28px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: P.tx3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
          Everything in Individual includes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INCLUDES.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: P.tx2, lineHeight: 1.5 }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: P.tx1, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '1px',
              }}>
                <CheckIcon />
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>

      <CtaBtn onClick={handleContinue}>{ctaLabel} <ArrowIcon /></CtaBtn>
      <BackBtn onClick={onBack} />
    </div>
  )
}

// ── Step 3: Payment ───────────────────────────────────────────────────────────
function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val) {
  let v = val.replace(/\D/g, '').slice(0, 4)
  if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2)
  return v
}

function trialEndDate() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Step3({ plan, onNext, onBack }) {
  const [cardName, setCardName]   = useState('')
  const [cardNum, setCardNum]     = useState('')
  const [expiry, setExpiry]       = useState('')
  const [cvc, setCvc]             = useState('')

  const orderAmount = plan === 'annual' ? '$84.00 / yr' : '$9.00 / mo'

  return (
    <div>
      <div style={{ fontSize: '30px', fontWeight: 900, color: P.tx1, letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: '6px' }}>
        Payment details
      </div>
      <div style={{ fontSize: '14px', color: P.tx3, lineHeight: 1.65, marginBottom: '32px' }}>
        Secured by Stripe. We never store your card details.
      </div>

      {/* Order summary */}
      <div style={{ background: P.panel, borderRadius: P.r2, padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: P.tx3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
          Order summary
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: P.tx2, fontWeight: 500 }}>Clausule Individual</span>
          <span style={{ fontSize: '13px', color: P.tx1, fontWeight: 700 }}>{orderAmount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: P.tx2, fontWeight: 500 }}>14-day free trial</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: P.accDk }}>−{plan === 'annual' ? '$84.00' : '$9.00'}</span>
        </div>
        <div style={{ height: '1px', background: P.borderEm, margin: '12px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: P.tx1 }}>Due today</span>
          <span style={{ fontSize: '15px', fontWeight: 900, color: P.tx1 }}>$0.00</span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: P.tx4, marginTop: '10px' }}>
          Your card won't be charged until your trial ends on{' '}
          <strong style={{ color: P.tx2 }}>{trialEndDate()}</strong>. Cancel any time before then.
        </div>
      </div>

      {/* Name on card */}
      <div style={{ marginBottom: '18px' }}>
        <FieldLabel>Name on card</FieldLabel>
        <FieldInput type="text" placeholder="Jordan Ellis" value={cardName} onChange={(e) => setCardName(e.target.value)} />
      </div>

      {/* Card number */}
      <div style={{ marginBottom: '18px', position: 'relative' }}>
        <FieldLabel>Card number</FieldLabel>
        <div style={{ position: 'relative' }}>
          <FieldInput
            type="text" placeholder="1234 5678 9012 3456" maxLength={19}
            value={cardNum}
            onChange={(e) => setCardNum(formatCardNumber(e.target.value))}
            style={{ paddingRight: '88px' }}
          />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* Visa */}
            <div style={{ width: '30px', height: '20px', borderRadius: '3px', background: P.panel, border: `1px solid ${P.borderEm}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 30 20" fill="none" style={{ width: 18, height: 12 }}>
                <rect width="30" height="20" rx="2" fill="#1A1FAC" />
                <text x="4" y="14" fontFamily="Arial" fontSize="9" fontWeight="900" fill="white">VISA</text>
              </svg>
            </div>
            {/* Mastercard */}
            <div style={{ width: '30px', height: '20px', borderRadius: '3px', background: P.panel, border: `1px solid ${P.borderEm}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Expiry</FieldLabel>
          <FieldInput
            type="text" placeholder="MM / YY" maxLength={7}
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>CVC</FieldLabel>
          <FieldInput type="text" placeholder="123" maxLength={4} value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>

      {/* Secure note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', fontWeight: 600, color: P.tx4, marginBottom: '20px' }}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, flexShrink: 0 }}>
          <rect x="3" y="7" width="10" height="8" rx="1.5" />
          <path d="M5 7V5a3 3 0 0 1 6 0v2" />
        </svg>
        256-bit SSL encryption · PCI DSS compliant · Powered by Stripe
      </div>

      <CtaBtn terra onClick={onNext}>Start free trial <ArrowIcon /></CtaBtn>
      <BackBtn onClick={onBack} />
      <div style={{ fontSize: '11px', fontWeight: 500, color: P.tx4, textAlign: 'center', marginTop: '14px', lineHeight: 1.6 }}>
        By starting your trial you agree to our <a href="#" style={{ color: P.tx3 }}>Subscription Terms</a>. You'll receive an email reminder before your trial ends.
      </div>
    </div>
  )
}

// ── Step 4: Done ─────────────────────────────────────────────────────────────
function Step4({ email }) {
  const navigate = useNavigate()
  return (
    <div>
      {/* Success ring */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: P.tx1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <svg viewBox="0 0 34 34" fill="none" stroke={P.canvas} strokeWidth="2.5" strokeLinecap="round" style={{ width: 34, height: 34 }}>
          <polyline points="7 17 13 23 27 11" />
        </svg>
      </div>

      <div style={{ fontSize: '30px', fontWeight: 900, color: P.tx1, letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: '6px' }}>
        You're in.
      </div>
      <div style={{ fontSize: '14px', color: P.tx3, lineHeight: 1.65, marginBottom: '28px' }}>
        Your Clausule account is ready. We've sent a confirmation to{' '}
        <strong style={{ color: P.tx1 }}>{email || 'you@company.com'}</strong>.
        {' '}Your 14-day trial starts now — no charge until it ends.
      </div>

      {/* Next steps */}
      <div style={{ background: P.panel, borderRadius: P.r2, padding: '18px 20px', marginBottom: '28px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: P.tx3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
          What to do next
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {NEXT_STEPS.map((step) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: P.tx2, lineHeight: 1.5 }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: P.acc, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '1px',
              }}>
                <CheckIcon />
              </div>
              <div><strong>{step.label}</strong> {step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBtn onClick={() => navigate('/brag')}>
        Go to my brag doc <ArrowIcon />
      </CtaBtn>
      <div style={{ fontSize: '11px', fontWeight: 500, color: P.tx4, textAlign: 'center', marginTop: '14px' }}>
        Questions? <a href="mailto:help@clausule.com" style={{ color: P.tx3 }}>help@clausule.com</a>
      </div>
    </div>
  )
}

// ── Progress indicator ────────────────────────────────────────────────────────
function Progress({ step }) {
  return (
    <div style={{ position: 'relative', zIndex: 10, padding: '20px 48px 0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
        {STEPS.map((label, i) => {
          const n = i + 1
          const done   = n < step
          const active = n === step
          return (
            <div key={label} style={{ display: 'contents' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800,
                  background: done ? P.tx1 : active ? P.acc : P.panel,
                  color: done ? P.canvas : active ? '#fff' : P.tx3,
                  border: `1.5px solid ${done ? P.tx1 : active ? P.acc : P.borderEm}`,
                  flexShrink: 0,
                  transition: 'all 0.3s',
                }}>
                  {done
                    ? <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12 }}><polyline points="3 8 6 11 13 4" /></svg>
                    : n
                  }
                </div>
                <div style={{
                  fontSize: '10px', fontWeight: 700,
                  color: active ? P.tx2 : done ? P.tx3 : P.tx4,
                  textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap',
                }}>
                  {label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: '1.5px',
                  background: done ? P.tx1 : P.borderEm,
                  margin: '0 8px', marginBottom: '18px',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Aside panel (step 1 only) ─────────────────────────────────────────────────
function Aside() {
  return (
    <div style={{ flex: 1, paddingTop: '58px' }}>
      <div style={{
        background: P.card, border: `1px solid ${P.borderEm}`,
        borderRadius: P.r2, padding: '20px 22px', marginBottom: '14px',
      }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: P.tx4, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
          What people say
        </div>
        <div style={{ fontSize: '14px', fontStyle: 'italic', color: P.tx2, lineHeight: 1.7, borderLeft: `2px solid ${P.tx1}`, paddingLeft: '14px' }}>
          Finally, a tool that feels like it's on my side. My brag doc went from a blank document I never updated to something I actually look forward to adding to.
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: P.tx3, marginTop: '10px' }}>
          — Software engineer, 4 years exp.
        </div>
      </div>
      <div style={{
        background: P.card, border: `1px solid ${P.borderEm}`,
        borderRadius: P.r2, padding: '20px 22px',
      }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: P.tx4, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
          What's included
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            'Brag doc with evidence rings',
            'One-tap CV generator',
            'Semantic search across notes',
            '14-day free trial, no card needed to start',
          ].map((feat) => (
            <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: P.tx2, lineHeight: 1.5 }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: P.tx1, flexShrink: 0, marginTop: '5px' }} />
              {feat}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────
export default function SignUp() {
  const [step, setStep]       = useState(1)
  const [userData, setUserData] = useState({})
  const [planData, setPlanData] = useState({})

  const goStep = (n) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep1 = (data) => {
    setUserData(data)
    goStep(2)
  }

  const handleStep2 = (data) => {
    setPlanData(data)
    if (data.skipPayment) {
      goStep(4)
    } else {
      goStep(3)
    }
  }

  return (
    <div style={{
      fontFamily: P.font,
      background: P.canvas,
      color: P.tx1,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Faint ruled lines */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 47px, rgba(26,21,16,0.028) 47px, rgba(26,21,16,0.028) 48px)',
      }} />

      {/* Topbar */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        borderBottom: `1px solid ${P.border}`,
        background: P.canvas,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '28px', height: '28px', background: P.tx1,
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 18 18" fill="none" stroke={P.canvas} strokeWidth="2.2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
              <path d="M3 5h12M3 9h8M3 13h5" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: P.tx1, letterSpacing: '-0.3px' }}>clausule</span>
        </div>
        <Link to="/" style={{ fontSize: '13px', fontWeight: 600, color: P.tx3, textDecoration: 'none' }}>
          Already have an account?{' '}
          <span style={{ color: P.accDk }}>Sign in</span>
        </Link>
      </div>

      {/* Progress */}
      {step < 4 && <Progress step={step} />}

      {/* Main */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', padding: '48px 24px 80px',
      }}>
        <div style={{
          display: 'flex', gap: '48px', alignItems: 'flex-start',
          maxWidth: step === 1 ? '480px' : '900px', width: '100%',
        }}>
          <div style={{ width: '100%' }}>
            {step === 1 && <Step1 onNext={handleStep1} />}
            {step === 2 && <Step2 onNext={handleStep2} onBack={() => goStep(1)} />}
            {step === 3 && (
              <Step3
                plan={planData.plan}
                onNext={() => goStep(4)}
                onBack={() => goStep(2)}
              />
            )}
            {step === 4 && <Step4 email={userData.email} />}
          </div>

          {/* Aside — only on step 1, desktop only */}
          {step === 1 && (
            <div style={{ flex: 1, display: 'none' }} className="signup-aside">
              <Aside />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .signup-aside { display: block !important; } }
      `}</style>
    </div>
  )
}
