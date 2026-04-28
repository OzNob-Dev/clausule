export const INDIVIDUAL_MONTHLY_PLAN = {
  id: 'individual-monthly',
  label: 'Clausule Individual',
  amountCents: 500,
  currency: 'AUD',
  interval: 'month',
} as const

export function formatPlanAmount(amountCents: number, currency: string) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
  }).format(amountCents / 100)
}

export function formatPlanLabel(plan = INDIVIDUAL_MONTHLY_PLAN) {
  return `${formatPlanAmount(plan.amountCents, plan.currency)} / ${plan.interval === 'month' ? 'mo' : plan.interval}`
}
