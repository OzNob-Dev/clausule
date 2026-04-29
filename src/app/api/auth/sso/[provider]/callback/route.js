/**
 * GET|POST /api/auth/sso/[provider]/callback
 *
 * Handles OAuth callbacks from Google, Microsoft, and Apple.
 */

import { NextResponse } from 'next/server'
import { clearAuthCookies } from '@api/_lib/auth.js'

function safeDestination(destination, fallback = '/') {
  const path = String(destination ?? '')
  return /^\/[^/\\]/.test(path) || path === '/' ? path : fallback
}
import { beginBackendOperation } from '@auth/server/backendOperation.js'
import { resolveSsoCallback } from '@auth/server/ssoCallback.js'
import { issueRecoverableSession } from '@auth/server/recoverableSession.js'

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
  const operationKey = `sso:${provider}:${state}`
  const operation = await beginBackendOperation({
    operationKey,
    operationType: 'sso',
  })
  if (operation.error) {
    console.error(`[sso/${provider}] begin operation:`, operation.error)
    return redirect(origin, 'account_error')
  }
  if (operation.replay) {
    return issueRecoverableSession({
      operation,
      operationKey,
      operationType: 'sso',
      email: operation.replay.session.email,
      userId: operation.replay.session.userId,
      body: operation.replay.body,
      status: operation.replay.status,
      session: operation.replay.session,
      failureMessage: 'Failed to create session',
      successFactory: ({ body }) => {
        const response = NextResponse.redirect(`${origin}${safeDestination(body.destination)}`)
        clearSsoState(response)
        return response
      },
      failureFactory: () => redirect(origin, 'account_error'),
    })
  }

  const result = await resolveSsoCallback({
    origin,
    provider,
    code,
    state,
    appleUser,
  })

  if (result.log) console.error(...result.log)
  if (result.type === 'signup') return redirectToSignup(origin, result.provider, result.userInfo)
  if (result.type === 'error') return redirect(origin, result.error)

  return issueRecoverableSession({
    operation,
    operationKey,
    operationType: 'sso',
    email: result.session.email,
    userId: result.session.userId,
    body: { destination: result.destination },
    status: 302,
    session: result.session,
    failureMessage: 'Failed to create session',
    successFactory: ({ body }) => {
      const response = NextResponse.redirect(`${origin}${body.destination}`)
      clearSsoState(response)
      return response
    },
    failureFactory: () => redirect(origin, 'account_error'),
  })
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
  return NextResponse.redirect(`${origin}/login?sso_error=${encodeURIComponent(errorCode)}`)
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
