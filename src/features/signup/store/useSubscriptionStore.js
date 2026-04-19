'use client'

import { create } from 'zustand'

export const MONTHLY_INDIVIDUAL_AMOUNT_CENTS = 500
export const MONTHLY_INDIVIDUAL_CURRENCY = 'AUD'
export const MONTHLY_INDIVIDUAL_INTERVAL = 'month'

export const useSubscriptionStore = create((set) => ({
  amountCents: MONTHLY_INDIVIDUAL_AMOUNT_CENTS,
  currency: MONTHLY_INDIVIDUAL_CURRENCY,
  interval: MONTHLY_INDIVIDUAL_INTERVAL,
  setMonthlyIndividualPlan: () =>
    set({
      amountCents: MONTHLY_INDIVIDUAL_AMOUNT_CENTS,
      currency: MONTHLY_INDIVIDUAL_CURRENCY,
      interval: MONTHLY_INDIVIDUAL_INTERVAL,
    }),
}))
