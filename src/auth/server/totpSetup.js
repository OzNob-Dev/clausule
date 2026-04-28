import { update } from '@api/_lib/supabase.js'
import { generateBase32Secret, verifyTotp } from '@api/_lib/totp.js'
import { encryptTotpSecret } from '@api/_lib/totpEncryption.js'
import { findProfileById } from './accountRepository.js'

export async function createTotpSetup({ userId }) {
  const { profile, error: profileError } = await findProfileById(userId, 'email')
  if (profileError || !profile?.email) {
    return { body: { error: 'Failed to load profile' }, status: 500 }
  }
  const email = profile.email

  const secret = generateBase32Secret()
  const uri = `otpauth://totp/Clausule:${encodeURIComponent(email)}?secret=${secret}&issuer=Clausule&algorithm=SHA1&digits=6&period=30`

  return { body: { secret, uri }, status: 200 }
}

export async function saveTotpSetup({ userId, body }) {
  const code = (body.code ?? '').replace(/\D/g, '').slice(0, 6)
  const secret = (body.secret ?? '').trim().toUpperCase()

  if (code.length !== 6 || !secret) {
    return { body: { error: 'code (6 digits) and secret are required' }, status: 400 }
  }

  if (!verifyTotp(secret, code)) return { body: { error: 'Invalid TOTP code' }, status: 401 }

  let encryptedSecret
  try {
    encryptedSecret = encryptTotpSecret(secret)
  } catch (err) {
    return {
      log: ['[totp/setup POST] encryption error:', err?.message ?? err],
      body: { error: 'Failed to save TOTP configuration' },
      status: 500,
    }
  }

  const { error } = await update('profiles', `id=eq.${userId}`, { totp_secret: encryptedSecret }, { expectRows: 'single' })
  if (error) {
    return {
      log: ['[totp/setup POST] update error:', error],
      body: { error: 'Failed to save TOTP configuration' },
      status: 500,
    }
  }

  return { body: { ok: true }, status: 200 }
}
