import { describe, expect, it } from 'vitest'
import { formatCardNumber, formatExpiry } from './signupFormatting'

describe('signup formatting utilities', () => {
  it('formats card numbers in groups of four digits', () => {
    expect(formatCardNumber('4242-4242 abc 4242 4242 9999')).toBe('4242 4242 4242 4242')
  })

  it('formats expiry dates as MM / YY', () => {
    expect(formatExpiry('1229')).toBe('12 / 29')
    expect(formatExpiry('1a')).toBe('1')
  })
})
