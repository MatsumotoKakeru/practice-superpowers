import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSnippets, getSnippet, createSnippet, updateSnippet, deleteSnippet } from '@/lib/api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getSnippets', () => {
  it('page=1 で GET /snippets/?page=1 を呼ぶ', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 1, next: null, previous: null, results: [] }),
    })
    await getSnippets(1)
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/snippets/?page=1')
  })

  it('レスポンスをそのまま返す', async () => {
    const data = {
      count: 1, next: null, previous: null,
      results: [{ id: 1, title: 'test', code: 'x', language: 'python', style: 'friendly', linenos: false, highlighted: '' }],
    }
    mockFetch.mockResolvedValue({ ok: true, json: async () => data })
    const result = await getSnippets(1)
    expect(result).toEqual(data)
  })

  it('エラー時に例外を投げる', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    await expect(getSnippets(1)).rejects.toThrow('Failed to fetch snippets: 500')
  })
})

describe('getSnippet', () => {
  it('GET /snippets/{id}/ を呼ぶ', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ id: 42 }) })
    await getSnippet(42)
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/snippets/42/')
  })

  it('404 時に "Not found" を投げる', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 })
    await expect(getSnippet(99)).rejects.toThrow('Not found')
  })
})

describe('createSnippet', () => {
  it('POST /snippets/ を JSON で呼ぶ', async () => {
    const input = { title: 'x', code: 'y', language: 'python', style: 'friendly', linenos: false }
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ id: 1, ...input, highlighted: '' }) })
    await createSnippet(input)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/snippets/',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(input) })
    )
  })
})

describe('updateSnippet', () => {
  it('PUT /snippets/{id}/ を JSON で呼ぶ', async () => {
    const input = { title: 'x', code: 'y', language: 'python', style: 'friendly', linenos: false }
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ id: 1, ...input, highlighted: '' }) })
    await updateSnippet(1, input)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/snippets/1/',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(input) })
    )
  })
})

describe('deleteSnippet', () => {
  it('DELETE /snippets/{id}/ を呼ぶ', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    await deleteSnippet(1)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/snippets/1/',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('エラー時に例外を投げる', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 })
    await expect(deleteSnippet(1)).rejects.toThrow('Failed to delete snippet: 403')
  })
})
