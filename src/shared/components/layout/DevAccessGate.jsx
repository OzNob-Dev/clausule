'use client'

import { useEffect, useState } from 'react'
import ComingSoon from '@landing/components/ComingSoon'

const ACCESS_KEY = 'clausule_dev_accexx'

export default function DevAccessGate({ children }) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (process.env.NODE_ENV !== 'production' && (params.get('bypass') === 'true' || params.get('bypaxxx') === 'true')) {
      localStorage.setItem(ACCESS_KEY, 'granted')
      window.history.replaceState(null, '', window.location.pathname)
    }

    setAllowed(localStorage.getItem(ACCESS_KEY) === 'granted')
  }, [])

  return allowed ? children : <ComingSoon />
}
