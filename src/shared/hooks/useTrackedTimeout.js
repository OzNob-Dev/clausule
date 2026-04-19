import { useCallback, useEffect, useRef } from 'react'

export function useTrackedTimeout() {
  const timeoutRefs = useRef([])

  const scheduleTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutRefs.current.push(id)
    return id
  }, [])

  useEffect(() => () => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }, [])

  return scheduleTimeout
}
