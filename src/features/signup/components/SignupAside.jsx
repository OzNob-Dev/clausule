const INCLUDES = [
  'Brag doc with evidence rings and strength scoring',
  'Resume generator. Polished CV from your entries',
]

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
        {INCLUDES.map((feature) => (
          <div key={feature} className="su-aside-feature">
            <div className="su-aside-dot" />
            {feature}
          </div>
        ))}
      </div>
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
