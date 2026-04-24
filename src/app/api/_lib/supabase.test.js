import { afterEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

afterEach(() => {
  vi.resetModules()
  process.env = { ...originalEnv }
})

describe('supabase config', () => {
  it('fails fast in production when required env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    process.env.NODE_ENV = 'production'

    await expect(import('./supabase.js')).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  })
})
