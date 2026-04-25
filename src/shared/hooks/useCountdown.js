// @ts-check
import { useEffect, useState } from 'react'

/**
 * @param {number} initialValue
 * @param {boolean} [active]
 * @returns {[number, import('react').Dispatch<import('react').SetStateAction<number>>, () => void]}
 */
export function useCountdown(initialValue, active = true) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (!active || value <= 0) return
    const id = setTimeout(() => setValue((n) => n - 1), 1000)
    return () => clearTimeout(id)
  }, [active, value])

  return [value, setValue, () => setValue(initialValue)]
}
