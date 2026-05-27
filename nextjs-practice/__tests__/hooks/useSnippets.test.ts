import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSnippets } from '@/hooks/useSnippets'

vi.mock('@/lib/api', () => ({ getSnippets: vi.fn() }))

import { getSnippets } from '@/lib/api'
const mockGetSnippets = vi.mocked(getSnippets)

beforeEach(() => { mockGetSnippets.mockReset() })

const mockResponse = {
  count: 2, next: null, previous: null,
  results: [
    { id: 1, title: 'first', code: 'a', language: 'python', style: 'friendly', linenos: false, highlighted: '' },
    { id: 2, title: 'second', code: 'b', language: 'javascript', style: 'monokai', linenos: true, highlighted: '' },
  ],
}

describe('useSnippets', () => {
  it('初期状態は loading=true, data=null, error=null', () => {
    mockGetSnippets.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useSnippets(1))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('取得成功時に data をセットして loading=false にする', async () => {
    mockGetSnippets.mockResolvedValue(mockResponse)
    const { result } = renderHook(() => useSnippets(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(mockResponse)
    expect(result.current.error).toBeNull()
  })

  it('ページ番号を getSnippets に渡す', async () => {
    mockGetSnippets.mockResolvedValue(mockResponse)
    renderHook(() => useSnippets(3))
    await waitFor(() => expect(mockGetSnippets).toHaveBeenCalledWith(3))
  })

  it('取得失敗時に error をセットして loading=false にする', async () => {
    mockGetSnippets.mockRejectedValue(new Error('network error'))
    const { result } = renderHook(() => useSnippets(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error?.message).toBe('network error')
    expect(result.current.data).toBeNull()
  })

  it('refetch を呼ぶと再取得する', async () => {
    mockGetSnippets.mockResolvedValue(mockResponse)
    const { result } = renderHook(() => useSnippets(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    mockGetSnippets.mockResolvedValue({ ...mockResponse, count: 99 })
    result.current.refetch()
    await waitFor(() => expect(result.current.data?.count).toBe(99))
  })
})
