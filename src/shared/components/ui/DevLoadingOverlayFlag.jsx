'use client'

import { useEffect, useState } from 'react'
import LoadingOverlay from './LoadingOverlay'

const FLAG_NAME = 'loadingOverlay'
const ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])

export function hasLoadingOverlayFlag(search) {
  if (process.env.NODE_ENV === 'production') return false
  return ENABLED_VALUES.has(new URLSearchParams(search).get(FLAG_NAME)?.toLowerCase() ?? '')
}

export default function DevLoadingOverlayFlag({ children }) {
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    setShowOverlay(hasLoadingOverlayFlag(window.location.search))
  }, [])

  return showOverlay
    ? <div className="loading-overlay-frame" aria-busy="true"><LoadingOverlay /></div>
    : children
}
