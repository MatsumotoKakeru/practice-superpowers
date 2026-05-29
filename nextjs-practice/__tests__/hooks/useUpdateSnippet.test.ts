import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUpdateSnippet } from '@/hooks/useUpdateSnippet'

vi.mock('@/lib/api', () => ({ updateSnippet: vi.fn() }))

import { updateSnippet } from '@/lib/api'
const mockUpdate = vi.mocked(updateSnippet)

beforeEach(() => { mockUpdate.mockReset() })

const input = { title: 'updated', code: 'x=1', language: 'python', style: 'friendly', linenos: false }
const updated = { id: 1, ...input, highlighted: '<pre>...</pre>' }

describe('useUpdateSnippet', () => {
  it('初期状態は loading=false, error=null', () => {
    const { result } = renderHook(() => useUpdateSnippet())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('成功時に更新されたスニペットを返す', async () => {
    mockUpdate.mockResolvedValue(updated)
    const { result } = renderHook(() => useUpdateSnippet())
    let returnValue!: typeof updated
    await act(async () => { returnValue = await result.current.update(1, input) })
    expect(returnValue).toEqual(updated)
    expect(result.current.loading).toBe(false)
  })

  it('update に id と input を渡す', async () => {
    mockUpdate.mockResolvedValue(updated)
    const { result } = renderHook(() => useUpdateSnippet())
    await act(async () => { await result.current.update(5, input) })
    expect(mockUpdate).toHaveBeenCalledWith(5, input)
  })

  it('失敗時に error をセットして例外を再スローする', async () => {
    mockUpdate.mockRejectedValue(new Error('forbidden'))
    const { result } = renderHook(() => useUpdateSnippet())
    let caughtError: Error | undefined
    await act(async () => {
      try { await result.current.update(1, input) } catch (e) { caughtError = e as Error }
    })
    expect(caughtError?.message).toBe('forbidden')
    expect(result.current.error?.message).toBe('forbidden')
  })
})
