import { NextResponse } from 'next/server'
import { createPasskeyAuthenticationOptions } from '@features/auth/server/passkeyAuthentication.js'

export async function POST(request) {
  const result = await createPasskeyAuthenticationOptions({ request })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
