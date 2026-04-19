import { beforeEach, describe, expect, it } from 'vitest'
import { storage } from './storage'

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('safely reads and writes expected keys', () => {
    storage.setEmail('jordan@example.com')
    storage.setTheme('dark')
    storage.setMfaSetup(true)

    expect(storage.getEmail()).toBe('jordan@example.com')
    expect(storage.getTheme()).toBe('dark')
    expect(storage.getMfaSetup()).toBe(true)
  })

  it('falls back to the default escalated count', () => {
    expect(storage.getEscalatedCount()).toBe(3)
  })
})
