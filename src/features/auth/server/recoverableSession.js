import { NextResponse } from 'next/server'
import { appendSessionCookies, createPersistentSession } from '@api/_lib/session.js'
import { clearAuthCookies } from '@api/_lib/auth.js'
import {
  beginBackendOperation,
  completeBackendOperation,
} from './backendOperation.js'

function withClearedCookies(response) {
  clearAuthCookies().forEach((cookie) => response.headers.append('Set-Cookie', cookie))
  return response
}

export async function issueRecoverableSession({
  operation = null,
  operationKey,
  operationType,
  email = null,
  userId = null,
  body,
  status,
  session,
  successFactory,
  failureMessage,
  clearCookiesOnFailure = false,
  stripeCustomerId = null,
  stripeSubscriptionId = null,
  failureFactory = null,
}) {
  const failureResponse = () => {
    const response = failureFactory
      ? failureFactory({ error: failureMessage })
      : NextResponse.json({ error: failureMessage }, { status: 500 })
    return clearCookiesOnFailure ? withClearedCookies(response) : response
  }

  let activeOperation = operation
  if (!activeOperation) {
    activeOperation = await beginBackendOperation({
      operationKey,
      operationType,
      email: email ?? session.email,
      userId: userId ?? session.userId,
    })
    if (activeOperation.error) {
      console.error(`[session/${operationType}] begin operation error:`, activeOperation.error)
      return failureResponse()
    }
  }

  const replay = activeOperation.replay
  const resolvedBody = replay?.body ?? body
  const resolvedStatus = replay?.status ?? status
  const resolvedSession = replay?.session ?? session

  if (!replay) {
    const { error } = await completeBackendOperation({
      operationKey,
      operationType,
      statusCode: resolvedStatus,
      session: resolvedSession,
      body: resolvedBody,
      stripeCustomerId,
      stripeSubscriptionId,
    })
    if (error) {
      console.error(`[session/${operationType}] complete operation error:`, error)
      return failureResponse()
    }
  }

  try {
    const response = successFactory
      ? successFactory({ body: resolvedBody, status: resolvedStatus })
      : NextResponse.json(resolvedBody, { status: resolvedStatus })
    const persisted = await createPersistentSession(resolvedSession)
    return appendSessionCookies(response, persisted)
  } catch (err) {
    console.error(`[session/${operationType}] create session error:`, err)
    return failureResponse()
  }
}
