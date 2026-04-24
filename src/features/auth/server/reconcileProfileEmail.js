import { update } from '@api/_lib/supabase.js'

function normalize(email) {
  return String(email ?? '').trim().toLowerCase()
}

export async function reconcileProfileEmail({ userId, profileEmail, authEmail }) {
  const canonicalEmail = normalize(authEmail)
  if (!canonicalEmail || canonicalEmail === normalize(profileEmail)) {
    return { email: canonicalEmail || normalize(profileEmail), repaired: false }
  }

  const { error } = await update('profiles', `id=eq.${userId}`, { email: canonicalEmail }, { expectRows: 'single' })
  if (error) {
    return { email: normalize(profileEmail), repaired: false, error }
  }

  return { email: canonicalEmail, repaired: true }
}
