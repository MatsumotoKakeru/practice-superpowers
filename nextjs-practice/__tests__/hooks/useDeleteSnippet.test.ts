import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

vi.mock('@/lib/api', () => ({ deleteSnippet: vi.fn() }))

import { deleteSnippet } from '@/lib/api'
const mockDelete = vi.mocked(deleteSnippet)

beforeEach(() => { mockDelete.mockReset() })

describe('useDeleteSnippet', () => {
  it('初期状態は loading=false, error=null', () => {
    const { result } = renderHook(() => useDeleteSnippet())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('成功時に loading=false, error=null のまま終わる', async () => {
    mockDelete.mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteSnippet())
    await act(async () => { await result.current.remove(1) })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('削除する ID を deleteSnippet に渡す', async () => {
    mockDelete.mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteSnippet())
    await act(async () => { await result.current.remove(7) })
    expect(mockDelete).toHaveBeenCalledWith(7)
  })

  it('失敗時に error をセットして例外を再スローする', async () => {
    mockDelete.mockRejectedValue(new Error('not found'))
    const { result } = renderHook(() => useDeleteSnippet())
    let caughtError: Error | undefined
    await act(async () => {
      try { await result.current.remove(99) } catch (e) { caughtError = e as Error }
    })
    expect(caughtError?.message).toBe('not found')
    expect(result.current.error?.message).toBe('not found')
  })
})
