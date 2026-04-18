import { describe, expect, it } from 'vitest'
import { validateEmail } from './emailValidation'

describe('validateEmail', () => {
  it('accepts structurally valid email addresses', () => {
    expect(validateEmail('jordan@example.com')).toEqual({
      valid: true,
      error: null,
      suggestion: null,
    })
  })

  it('returns helpful errors for missing email parts', () => {
    expect(validateEmail('')).toMatchObject({ valid: false, suggestion: null })
    expect(validateEmail('jordan.example.com')).toMatchObject({ valid: false, error: expect.stringContaining('@') })
    expect(validateEmail('@example.com')).toMatchObject({ valid: false, error: expect.stringContaining('before') })
    expect(validateEmail('jordan@')).toMatchObject({ valid: false, error: expect.stringContaining('after') })
  })

  it('suggests common domain typo corrections', () => {
    expect(validateEmail('jordan@gmial.com')).toEqual({
      valid: false,
      error: null,
      suggestion: 'jordan@gmail.com',
    })
  })
})
