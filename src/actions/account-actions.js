'use server'

import { headers } from 'next/headers'
import { getAuthUser, update, updateAuthUser, del } from '@api/_lib/supabase.js'
import { validateEmail } from '@shared/utils/emailValidation'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { findProfileById } from '@auth/server/accountRepository.js'
import { verifyEmailOtpCode } from '@auth/server/emailOtpVerification.js'

function requestFromHeaders() {
  const cookie = headers().get('cookie') ?? ''
  return new Request('http://localhost', { headers: cookie ? { cookie } : {} })
}

function trim(value) {
  return String(value ?? '').trim()
}

export async function saveProfileAction(body, current) {
  const request = requestFromHeaders()
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) throw new Error(authError)

  const firstName = trim(body.firstName)
  const lastName = trim(body.lastName)
  const email = trim(body.email).toLowerCase()
  const mobile = trim(body.mobile)
  const jobTitle = trim(body.jobTitle)
  const department = trim(body.department)
  const emailVerificationCode = trim(body.emailVerificationCode)
  const mobileConfirmed = body.mobileConfirmed === true
  const mobileConfirmation = trim(body.mobileConfirmation)

  if (!firstName) throw new Error('First name is required')
  if (!validateEmail(email).valid) throw new Error('Valid email is required')

  const { profile, error } = await findProfileById(userId, 'first_name,last_name,email,mobile,job_title,department,role')
  if (error) throw new Error('Failed to fetch profile')
  if (!profile) throw new Error('Profile not found')

  const emailChanged = (profile.email ?? '').toLowerCase() !== email
  const mobileChanged = (profile.mobile ?? '') !== mobile

  if (emailChanged) {
    if (!emailVerificationCode) throw new Error('Email verification code required')
    const verified = await verifyEmailOtpCode(email, emailVerificationCode)
    if (!verified.ok) throw new Error(verified.error)
  }

  if (mobileChanged && (!mobileConfirmed || mobileConfirmation !== mobile)) {
    throw new Error('Mobile confirmation required')
  }

  let authEmailUpdated = false
  if (emailChanged) {
    const { error: authUpdateError } = await updateAuthUser(userId, { email })
    if (authUpdateError) throw new Error('Failed to save profile')
    authEmailUpdated = true
  }

  const { data: rows, error: updateError } = await update('profiles', `id=eq.${userId}`, {
    first_name: firstName,
    last_name: lastName || null,
    email,
    mobile: mobile || null,
    job_title: jobTitle || null,
    department: department || null,
  }, { expectRows: 'single' })

  if (updateError) {
    if (authEmailUpdated) await updateAuthUser(userId, { email: profile.email }).catch(() => {})
    throw new Error('Failed to save profile')
  }

  const saved = rows?.[0] ?? {
    first_name: firstName,
    last_name: lastName || null,
    email,
    mobile: mobile || null,
    job_title: jobTitle || null,
    department: department || null,
  }

  const { data: authUser } = await getAuthUser(userId)
  const user = authUser?.user ?? authUser

  return {
    ok: true,
    user: { id: userId, email: user?.email ?? email, role: profile.role ?? 'employee' },
    profile: {
      firstName: saved.first_name ?? '',
      lastName: saved.last_name ?? '',
      email: saved.email ?? '',
      mobile: saved.mobile ?? '',
      jobTitle: saved.job_title ?? '',
      department: saved.department ?? '',
    },
  }
}

export async function deleteAccountAction() {
  const request = requestFromHeaders()
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) throw new Error(authError)

  const deletedAt = new Date().toISOString()
  const { error: deleteError } = await update('profiles', `id=eq.${userId}`, {
    is_active: false,
    is_deleted: true,
    deleted_at: deletedAt,
  }, { expectRows: 'single' })

  if (deleteError) throw new Error('Failed to delete account')

  await del('refresh_tokens', `user_id=eq.${userId}`).catch(() => {})
}
