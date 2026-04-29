import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendCodeEmail } from './sendCodeEmail.js'

vi.mock('@shared/utils/api', () => ({
  apiJson: vi.fn(),
  jsonRequest: vi.fn((body, init) => ({ body, init })),
}))

import { apiJson, jsonRequest } from '@shared/utils/api'

describe('sendCodeEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiJson.mockResolvedValue({ ok: true })
  })

  it('posts the email without retrying unauthorized responses', async () => {
    await sendCodeEmail('ada@example.com')

    expect(jsonRequest).toHaveBeenCalledWith({ email: 'ada@example.com' }, { method: 'POST' })
    expect(apiJson).toHaveBeenCalledWith('/api/auth/send-code', { body: { email: 'ada@example.com' }, init: { method: 'POST' } }, { retryOnUnauthorized: false })
  })
})
