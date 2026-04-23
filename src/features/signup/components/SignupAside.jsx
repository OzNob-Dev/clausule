import { signupUi } from './signupClasses'

const INCLUDES = [
  'Brag doc with evidence rings and strength scoring',
  'Resume generator. Polished CV from your entries',
]

function PricingCard() {
  return (
    <div className={signupUi.asideCard}>
      <div className={signupUi.asideLabel}>Individual plan</div>
      <div className={signupUi.asidePrice}>
        $5<span className={signupUi.asidePricePeriod}>/mo</span>
      </div>
      <div className={signupUi.asidePriceNote}>Cancel any time from your account settings.</div>
    </div>
  )
}

function IncludesCard() {
  return (
    <div className={signupUi.asideCard}>
      <div className={signupUi.asideLabel}>What's included</div>
      <div className={signupUi.asideList}>
        {INCLUDES.map((feature) => (
          <div key={feature} className={signupUi.asideFeature}>
            <div className={signupUi.asideDot} />
            {feature}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SignupAside() {
  return (
    <div className={signupUi.asideWrap}>
      <PricingCard />
      <IncludesCard />
    </div>
  )
}
