'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ComingSoon from './landing/components/ComingSoon'
import { ROUTES } from '@shared/utils/routes'
import { hasDevAccess } from '@shared/components/layout/DevAccessGate'

export default function Page() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setReady(true)
      return
    }

    if (hasDevAccess()) {
      router.replace(ROUTES.login)
      return
    }

    setReady(true)
  }, [router])

  return ready ? <ComingSoon /> : null
}
