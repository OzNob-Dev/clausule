'use client'

import { useState, useEffect } from 'react'
import ComingSoon from '@features/landing/components/ComingSoon'

export default function BypassGate({ children }) {
  const [bypassed, setBypassed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (process.env.NODE_ENV !== 'production' && params.get('bypaxxx') === 'true') {
      localStorage.setItem('clausule_dev_accexx', 'granted')
      window.history.replaceState(null, '', window.location.pathname)
    }
    setBypassed(localStorage.getItem('clausule_dev_accexx') === 'granted')
  }, [])

  if (!bypassed) return <ComingSoon />
  return children
}
