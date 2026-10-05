import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDelayedFlag } from './use-delayed-flag'

describe('useDelayedFlag', () => {
  it('stays false for loads shorter than the delay', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ flag }) => useDelayedFlag(flag, 300), { initialProps: { flag: true } })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe(false)
    rerender({ flag: false })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe(false)
  })

  it('turns true after the delay and false right away when the flag drops', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ flag }) => useDelayedFlag(flag, 300), { initialProps: { flag: true } })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(true)
    rerender({ flag: false })
    expect(result.current).toBe(false)
  })
})
