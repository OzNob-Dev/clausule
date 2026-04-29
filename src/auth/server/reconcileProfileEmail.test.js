import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reconcileProfileEmail } from './reconcileProfileEmail.js'

vi.mock('@api/_lib/supabase.js', () => ({
  update: vi.fn(),
}))

import { update } from '@api/_lib/supabase.js'

describe('reconcileProfileEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    update.mockResolvedValue({ error: null })
  })

  it('repairs drifted emails', async () => {
    await expect(reconcileProfileEmail({ userId: 'user-1', profileEmail: 'old@example.com', authEmail: 'new@example.com' })).resolves.toEqual({ email: 'new@example.com', repaired: true })
  })
})
