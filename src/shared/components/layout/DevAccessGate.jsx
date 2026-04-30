'use client'
import './DevAccessGate.css'
import { useEffect, useState } from 'react'
import ComingSoon from '@shared/components/ComingSoon'

const ACCESS_KEY = 'clausule_dev_accexx'
const ACCESS_VALUES = new Set(['true', 'granted'])

export function hasDevAccess() {
  return ACCESS_VALUES.has(localStorage.getItem(ACCESS_KEY) ?? '')
}

export default function DevAccessGate({ children }) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('bypaxxx') === 'true') {
      localStorage.setItem(ACCESS_KEY, 'true')
      window.history.replaceState(null, '', window.location.pathname)
    }

    setAllowed(hasDevAccess())
  }, [])

  return allowed ? children : <ComingSoon />
}
