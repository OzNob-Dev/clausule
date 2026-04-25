// @ts-check
'use client'

import { useCallback, useState } from 'react'

/**
 * @param {{ inputRefs: import('react').MutableRefObject<HTMLInputElement[]>, scheduleTimeout: (fn: () => void, delay: number) => void }} params
 */
export function useSixDigitCode({ inputRefs, scheduleTimeout }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [state, setState] = useState('idle')

  const reset = useCallback(() => {
    setDigits(['', '', '', '', '', ''])
    setState('idle')
  }, [])

  const setError = useCallback(() => {
    setState('error')
    scheduleTimeout(reset, 700)
  }, [reset, scheduleTimeout])

  const handleChange = useCallback((index, value) => {
    const nextDigit = value.replace(/\D/g, '').slice(-1)
    setDigits((previous) => {
      const next = previous.map((digit, digitIndex) => (digitIndex === index ? nextDigit : digit))

      if (nextDigit && index < 5) {
        scheduleTimeout(() => inputRefs.current[index + 1]?.focus(), 0)
      }

      return next
    })
  }, [inputRefs, scheduleTimeout])

  const handleKeyDown = useCallback((index, event) => {
    if (event.key === 'Backspace') {
      setDigits((previous) => {
        if (previous[index]) {
          return previous.map((digit, digitIndex) => (digitIndex === index ? '' : digit))
        }

        if (index > 0) {
          scheduleTimeout(() => inputRefs.current[index - 1]?.focus(), 0)
        }

        return previous
      })
      return
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }, [inputRefs, scheduleTimeout])

  const handlePaste = useCallback((event) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return

    const next = Array.from({ length: 6 }, (_, index) => text[index] ?? '')
    setDigits(next)
    inputRefs.current[Math.min(text.length, 5)]?.focus()
  }, [inputRefs])

  return {
    digits,
    state,
    reset,
    setState,
    setError,
    handleChange,
    handleKeyDown,
    handlePaste,
  }
}
