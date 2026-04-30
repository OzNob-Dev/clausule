'use client'
import './DevAccessGate.css'
import { useEffect, useState } from 'react'
import ComingSoon from '@shared/components/ComingSoon'
import LoadingOverlay from '@shared/components/ui/LoadingOverlay'

const ACCESS_KEY = 'clausule_dev_accexx'
const ACCESS_VALUES = new Set(['true', 'granted'])

export function hasDevAccess() {
  return ACCESS_VALUES.has(localStorage.getItem(ACCESS_KEY) ?? '')
}

export default function DevAccessGate({ children }) {
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('bypaxxx') === 'true') {
      localStorage.setItem(ACCESS_KEY, 'true')
      window.history.replaceState(null, '', window.location.pathname)
    }

    setAllowed(hasDevAccess())
    setChecked(true)
  }, [])

  if (!checked) return <div className="relative min-h-[55vh] w-full overflow-hidden"><LoadingOverlay /></div>
  return allowed ? children : <ComingSoon />
}
