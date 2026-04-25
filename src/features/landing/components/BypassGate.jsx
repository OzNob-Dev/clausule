'use client'

import { useState, useEffect } from 'react'
import ComingSoon from '@features/landing/components/ComingSoon'

// Development-only gate. Stripped from production builds by the NODE_ENV check.
export default function BypassGate({ children }) {
  const [bypassed, setBypassed] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      setBypassed(false)
      return
    }
    const params = new URLSearchParams(window.location.search)
    if (params.get('bypaxxx') === 'true') {
      localStorage.setItem('clausule_dev_accexx', 'granted')
      window.history.replaceState(null, '', window.location.pathname)
    }
    setBypassed(localStorage.getItem('clausule_dev_accexx') === 'granted')
  }, [])

  if (!bypassed) return <ComingSoon />
  return children
}
