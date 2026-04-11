import { useState } from 'react'
import { storage } from '../utils/storage'

export function usePitstop(pageKey, initial = 'g') {
  const [value, setValue] = useState(
    () => storage.getPitstop(pageKey) || initial
  )
  const [saved, setSaved] = useState(false)

  const select = (ps) => {
    setValue(ps)
    storage.setPitstop(pageKey, ps)
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return { value, select, saved }
}
