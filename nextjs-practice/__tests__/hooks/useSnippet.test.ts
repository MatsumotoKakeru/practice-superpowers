import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSnippet } from '@/hooks/useSnippet'

vi.mock('@/lib/api', () => ({ getSnippet: vi.fn() }))

import { getSnippet } from '@/lib/api'
const mockGetSnippet = vi.mocked(getSnippet)

beforeEach(() => { mockGetSnippet.mockReset() })

const mockSnippet = {
  id: 1, title: 'test', code: 'print(1)', language: 'python',
  style: 'friendly', linenos: false, highlighted: '<pre>print(1)</pre>',
}

describe('useSnippet', () => {
  it('初期状態は loading=true, data=null', () => {
    mockGetSnippet.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useSnippet(1))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
  })

  it('取得成功時に data をセットする', async () => {
    mockGetSnippet.mockResolvedValue(mockSnippet)
    const { result } = renderHook(() => useSnippet(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(mockSnippet)
    expect(result.current.error).toBeNull()
  })

  it('ID を getSnippet に渡す', async () => {
    mockGetSnippet.mockResolvedValue(mockSnippet)
    renderHook(() => useSnippet(42))
    await waitFor(() => expect(mockGetSnippet).toHaveBeenCalledWith(42))
  })

  it('404 時に error をセットする', async () => {
    mockGetSnippet.mockRejectedValue(new Error('Not found'))
    const { result } = renderHook(() => useSnippet(99))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error?.message).toBe('Not found')
  })
})
