import { describe, expect, it } from 'vitest'
import { INDIVIDUAL_MONTHLY_PLAN, formatPlanAmount, formatPlanLabel } from './plan'

describe('signup plan helpers', () => {
  it('formats the fixed plan amount and label', () => {
    expect(formatPlanAmount(INDIVIDUAL_MONTHLY_PLAN.amountCents, INDIVIDUAL_MONTHLY_PLAN.currency)).toBe('$5.00')
    expect(formatPlanLabel()).toBe('$5.00 / mo')
  })
})
