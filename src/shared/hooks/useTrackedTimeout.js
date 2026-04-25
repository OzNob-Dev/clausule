// @ts-check
import { useCallback, useEffect, useRef } from 'react'

/**
 * @returns {(fn: () => void, delay: number) => ReturnType<typeof setTimeout>}
 */
export function useTrackedTimeout() {
  const timeoutRefs = useRef(new Set())

  const scheduleTimeout = useCallback((fn, delay) => {
    const id = setTimeout(() => {
      timeoutRefs.current.delete(id)
      fn()
    }, delay)
    timeoutRefs.current.add(id)
    return id
  }, [])

  useEffect(() => () => {
    timeoutRefs.current.forEach((id) => clearTimeout(id))
    timeoutRefs.current.clear()
  }, [])

  return scheduleTimeout
}
