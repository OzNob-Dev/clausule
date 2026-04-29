'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ComingSoon from './landing/components/ComingSoon'
import { ROUTES } from '@shared/utils/routes'

export default function Page() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setReady(true)
      return
    }

    const params = new URLSearchParams(window.location.search)

    if (params.get('bypaxxx') === 'true') {
      localStorage.setItem('clausule_dev_accexx', 'granted')
      window.history.replaceState(null, '', window.location.pathname)
    }

    if (localStorage.getItem('clausule_dev_accexx') === 'granted') {
      router.replace(ROUTES.login)
      return
    }

    setReady(true)
  }, [router])

  return ready ? <ComingSoon /> : null
}
