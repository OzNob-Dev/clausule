import { useEffect, useRef, useState } from 'react'
import { storage } from '@shared/utils/storage'

export function usePitstop(pageKey, initial = 'g') {
  const [value, setValue] = useState(initial)
  const [saved, setSaved] = useState(false)
  const savedTimerRef = useRef(null)

  useEffect(() => {
    setValue(storage.getPitstop(pageKey) || initial)
  }, [initial, pageKey])

  useEffect(() => () => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
  }, [])

  const select = (ps) => {
    setValue(ps)
    storage.setPitstop(pageKey, ps)
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 2200)
  }

  return { value, select, saved }
}
