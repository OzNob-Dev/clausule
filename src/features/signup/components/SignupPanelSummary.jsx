import { INDIVIDUAL_MONTHLY_PLAN, formatPlanAmount } from '@features/signup/shared/plan'
import '@features/signup/styles/signup-aside.css'

const INCLUDES = [
  'Brag doc with evidence rings and strength scoring',
  'Resume generator. Polished CV from your entries',
]

export default function SignupPanelSummary() {
  return (
    <div className="su-panel-summary">
      <div className="su-panel-summary-label">Individual plan</div>
      <div className="su-panel-summary-price">
        {formatPlanAmount(INDIVIDUAL_MONTHLY_PLAN.amountCents, INDIVIDUAL_MONTHLY_PLAN.currency)}
        <span className="su-panel-summary-period">/mo</span>
      </div>
      <ul className="su-panel-summary-list">
        {INCLUDES.map(f => (
          <li key={f} className="su-panel-summary-item">
            <div className="su-panel-summary-dot" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
