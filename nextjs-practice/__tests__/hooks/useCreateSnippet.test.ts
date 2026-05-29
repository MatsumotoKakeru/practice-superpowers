import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreateSnippet } from '@/hooks/useCreateSnippet'

vi.mock('@/lib/api', () => ({ createSnippet: vi.fn() }))

import { createSnippet } from '@/lib/api'
const mockCreate = vi.mocked(createSnippet)

beforeEach(() => { mockCreate.mockReset() })

const input = { title: 'x', code: 'print(1)', language: 'python', style: 'friendly', linenos: false }
const created = { id: 1, ...input, highlighted: '<pre>...</pre>' }

describe('useCreateSnippet', () => {
  it('初期状態は loading=false, error=null', () => {
    const { result } = renderHook(() => useCreateSnippet())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('create 呼び出し中は loading=true になる', async () => {
    let resolve!: (v: typeof created) => void
    mockCreate.mockReturnValue(new Promise((r) => { resolve = r }))
    const { result } = renderHook(() => useCreateSnippet())
    let promise!: Promise<typeof created>
    act(() => { promise = result.current.create(input) })
    expect(result.current.loading).toBe(true)
    resolve(created)
    await promise
  })

  it('成功時に作成されたスニペットを返す', async () => {
    mockCreate.mockResolvedValue(created)
    const { result } = renderHook(() => useCreateSnippet())
    let returnValue!: typeof created
    await act(async () => { returnValue = await result.current.create(input) })
    expect(returnValue).toEqual(created)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('失敗時に error をセットして例外を再スローする', async () => {
    mockCreate.mockRejectedValue(new Error('server error'))
    const { result } = renderHook(() => useCreateSnippet())
    let caughtError: Error | undefined
    await act(async () => {
      try { await result.current.create(input) } catch (e) { caughtError = e as Error }
    })
    expect(caughtError?.message).toBe('server error')
    expect(result.current.error?.message).toBe('server error')
  })
})
