import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from './useCountdown'
import { useTheme } from './useTheme'
import { useTrackedTimeout } from './useTrackedTimeout'
import { storage } from '../utils/storage'

vi.mock('../utils/storage', () => ({
  storage: {
    getTheme: vi.fn(),
    setTheme: vi.fn(),
  },
}))

describe('shared hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    document.body.className = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.className = ''
  })

  it('counts down, resets, and stops when inactive', () => {
    const { result, rerender } = renderHook(({ active }) => useCountdown(3, active), {
      initialProps: { active: true },
    })

    expect(result.current[0]).toBe(3)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current[0]).toBe(2)

    act(() => { result.current[2]() })
    expect(result.current[0]).toBe(3)

    rerender({ active: false })
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current[0]).toBe(3)
  })

  it('tracks scheduled timeouts and clears them on unmount', () => {
    const fn = vi.fn()
    const { result, unmount } = renderHook(() => useTrackedTimeout())

    act(() => { result.current(fn, 1000) })
    act(() => { vi.advanceTimersByTime(500) })
    unmount()
    act(() => { vi.advanceTimersByTime(1000) })

    expect(fn).not.toHaveBeenCalled()
  })

  it('syncs theme state with storage and document body', () => {
    storage.getTheme.mockReturnValue('dark')

    const { result } = renderHook(() => useTheme())

    expect(result.current.dark).toBe(true)
    expect(document.body.classList.contains('dark')).toBe(true)
    expect(storage.setTheme).toHaveBeenCalledWith('dark')

    act(() => { result.current.toggle() })

    expect(result.current.dark).toBe(false)
    expect(document.body.classList.contains('dark')).toBe(false)
    expect(storage.setTheme).toHaveBeenLastCalledWith('light')
  })
})
