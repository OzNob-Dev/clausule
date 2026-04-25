import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, apiJson, readJson } from './api'

describe('apiFetch', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('retries the original request after a successful refresh', async () => {
    fetch
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: true }), { status: 200 }))

    const res = await apiFetch('/api/private', { method: 'POST', body: 'x' })

    expect(res.status).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
    })
    expect(fetch).toHaveBeenNthCalledWith(3, '/api/private', {
      credentials: 'same-origin',
      method: 'POST',
      body: 'x',
    })
  })

  it('returns the original 401 when refresh fails', async () => {
    fetch
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))

    const res = await apiFetch('/api/private')

    expect(res.status).toBe(401)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('returns parsed json with a fallback when the body is empty', async () => {
    const result = await readJson(new Response(null, { status: 204 }), { ok: true })

    expect(result).toEqual({ ok: true })
  })

  it('throws the server error message for failed json requests', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'No thanks' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(apiJson('/api/private')).rejects.toMatchObject({
      message: 'No thanks',
      status: 400,
    })
  })
})
