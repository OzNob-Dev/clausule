'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ComingSoon from '@shared/components/ComingSoon'
import { hasDevAccess, primeDevAccessFromLocation } from '@shared/components/layout/DevAccessGate'
import { ROUTES } from '@shared/utils/routes'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    primeDevAccessFromLocation()
    if (hasDevAccess()) router.replace(ROUTES.login)
  }, [router])

  return <ComingSoon />
}
