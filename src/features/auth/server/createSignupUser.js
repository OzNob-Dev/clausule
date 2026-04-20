import { createUser } from '@api/_lib/supabase.js'
import { validateEmail } from '@shared/utils/emailValidation'

export async function createSignupUser(body) {
  const firstName = (body.firstName ?? '').trim()
  const lastName = (body.lastName ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()

  if (!firstName) return { body: { error: 'First name is required' }, status: 400 }
  if (!validateEmail(email).valid) return { body: { error: 'Invalid email address' }, status: 400 }

  const { data, error } = await createUser({
    email,
    user_metadata: { first_name: firstName, last_name: lastName || undefined },
  })

  if (error) {
    const msg = error.msg ?? error.message ?? ''
    if (msg.toLowerCase().includes('already')) {
      return { body: { error: 'An account with this email already exists' }, status: 409 }
    }
    return { log: ['[signup] createUser error:', error], body: { error: 'Failed to create account' }, status: 500 }
  }

  return { body: { ok: true, userId: data.id }, status: 201 }
}
