/**
 * POST /api/auth/refresh
 *
 * Exchanges a valid refresh token for a new access token + rotated refresh token.
 *
 * Refresh token rotation:
 *   - The submitted refresh token is immediately revoked (marked used_at).
 *   - A new refresh token is issued and its hash stored in the DB.
 *   - If the same refresh token is submitted twice (replay), both the old and
 *     new tokens are revoked (family revocation — all tokens for that user).
 *
 * The access token cookie is set on the response; the client should retry
 * the original request automatically.
 *
 * 200:  { ok: true, role: string }
 * 401:  { error: string }
 */

import { NextResponse }                    from 'next/server'
import { getRefreshToken,
         clearAuthCookies }                from '@api/_lib/auth.js'
import { hashRefreshToken }                from '@api/_lib/jwt.js'
import { beginBackendOperation }          from '@features/auth/server/backendOperation.js'
import { rotateRefreshSession }            from '@features/auth/server/refreshSession.js'
import { issueRecoverableSession }         from '@features/auth/server/recoverableSession.js'

export async function POST(request) {
  const rawToken = getRefreshToken(request)
  if (!rawToken) {
    const result = await rotateRefreshSession(rawToken)
    if (!result.session) {
      const response = NextResponse.json(result.body, { status: result.status })
      clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
      return response
    }
  }

  const operationKey = `refresh:${hashRefreshToken(rawToken)}`
  const operation = await beginBackendOperation({
    operationKey,
    operationType: 'refresh',
  })
  if (operation.error) {
    console.error('[refresh] begin operation error:', operation.error)
    const response = NextResponse.json({ error: 'Failed to rotate session' }, { status: 500 })
    clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  }
  if (operation.replay) {
    return issueRecoverableSession({
      operation,
      operationKey,
      operationType: 'refresh',
      email: operation.replay.session.email,
      userId: operation.replay.session.userId,
      body: operation.replay.body,
      status: operation.replay.status,
      session: operation.replay.session,
      failureMessage: 'Failed to rotate session',
      clearCookiesOnFailure: true,
    })
  }

  const result = await rotateRefreshSession(rawToken)

  if (result.log?.[0] === 'warn') console.warn(result.log[1])
  if (result.log?.[0] === 'error') console.error(...result.log.slice(1))
  if (!result.session) return result.clearCookies
    ? (() => {
        const response = NextResponse.json(result.body, { status: result.status })
        clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
        return response
      })()
    : NextResponse.json(result.body, { status: result.status })

  return issueRecoverableSession({
    operation,
    operationKey,
    operationType: 'refresh',
    email: result.session.email,
    userId: result.session.userId,
    body: result.body,
    status: result.status,
    session: result.session,
    failureMessage: 'Failed to rotate session',
    clearCookiesOnFailure: true,
  })
}
