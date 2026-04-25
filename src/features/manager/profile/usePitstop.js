import { useEffect, useState } from 'react'
import { storage } from '@shared/utils/storage'
import { useTrackedTimeout } from '@shared/hooks/useTrackedTimeout'

export function usePitstop(pageKey, initial = 'g') {
  const [value, setValue] = useState(initial)
  const [saved, setSaved] = useState(false)
  const scheduleTimeout = useTrackedTimeout()

  useEffect(() => {
    setValue(storage.getPitstop(pageKey) || initial)
    setSaved(false)
  }, [initial, pageKey])

  const select = (ps) => {
    setValue(ps)
    storage.setPitstop(pageKey, ps)
    setSaved(true)
    scheduleTimeout(() => setSaved(false), 2200)
  }

  return { value, select, saved }
}
