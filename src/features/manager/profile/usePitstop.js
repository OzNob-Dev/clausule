import { useEffect, useRef, useState } from 'react'
import { storage } from '@shared/utils/storage'

export function usePitstop(pageKey, initial = 'g') {
  const [value, setValue] = useState(initial)
  const [saved, setSaved]         = useState(false)
  const savedTimerRef = useRef(null)
  const unmountedRef  = useRef(false)

  useEffect(() => {
    setValue(storage.getPitstop(pageKey) || initial)
    return () => {
      unmountedRef.current = true
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [initial, pageKey])

  const select = (ps) => {
    setValue(ps)
    storage.setPitstop(pageKey, ps)
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => {
      if (!unmountedRef.current) setSaved(false)
    }, 2200)
  }

  return { value, select, saved }
}
