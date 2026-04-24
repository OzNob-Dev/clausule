'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@shared/utils/routes'
import { apiFetch } from '@shared/utils/api'
import { isAuthTestBypassEnabled } from '@shared/utils/authTestBypass'

const SESSION_COOKIE = 'clausule_session='

function hasSessionCookie() {
  return document.cookie.split('; ').some((cookie) => cookie.startsWith(SESSION_COOKIE))
}

export function useActiveSessionRedirect() {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(hasSessionCookie() || isAuthTestBypassEnabled())

  useEffect(() => {
    if (!hasSessionCookie() && !isAuthTestBypassEnabled()) {
      setCheckingSession(false)
      return
    }

    let active = true

    apiFetch('/api/auth/me')
      .then((res) => {
        if (res.ok) router.replace(ROUTES.brag)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [router])

  return checkingSession
}
