import { INDIVIDUAL_MONTHLY_PLAN, formatPlanAmount } from '@signup/shared/plan'
import { authPanelSummaryClassName } from '@shared/components/layout/authShellClasses'

const INCLUDES = [
  'Brag doc with evidence rings and strength scoring',
  'Resume generator. Polished CV from your entries',
]

export default function SignupPanelSummary() {
  return (
    <div className={authPanelSummaryClassName}>
      <div className="su-panel-summary-label text-[var(--cl-text-3xs)] font-extrabold uppercase tracking-[0.8px] text-[var(--cl-surface-muted-8)]">Individual plan</div>
      <div className="su-panel-summary-price text-[26px] font-extrabold leading-none text-[var(--cl-surface-paper)]">
        {formatPlanAmount(INDIVIDUAL_MONTHLY_PLAN.amountCents, INDIVIDUAL_MONTHLY_PLAN.currency)}
        <span className="su-panel-summary-period text-[var(--cl-text-md)] font-medium text-[var(--cl-surface-muted-11)]">/mo</span>
      </div>
      <ul className="su-panel-summary-list m-0 flex list-none flex-col gap-2.5 p-0">
        {INCLUDES.map(f => (
          <li key={f} className="su-panel-summary-item flex items-start gap-2.5 text-[var(--cl-text-sm)] leading-[1.5] text-[var(--cl-surface-muted-11)]">
            <div className="su-panel-summary-dot mt-[5px] h-[5px] w-[5px] shrink-0 rounded-[1px] bg-[var(--cl-accent)]" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
