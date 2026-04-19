import { beforeEach, describe, expect, it } from 'vitest'
import { storage } from './storage'

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('safely reads and writes expected keys', () => {
    storage.setTheme('dark')

    expect(storage.getTheme()).toBe('dark')
  })

  it('keeps pitstop choices in session storage', () => {
    storage.setPitstop('/profile', 'r')

    expect(storage.getPitstop('/profile')).toBe('r')
    expect(localStorage.getItem('clausule-ps-/profile')).toBeNull()
  })
})
