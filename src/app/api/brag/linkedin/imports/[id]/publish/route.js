import { NextResponse } from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { publishLinkedInImport } from '@brag/server/linkedinImports.js'

export async function POST(request, { params }) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)
  const { id: sessionId } = await params

  const result = await publishLinkedInImport({ userId, sessionId })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
