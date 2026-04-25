import { beforeEach, describe, expect, it, vi } from 'vitest'
import { del, getAuthUser, rpc, update } from '@api/_lib/supabase.js'
import { rotateRefreshSession, revokeRefreshSession } from './refreshSession.js'
import { hashRefreshToken } from '@api/_lib/jwt.js'

vi.mock('@api/_lib/supabase.js', () => ({
  del: vi.fn(),
  getAuthUser: vi.fn(),
  rpc: vi.fn(),
  update: vi.fn(),
}))

vi.mock('./accountRepository.js', () => ({
  findProfileById: vi.fn(async () => ({
    profile: { id: 'user-1', email: 'ada@example.com', role: 'employee', is_active: true, is_deleted: false },
  })),
}))

describe('refreshSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAuthUser.mockResolvedValue({ data: { user: { email: 'ada@example.com' } }, error: null })
  })

  it('returns a session only after the refresh token is atomically consumed', async () => {
    rpc.mockResolvedValueOnce({ data: [{ user_id: 'user-1', status: 'consumed' }], error: null })

    const result = await rotateRefreshSession('refresh-token')

    expect(rpc).toHaveBeenCalledWith('consume_refresh_token', expect.objectContaining({
      p_token_hash: hashRefreshToken('refresh-token'),
      p_now: expect.any(String),
    }))
    expect(result).toEqual({
      body: { ok: true, role: 'employee' },
      status: 200,
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee' },
    })
  })

  it('revokes the token family when the DB reports a replay', async () => {
    rpc.mockResolvedValueOnce({ data: [{ user_id: 'user-7', status: 'replayed' }], error: null })
    del.mockResolvedValueOnce({ data: null, error: null })

    const result = await rotateRefreshSession('refresh-token')

    expect(del).toHaveBeenCalledWith('refresh_tokens', 'user_id=eq.user-7')
    expect(result.clearCookies).toBe(true)
    expect(result.status).toBe(401)
    expect(result.body).toEqual({ error: 'Session invalidated — please sign in again' })
    expect(result.session).toBeUndefined()
  })

  it('marks the current refresh token used during logout', async () => {
    update.mockResolvedValueOnce({ data: [{ id: 'rt-1' }], error: null })

    await revokeRefreshSession('refresh-token')

    expect(update).toHaveBeenCalledWith(
      'refresh_tokens',
      `token_hash=eq.${hashRefreshToken('refresh-token')}&used_at=is.null`,
      { used_at: expect.any(String) }
    )
  })
})
