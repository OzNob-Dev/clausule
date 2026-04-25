'use client'

import { useState, useEffect } from 'react'
import ComingSoon from '@features/landing/components/ComingSoon'

// Non-production gate. Kept disabled in production, but available in development and tests.
export default function BypassGate({ children }) {
  const [bypassed, setBypassed] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
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
