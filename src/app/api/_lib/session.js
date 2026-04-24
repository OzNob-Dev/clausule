import { accessTokenCookie, refreshTokenCookie, sessionCookie } from './auth.js'
import { generateRefreshToken, signAccessToken, REFRESH_TOKEN_TTL_S } from './jwt.js'
import { insert } from './supabase.js'

export async function createPersistentSession({ userId, email, role, authMethod = 'unknown' }) {
  const accessToken = signAccessToken({ userId, email, role, authMethod })
  const { token: refreshToken, hash: refreshHash } = generateRefreshToken()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_S * 1000).toISOString()
  const { error } = await insert('refresh_tokens', {
    user_id: userId,
    token_hash: refreshHash,
    expires_at: expiresAt,
  }, { expectRows: 'single' })

  if (error) throw new Error('Failed to create session')
  return { accessToken, refreshToken }
}

export function appendSessionCookies(response, { accessToken, refreshToken }) {
  response.headers.append('Set-Cookie', accessTokenCookie(accessToken))
  response.headers.append('Set-Cookie', refreshTokenCookie(refreshToken))
  response.headers.append('Set-Cookie', sessionCookie())
  response.headers.set('Cache-Control', 'no-store')
  return response
}
