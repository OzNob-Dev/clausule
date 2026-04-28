/**
 * GET /api/auth/profile
 *
 * Returns the authenticated user's profile fields.
 * Response 200: { firstName, lastName, email, mobile, jobTitle, department }
 */

import { NextResponse }              from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { getAuthUser, select, update, updateAuthUser } from '@api/_lib/supabase.js'
import { validateEmail }             from '@shared/utils/emailValidation'
import { findProfileById }           from '@auth/server/accountRepository.js'
import { verifyEmailOtpCode }        from '@auth/server/emailOtpVerification.js'
import { reconcileProfileEmail } from '@auth/server/reconcileProfileEmail.js'

function authMetaName(user, key) {
  return user?.user_metadata?.[key] ?? user?.raw_user_meta_data?.[key] ?? ''
}

export async function GET(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const { data: rows, error } = await select(
    'profiles',
    `id=eq.${userId}&select=first_name,last_name,email,mobile,job_title,department&limit=1`
  )

  if (error) {
    console.error('[auth/profile GET]', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }

  const row = rows?.[0]
  const { data: authUser } = await getAuthUser(userId)
  const user = authUser?.user ?? authUser
  const reconciled = await reconcileProfileEmail({
    userId,
    profileEmail: row?.email ?? '',
    authEmail: user?.email ?? '',
  })
  if (reconciled.error) console.error('[auth/profile GET] reconcile email error:', reconciled.error)

  return NextResponse.json({
    firstName: row?.first_name || authMetaName(user, 'first_name'),
    lastName:  row?.last_name || authMetaName(user, 'last_name'),
    email:     reconciled.email || row?.email || user?.email || '',
    mobile:    row?.mobile     ?? '',
    jobTitle:  row?.job_title  ?? '',
    department: row?.department ?? '',
  })
}

function trimOrEmpty(value) {
  return String(value ?? '').trim()
}

export async function PATCH(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const body = await request.json().catch(() => ({}))
  const firstName = trimOrEmpty(body.firstName)
  const lastName = trimOrEmpty(body.lastName)
  const email = trimOrEmpty(body.email).toLowerCase()
  const mobile = trimOrEmpty(body.mobile)
  const jobTitle = trimOrEmpty(body.jobTitle)
  const department = trimOrEmpty(body.department)
  const emailVerificationCode = trimOrEmpty(body.emailVerificationCode)
  const mobileConfirmed = body.mobileConfirmed === true
  const mobileConfirmation = trimOrEmpty(body.mobileConfirmation)

  if (!firstName) return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  if (!validateEmail(email).valid) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })

  const { profile, error } = await findProfileById(userId, 'first_name,last_name,email,mobile,job_title,department,role')
  if (error) {
    console.error('[auth/profile PATCH] profile lookup error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const emailChanged = (profile.email ?? '').toLowerCase() !== email
  const mobileChanged = (profile.mobile ?? '') !== mobile

  if (emailChanged) {
    if (!emailVerificationCode) {
      return NextResponse.json({ error: 'Email verification code required' }, { status: 400 })
    }
    const verified = await verifyEmailOtpCode(email, emailVerificationCode)
    if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: verified.status })
  }

  if (mobileChanged && (!mobileConfirmed || mobileConfirmation !== mobile)) {
    return NextResponse.json({ error: 'Mobile confirmation required' }, { status: 400 })
  }

  let authEmailUpdated = false
  if (emailChanged) {
    const { error: authUpdateError } = await updateAuthUser(userId, { email })
    if (authUpdateError) {
      console.error('[auth/profile PATCH] auth user update error:', authUpdateError)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }
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
    if (authEmailUpdated) {
      const { error: rollbackError } = await updateAuthUser(userId, { email: profile.email })
      if (rollbackError) console.error('[auth/profile PATCH] auth user rollback error:', rollbackError)
    }
    console.error('[auth/profile PATCH] update error:', updateError)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  const saved = rows?.[0] ?? {
    first_name: firstName,
    last_name: lastName || null,
    email,
    mobile: mobile || null,
    job_title: jobTitle || null,
    department: department || null,
  }

  return NextResponse.json({
    ok: true,
    user: { id: userId, email, role: profile.role ?? 'employee' },
    profile: {
      firstName: saved.first_name ?? '',
      lastName: saved.last_name ?? '',
      email: saved.email ?? '',
      mobile: saved.mobile ?? '',
      jobTitle: saved.job_title ?? '',
      department: saved.department ?? '',
    },
  })
}
