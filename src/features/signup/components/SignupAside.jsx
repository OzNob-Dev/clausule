import { INDIVIDUAL_MONTHLY_PLAN, formatPlanAmount } from '@features/signup/shared/plan'

const INCLUDES = [
  'Brag doc with evidence rings and strength scoring',
  'Resume generator. Polished CV from your entries',
]

function PricingCard() {
  return (
    <div className="su-aside-card">
      <div className="su-aside-label">Individual plan</div>
      <div className="su-aside-price">
        {formatPlanAmount(INDIVIDUAL_MONTHLY_PLAN.amountCents, INDIVIDUAL_MONTHLY_PLAN.currency)}<span className="su-aside-price-period">/mo</span>
      </div>
      <div className="su-aside-price-note">Checkout is not collecting card details in this build.</div>
    </div>
  )
}

function IncludesCard() {
  return (
    <div className="su-aside-card">
      <div className="su-aside-label">What's included</div>
      <ul className="su-aside-feature-list">
        {INCLUDES.map((feature) => (
          <li key={feature} className="su-aside-feature">
            <div className="su-aside-dot" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SignupAside() {
  return (
    <div className="su-aside-wrap">
      <PricingCard />
      <IncludesCard />
    </div>
  )
}
