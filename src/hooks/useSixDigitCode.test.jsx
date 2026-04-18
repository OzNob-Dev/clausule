import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import { useSixDigitCode } from './useSixDigitCode'

function useHarness() {
  const inputRefs = useRef([
    { focus: vi.fn() },
    { focus: vi.fn() },
    { focus: vi.fn() },
    { focus: vi.fn() },
    { focus: vi.fn() },
    { focus: vi.fn() },
  ])
  const scheduleTimeout = (fn) => fn()

  return {
    inputRefs,
    code: useSixDigitCode({ inputRefs, scheduleTimeout }),
  }
}

describe('useSixDigitCode', () => {
  it('stores only the final numeric character and advances focus', () => {
    const { result } = renderHook(() => useHarness())

    act(() => {
      result.current.code.handleChange(0, 'a7')
    })

    expect(result.current.code.digits[0]).toBe('7')
    expect(result.current.inputRefs.current[1].focus).toHaveBeenCalled()
  })

  it('handles paste by spreading up to six digits', () => {
    const { result } = renderHook(() => useHarness())

    act(() => {
      result.current.code.handlePaste({
        preventDefault: vi.fn(),
        clipboardData: {
          getData: () => '12-34 56 99',
        },
      })
    })

    expect(result.current.code.digits).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  it('sets and clears an error state through the provided scheduler', () => {
    const { result } = renderHook(() => useHarness())

    act(() => {
      result.current.code.handleChange(0, '9')
      result.current.code.setError()
    })

    expect(result.current.code.state).toBe('idle')
    expect(result.current.code.digits).toEqual(['', '', '', '', '', ''])
  })
})
