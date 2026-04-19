/**
 * GET|POST /api/auth/sso/[provider]/callback
 *
 * Handles OAuth callbacks from Google, Microsoft, and Apple.
 */

import { NextResponse } from 'next/server'
import { createPersistentSession, appendSessionCookies } from '@api/_lib/session.js'
import { clearAuthCookies } from '@api/_lib/auth.js'
import { resolveSsoCallback } from '@features/auth/server/ssoCallback.js'

export async function GET(request, { params }) {
  const { provider } = await params
  const url = new URL(request.url)

  if (url.searchParams.get('error')) return redirect(url.origin, 'sso_denied')

  return handleCallback({
    request,
    provider,
    code: url.searchParams.get('code'),
    state: url.searchParams.get('state'),
    appleUser: null,
  })
}

export async function POST(request, { params }) {
  const { provider } = await params
  const formData = await request.formData().catch(() => new FormData())
  const origin = new URL(request.url).origin

  if (formData.get('error')) return redirect(origin, 'sso_denied')

  return handleCallback({
    request,
    provider,
    code: formData.get('code'),
    state: formData.get('state'),
    appleUser: parseAppleUser(formData.get('user')),
  })
}

async function handleCallback({ request, provider, code, state, appleUser }) {
  const origin = new URL(request.url).origin
  const result = await resolveSsoCallback({
    origin,
    provider,
    code,
    state,
    appleUser,
    cookieHeader: request.headers.get('cookie') ?? '',
  })

  if (result.log) console.error(...result.log)
  if (result.type === 'signup') return redirectToSignup(origin, result.provider, result.userInfo)
  if (result.type === 'error') return redirect(origin, result.error)

  try {
    const res = NextResponse.redirect(`${origin}${result.destination}`)
    clearSsoState(res)
    const session = await createPersistentSession(result.session)
    return appendSessionCookies(res, session)
  } catch (err) {
    console.error(`[sso/${provider}] session creation:`, err.message)
    return redirect(origin, 'account_error')
  }
}

function parseAppleUser(userParam) {
  if (!userParam) return null
  try {
    return JSON.parse(userParam)
  } catch {
    return null
  }
}

function clearSsoState(res) {
  res.headers.append('Set-Cookie', 'sso_state=; HttpOnly; Path=/; Max-Age=0')
}

function redirect(origin, errorCode) {
  return NextResponse.redirect(`${origin}/?sso_error=${encodeURIComponent(errorCode)}`)
}

function redirectToSignup(origin, provider, userInfo) {
  const params = new URLSearchParams({ email: userInfo.email, sso: provider })
  if (userInfo.firstName) params.set('firstName', userInfo.firstName)
  if (userInfo.lastName) params.set('lastName', userInfo.lastName)

  const res = NextResponse.redirect(`${origin}/signup?${params}`)
  clearSsoState(res)
  clearAuthCookies().forEach((cookie) => res.headers.append('Set-Cookie', cookie))
  return res
}
