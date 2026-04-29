import { describe, expect, it } from 'vitest'
import { maskEmail } from './maskEmail'

describe('maskEmail', () => {
  it('masks short and normal emails', () => {
    expect(maskEmail('a@b.com')).toBe('a***@b.com')
    expect(maskEmail('ada@example.com')).toBe('ad***@example.com')
    expect(maskEmail('')).toBe('**')
  })
})
