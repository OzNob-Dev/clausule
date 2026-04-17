'use client'

import { useState, useEffect } from 'react'
import ComingSoon from '@/components/ComingSoon'

export default function BypassGate({ children }) {
  const [checked, setChecked]   = useState(false)
  const [bypassed, setBypassed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('bypaxxx') === 'true') {
      localStorage.setItem('clausule_dev_accexx', 'granted')
      window.history.replaceState(null, '', window.location.pathname)
    }
    setBypassed(localStorage.getItem('clausule_dev_accexx') === 'granted')
    setChecked(true)
  }, [])

  if (!checked) return null
  if (!bypassed) return <ComingSoon />
  return children
}
