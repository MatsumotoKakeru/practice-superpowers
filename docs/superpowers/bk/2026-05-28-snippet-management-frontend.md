# スニペット管理フロントエンド 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Django REST Framework バックエンドと連携するスニペット管理 UI を Next.js App Router で実装する（一覧・詳細・新規作成・編集・削除の全 CRUD）

**Architecture:** 全ページを `'use client'` の Client Component として実装する。`lib/api.ts` に fetch ラッパーを集約し、データ取得系・ミューテーション系の custom hook を個別ファイルに分離して各ページから呼び出す。フォームは新規作成・編集で共通の `SnippetForm` コンポーネントを使い回す。

**Tech Stack:** Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS v4 / Vitest + Testing Library / DOMPurify

---

## ファイル構成

| 操作 | パス | 責務 |
|------|------|------|
| 作成 | `nextjs-practice/lib/api.ts` | DRF `/snippets/` エンドポイントへの fetch ラッパーと型定義 |
| 作成 | `nextjs-practice/lib/constants.ts` | 言語・スタイルの選択肢定数（テストなし） |
| 作成 | `nextjs-practice/hooks/useSnippets.ts` | 一覧取得（GET /snippets/）、page 番号とrefetch対応 |
| 作成 | `nextjs-practice/hooks/useSnippet.ts` | 詳細取得（GET /snippets/{id}/）、アンマウント後更新防止 |
| 作成 | `nextjs-practice/hooks/useCreateSnippet.ts` | 作成（POST /snippets/） |
| 作成 | `nextjs-practice/hooks/useUpdateSnippet.ts` | 更新（PUT /snippets/{id}/） |
| 作成 | `nextjs-practice/hooks/useDeleteSnippet.ts` | 削除（DELETE /snippets/{id}/） |
| 作成 | `nextjs-practice/components/snippets/SnippetCard.tsx` | 一覧の各行（タイトルリンク・言語バッジ・削除ボタン） |
| 作成 | `nextjs-practice/components/snippets/SnippetForm.tsx` | 新規作成・編集共用フォーム（バリデーション・isDirty判定） |
| 作成 | `nextjs-practice/app/snippets/page.tsx` | 一覧画面（ページング・削除） |
| 作成 | `nextjs-practice/app/snippets/[id]/page.tsx` | 詳細画面（DOMPurify でハイライト HTML レンダリング） |
| 作成 | `nextjs-practice/app/snippets/new/page.tsx` | 新規作成画面 |
| 作成 | `nextjs-practice/app/snippets/[id]/edit/page.tsx` | 編集画面 |
| 作成 | `nextjs-practice/__tests__/lib/api.test.ts` | api.ts 単体テスト |
| 作成 | `nextjs-practice/__tests__/hooks/useSnippets.test.ts` | useSnippets テスト |
| 作成 | `nextjs-practice/__tests__/hooks/useSnippet.test.ts` | useSnippet テスト |
| 作成 | `nextjs-practice/__tests__/hooks/useCreateSnippet.test.ts` | useCreateSnippet テスト |
| 作成 | `nextjs-practice/__tests__/hooks/useUpdateSnippet.test.ts` | useUpdateSnippet テスト |
| 作成 | `nextjs-practice/__tests__/hooks/useDeleteSnippet.test.ts` | useDeleteSnippet テスト |
| 作成 | `nextjs-practice/__tests__/components/SnippetCard.test.tsx` | SnippetCard テスト |
| 作成 | `nextjs-practice/__tests__/components/SnippetForm.test.tsx` | SnippetForm テスト |
| 作成 | `nextjs-practice/__tests__/app/snippets-page.test.tsx` | 一覧画面テスト |
| 作成 | `nextjs-practice/__tests__/app/snippet-detail-page.test.tsx` | 詳細画面テスト |
| 作成 | `nextjs-practice/__tests__/app/new-snippet-page.test.tsx` | 新規作成画面テスト |
| 作成 | `nextjs-practice/__tests__/app/edit-snippet-page.test.tsx` | 編集画面テスト |

---

## 前提確認

- `nextjs-practice/` ディレクトリで作業する
- テストコマンド: `npm test`（= `vitest run`）
- テスト環境: jsdom（`vitest.config.mts` で設定済み）
- `@/` パスエイリアスは `tsconfig.json` の `paths` で `nextjs-practice/` に解決される
- 依存パッケージは既にインストール済み（`dompurify`, `@testing-library/react`, `@testing-library/user-event` 等）

---

## Task 1: API クライアント (`lib/api.ts`)

**Files:**
- Create: `nextjs-practice/lib/api.ts`
- Test: `nextjs-practice/__tests__/lib/api.test.ts`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/lib/api.test.ts`:
```typescript
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
```

- [ ] **Step 2: テストが失敗することを確認する**

`nextjs-practice/` で実行:
```bash
npx vitest run __tests__/lib/api.test.ts
```
期待結果: `Failed to resolve import "@/lib/api"` などのエラーで FAIL

- [ ] **Step 3: `lib/api.ts` を実装する**

`nextjs-practice/lib/api.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

export interface Snippet {
  id: number
  title: string
  code: string
  language: string
  style: string
  linenos: boolean
  highlighted: string
}

export interface SnippetListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Snippet[]
}

export type SnippetInput = Omit<Snippet, 'id' | 'highlighted'>

export async function getSnippets(page = 1): Promise<SnippetListResponse> {
  const res = await fetch(`${BASE_URL}/snippets/?page=${page}`)
  if (!res.ok) throw new Error(`Failed to fetch snippets: ${res.status}`)
  return res.json()
}

export async function getSnippet(id: number): Promise<Snippet> {
  const res = await fetch(`${BASE_URL}/snippets/${id}/`)
  if (res.status === 404) throw new Error('Not found')
  if (!res.ok) throw new Error(`Failed to fetch snippet: ${res.status}`)
  return res.json()
}

export async function createSnippet(input: SnippetInput): Promise<Snippet> {
  const res = await fetch(`${BASE_URL}/snippets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Failed to create snippet: ${res.status}`)
  return res.json()
}

export async function updateSnippet(id: number, input: SnippetInput): Promise<Snippet> {
  const res = await fetch(`${BASE_URL}/snippets/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Failed to update snippet: ${res.status}`)
  return res.json()
}

export async function deleteSnippet(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/snippets/${id}/`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete snippet: ${res.status}`)
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/lib/api.test.ts
```
期待結果:
```
✓ __tests__/lib/api.test.ts (8)
Test Files  1 passed (1)
Tests  8 passed (8)
```

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/lib/api.ts nextjs-practice/__tests__/lib/api.test.ts
git commit -m "feat: add API client with fetch wrappers for snippets endpoint"
```

---

## Task 2: 定数ファイル (`lib/constants.ts`)

**Files:**
- Create: `nextjs-practice/lib/constants.ts`

- [ ] **Step 1: `lib/constants.ts` を作成する**

```typescript
export const LANGUAGE_CHOICES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
]

export const STYLE_CHOICES = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'default', label: 'Default' },
  { value: 'emacs', label: 'Emacs' },
  { value: 'vim', label: 'Vim' },
  { value: 'vs', label: 'Visual Studio' },
]
```

- [ ] **Step 2: コミット**

```bash
git add nextjs-practice/lib/constants.ts
git commit -m "feat: add language and style choices constants"
```

---

## Task 3: useSnippets フック

**Files:**
- Create: `nextjs-practice/hooks/useSnippets.ts`
- Test: `nextjs-practice/__tests__/hooks/useSnippets.test.ts`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/hooks/useSnippets.test.ts`:
```typescript
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/hooks/useSnippets.test.ts
```
期待結果: `Failed to resolve import "@/hooks/useSnippets"` で FAIL

- [ ] **Step 3: `hooks/useSnippets.ts` を実装する**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { getSnippets, SnippetListResponse } from '@/lib/api'

export function useSnippets(page = 1) {
  const [data, setData] = useState<SnippetListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setData(null)
    setError(null)
    try {
      const result = await getSnippets(page)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}
```

> **設計ポイント:** `load` を `useCallback` でメモ化し `useEffect` の依存配列に入れることで、`page` が変わるか `refetch()` が呼ばれたときだけ再取得する。

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/hooks/useSnippets.test.ts
```
期待結果:
```
✓ __tests__/hooks/useSnippets.test.ts (5)
Tests  5 passed (5)
```

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/hooks/useSnippets.ts nextjs-practice/__tests__/hooks/useSnippets.test.ts
git commit -m "feat: add useSnippets hook with page and refetch support"
```

---

## Task 4: useSnippet フック

**Files:**
- Create: `nextjs-practice/hooks/useSnippet.ts`
- Test: `nextjs-practice/__tests__/hooks/useSnippet.test.ts`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/hooks/useSnippet.test.ts`:
```typescript
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/hooks/useSnippet.test.ts
```
期待結果: FAIL

- [ ] **Step 3: `hooks/useSnippet.ts` を実装する**

```typescript
import { useState, useEffect } from 'react'
import { getSnippet, Snippet } from '@/lib/api'

export function useSnippet(id: number) {
  const [data, setData] = useState<Snippet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getSnippet(id)
      .then((result) => { if (!cancelled) setData(result) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e : new Error(String(e))) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  return { data, loading, error }
}
```

> **設計ポイント:** `cancelled` フラグでアンマウント後の setState を防ぐ（React の "Can't perform state update on unmounted component" 警告対策）。

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/hooks/useSnippet.test.ts
```
期待結果: `Tests  4 passed (4)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/hooks/useSnippet.ts nextjs-practice/__tests__/hooks/useSnippet.test.ts
git commit -m "feat: add useSnippet hook with unmount cleanup"
```

---

## Task 5: useCreateSnippet フック

**Files:**
- Create: `nextjs-practice/hooks/useCreateSnippet.ts`
- Test: `nextjs-practice/__tests__/hooks/useCreateSnippet.test.ts`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/hooks/useCreateSnippet.test.ts`:
```typescript
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/hooks/useCreateSnippet.test.ts
```
期待結果: FAIL

- [ ] **Step 3: `hooks/useCreateSnippet.ts` を実装する**

```typescript
import { useState } from 'react'
import { createSnippet, SnippetInput, Snippet } from '@/lib/api'

export function useCreateSnippet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function create(input: SnippetInput): Promise<Snippet> {
    setLoading(true)
    setError(null)
    try {
      return await createSnippet(input)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/hooks/useCreateSnippet.test.ts
```
期待結果: `Tests  4 passed (4)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/hooks/useCreateSnippet.ts nextjs-practice/__tests__/hooks/useCreateSnippet.test.ts
git commit -m "feat: add useCreateSnippet mutation hook"
```

---

## Task 6: useUpdateSnippet フック

**Files:**
- Create: `nextjs-practice/hooks/useUpdateSnippet.ts`
- Test: `nextjs-practice/__tests__/hooks/useUpdateSnippet.test.ts`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/hooks/useUpdateSnippet.test.ts`:
```typescript
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/hooks/useUpdateSnippet.test.ts
```
期待結果: FAIL

- [ ] **Step 3: `hooks/useUpdateSnippet.ts` を実装する**

```typescript
import { useState } from 'react'
import { updateSnippet, SnippetInput, Snippet } from '@/lib/api'

export function useUpdateSnippet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function update(id: number, input: SnippetInput): Promise<Snippet> {
    setLoading(true)
    setError(null)
    try {
      return await updateSnippet(id, input)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error }
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/hooks/useUpdateSnippet.test.ts
```
期待結果: `Tests  4 passed (4)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/hooks/useUpdateSnippet.ts nextjs-practice/__tests__/hooks/useUpdateSnippet.test.ts
git commit -m "feat: add useUpdateSnippet mutation hook"
```

---

## Task 7: useDeleteSnippet フック

**Files:**
- Create: `nextjs-practice/hooks/useDeleteSnippet.ts`
- Test: `nextjs-practice/__tests__/hooks/useDeleteSnippet.test.ts`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/hooks/useDeleteSnippet.test.ts`:
```typescript
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/hooks/useDeleteSnippet.test.ts
```
期待結果: FAIL

- [ ] **Step 3: `hooks/useDeleteSnippet.ts` を実装する**

```typescript
import { useState } from 'react'
import { deleteSnippet } from '@/lib/api'

export function useDeleteSnippet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function remove(id: number): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      await deleteSnippet(id)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { remove, loading, error }
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/hooks/useDeleteSnippet.test.ts
```
期待結果: `Tests  4 passed (4)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/hooks/useDeleteSnippet.ts nextjs-practice/__tests__/hooks/useDeleteSnippet.test.ts
git commit -m "feat: add useDeleteSnippet mutation hook"
```

---

## Task 8: SnippetCard コンポーネント

**Files:**
- Create: `nextjs-practice/components/snippets/SnippetCard.tsx`
- Test: `nextjs-practice/__tests__/components/SnippetCard.test.tsx`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/components/SnippetCard.test.tsx`:
```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnippetCard } from '@/components/snippets/SnippetCard'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

afterEach(cleanup)

const snippet = { id: 1, title: 'My Snippet', language: 'python' }

describe('SnippetCard', () => {
  it('タイトルを表示する', () => {
    render(<SnippetCard snippet={snippet} onDelete={vi.fn()} />)
    expect(screen.getByText('My Snippet')).toBeDefined()
  })

  it('言語を表示する', () => {
    render(<SnippetCard snippet={snippet} onDelete={vi.fn()} />)
    expect(screen.getByText('python')).toBeDefined()
  })

  it('詳細ページへのリンクを持つ', () => {
    render(<SnippetCard snippet={snippet} onDelete={vi.fn()} />)
    expect(screen.getByRole('link', { name: 'My Snippet' }).getAttribute('href')).toBe('/snippets/1')
  })

  it('タイトルが空の場合は "(タイトルなし)" を表示する', () => {
    render(<SnippetCard snippet={{ id: 2, title: '', language: 'go' }} onDelete={vi.fn()} />)
    expect(screen.getByText('(タイトルなし)')).toBeDefined()
  })

  it('削除ボタンを表示する', () => {
    render(<SnippetCard snippet={snippet} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: '削除' })).toBeDefined()
  })

  it('削除ボタンを押すと確認ダイアログが出て、確認後に onDelete を呼ぶ', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<SnippetCard snippet={snippet} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    expect(window.confirm).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('削除ダイアログをキャンセルすると onDelete を呼ばない', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SnippetCard snippet={snippet} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    expect(onDelete).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/components/SnippetCard.test.tsx
```
期待結果: FAIL

- [ ] **Step 3: `components/snippets/SnippetCard.tsx` を実装する**

```typescript
'use client'
import { memo } from 'react'
import Link from 'next/link'

interface SnippetCardProps {
  snippet: {
    id: number
    title: string
    language: string
  }
  onDelete: (id: number) => void
}

export const SnippetCard = memo(function SnippetCard({ snippet, onDelete }: SnippetCardProps) {
  const handleDelete = () => {
    const displayName = snippet.title || 'このスニペット'
    if (window.confirm(`「${displayName}」を削除しますか？`)) {
      onDelete(snippet.id)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={`/snippets/${snippet.id}`}
          className="text-indigo-600 hover:underline font-medium truncate"
        >
          {snippet.title || '(タイトルなし)'}
        </Link>
        <span className="shrink-0 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
          {snippet.language}
        </span>
      </div>
      <button
        onClick={handleDelete}
        className="shrink-0 ml-4 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
      >
        削除
      </button>
    </div>
  )
})
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/components/SnippetCard.test.tsx
```
期待結果: `Tests  7 passed (7)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/components/snippets/SnippetCard.tsx nextjs-practice/__tests__/components/SnippetCard.test.tsx
git commit -m "feat: add SnippetCard component with delete confirmation"
```

---

## Task 9: SnippetForm コンポーネント

**Files:**
- Create: `nextjs-practice/components/snippets/SnippetForm.tsx`
- Test: `nextjs-practice/__tests__/components/SnippetForm.test.tsx`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/components/SnippetForm.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnippetForm } from '@/components/snippets/SnippetForm'

describe('SnippetForm', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    onSubmit.mockReset()
    onCancel.mockReset()
  })

  afterEach(cleanup)

  it('コード・言語・スタイル・行番号表示のフィールドを表示する', () => {
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    expect(screen.getByLabelText('コード')).toBeDefined()
    expect(screen.getByLabelText('言語')).toBeDefined()
    expect(screen.getByLabelText('スタイル')).toBeDefined()
    expect(screen.getByLabelText('行番号表示')).toBeDefined()
  })

  it('デフォルト言語は python', () => {
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    expect((screen.getByLabelText('言語') as HTMLSelectElement).value).toBe('python')
  })

  it('デフォルトスタイルは friendly', () => {
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    expect((screen.getByLabelText('スタイル') as HTMLSelectElement).value).toBe('friendly')
  })

  it('initialData が渡された場合はフィールドに初期値をセットする', () => {
    const initialData = { title: 'my title', code: 'x=1', language: 'javascript', style: 'monokai', linenos: true }
    render(<SnippetForm initialData={initialData} onSubmit={onSubmit} onCancel={onCancel} />)
    expect((screen.getByLabelText('コード') as HTMLTextAreaElement).value).toBe('x=1')
    expect((screen.getByLabelText('言語') as HTMLSelectElement).value).toBe('javascript')
    expect((screen.getByLabelText('行番号表示') as HTMLInputElement).checked).toBe(true)
  })

  it('コードが空の場合はバリデーションエラーを表示して送信しない', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByText('コードは必須です')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('コードが2001文字の場合はバリデーションエラーを表示する', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.change(screen.getByLabelText('コード'), { target: { value: 'a'.repeat(2001) } })
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByText('コードは2,000文字以内で入力してください')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('バリデーション通過後に onSubmit をフォームデータで呼ぶ', async () => {
    onSubmit.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('コード'), 'print(1)')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'print(1)', language: 'python' })
    ))
  })

  it('onSubmit がエラーを投げた場合はサーバーエラーを表示する', async () => {
    onSubmit.mockRejectedValue(new Error('server error'))
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('コード'), 'x=1')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined())
    expect(screen.getByText('server error')).toBeDefined()
  })

  it('入力なしでキャンセルすると確認なしに onCancel を呼ぶ', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('入力後にキャンセルすると確認ダイアログを表示し、OKで onCancel を呼ぶ', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('コード'), 'x')
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(window.confirm).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it('入力後にキャンセルダイアログをキャンセルすると onCancel を呼ばない', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('コード'), 'x')
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onCancel).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/components/SnippetForm.test.tsx
```
期待結果: FAIL

- [ ] **Step 3: `components/snippets/SnippetForm.tsx` を実装する**

```typescript
'use client'
import { memo, useState } from 'react'
import { LANGUAGE_CHOICES, STYLE_CHOICES } from '@/lib/constants'

export interface SnippetFormData {
  title: string
  code: string
  language: string
  style: string
  linenos: boolean
}

interface SnippetFormProps {
  initialData?: SnippetFormData
  onSubmit: (data: SnippetFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const DEFAULT_DATA: SnippetFormData = {
  title: '',
  code: '',
  language: 'python',
  style: 'friendly',
  linenos: false,
}

export const SnippetForm = memo(function SnippetForm({ initialData, onSubmit, onCancel, submitLabel = '保存' }: SnippetFormProps) {
  const [formData, setFormData] = useState<SnippetFormData>(initialData ?? DEFAULT_DATA)
  const [errors, setErrors] = useState<{ code?: string; title?: string }>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const base = initialData ?? DEFAULT_DATA
  const isDirty = JSON.stringify(formData) !== JSON.stringify(base)

  const validate = (): boolean => {
    const newErrors: { code?: string; title?: string } = {}
    if (!formData.code.trim()) {
      newErrors.code = 'コードは必須です'
    } else if (formData.code.length > 2000) {
      newErrors.code = 'コードは2,000文字以内で入力してください'
    }
    if (formData.title.length > 100) {
      newErrors.title = 'タイトルは100文字以内で入力してください'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError(null)
    try {
      await onSubmit(formData)
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (isDirty && !window.confirm('保存していません。戻りますか？')) return
    onCancel()
  }

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const inputClass = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
  const errorClass = 'mt-1 text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError && (
        <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {serverError}
        </p>
      )}
      <div>
        <label htmlFor="title" className={labelClass}>タイトル</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={inputClass}
          placeholder="例: Python ソート関数"
        />
        {errors.title && <p className={errorClass}>{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="code" className={labelClass}>コード</label>
        <textarea
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className={`${inputClass} font-mono min-h-40 resize-y`}
          placeholder="コードを入力..."
        />
        {errors.code && <p className={errorClass}>{errors.code}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="language" className={labelClass}>言語</label>
          <select
            id="language"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className={inputClass}
          >
            {LANGUAGE_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="style" className={labelClass}>スタイル</label>
          <select
            id="style"
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
            className={inputClass}
          >
            {STYLE_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            aria-label="行番号表示"
            checked={formData.linenos}
            onChange={(e) => setFormData({ ...formData, linenos: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">行番号表示</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
})
```

> **設計ポイント:** `isDirty` は `JSON.stringify` で初期値と現在値を比較する。チェックボックスも含む全フィールドを一括比較できるためシンプルな実装になる。

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/components/SnippetForm.test.tsx
```
期待結果: `Tests  9 passed (9)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/components/snippets/SnippetForm.tsx nextjs-practice/__tests__/components/SnippetForm.test.tsx
git commit -m "feat: add SnippetForm component with validation and dirty-check cancel"
```

---

## Task 10: スニペット一覧画面

**Files:**
- Create: `nextjs-practice/app/snippets/page.tsx`
- Test: `nextjs-practice/__tests__/app/snippets-page.test.tsx`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/app/snippets-page.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SnippetsPage from '@/app/snippets/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useSnippets', () => ({ useSnippets: vi.fn() }))
vi.mock('@/hooks/useDeleteSnippet', () => ({ useDeleteSnippet: vi.fn() }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { useSnippets } from '@/hooks/useSnippets'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

const mockUseSnippets = vi.mocked(useSnippets)
const mockUseDeleteSnippet = vi.mocked(useDeleteSnippet)
const mockRemove = vi.fn()

beforeEach(() => {
  mockPush.mockReset()
  mockRemove.mockReset()
  mockUseDeleteSnippet.mockReturnValue({ remove: mockRemove, loading: false, error: null })
})

describe('SnippetsPage', () => {
  it('ローディング中は「読み込み中...」を表示する', () => {
    mockUseSnippets.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() })
    render(<SnippetsPage />)
    expect(screen.getByText('読み込み中...')).toBeDefined()
  })

  it('エラー時はエラーメッセージを表示する', () => {
    mockUseSnippets.mockReturnValue({ data: null, loading: false, error: new Error('network error'), refetch: vi.fn() })
    render(<SnippetsPage />)
    expect(screen.getByText('network error')).toBeDefined()
  })

  it('スニペットなし時は「スニペットがありません」を表示する', () => {
    mockUseSnippets.mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    expect(screen.getByText('スニペットがありません')).toBeDefined()
  })

  it('スニペット一覧を表示する', () => {
    mockUseSnippets.mockReturnValue({
      data: {
        count: 2, next: null, previous: null,
        results: [
          { id: 1, title: 'first', language: 'python', code: '', style: 'friendly', linenos: false, highlighted: '' },
          { id: 2, title: 'second', language: 'javascript', code: '', style: 'monokai', linenos: false, highlighted: '' },
        ],
      },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    expect(screen.getByText('first')).toBeDefined()
    expect(screen.getByText('second')).toBeDefined()
  })

  it('新規作成リンクを /snippets/new に表示する', () => {
    mockUseSnippets.mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    expect(screen.getByRole('link', { name: '新規作成' }).getAttribute('href')).toBe('/snippets/new')
  })

  it('next がある場合は「次へ」ボタンを表示し、押すと ?page=2 に遷移する', async () => {
    const user = userEvent.setup()
    mockUseSnippets.mockReturnValue({
      data: { count: 20, next: 'http://localhost:8000/snippets/?page=2', previous: null, results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    await user.click(screen.getByRole('button', { name: '次へ' }))
    expect(mockPush).toHaveBeenCalledWith('/snippets?page=2')
  })

  it('previous がある場合は「前へ」ボタンを表示する', () => {
    mockUseSnippets.mockReturnValue({
      data: { count: 20, next: null, previous: 'http://localhost:8000/snippets/?page=1', results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    expect(screen.getByRole('button', { name: '前へ' })).toBeDefined()
  })

  it('DRFがpageパラメータを省略したprevious URLでも「前へ」ボタンが /snippets?page=1 に遷移する', async () => {
    const user = userEvent.setup()
    mockUseSnippets.mockReturnValue({
      data: { count: 20, next: null, previous: 'http://localhost:8000/snippets/', results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    await user.click(screen.getByRole('button', { name: '前へ' }))
    expect(mockPush).toHaveBeenCalledWith('/snippets?page=1')
  })

  it('削除成功後に refetch を呼ぶ', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockRemove.mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockUseSnippets.mockReturnValue({
      data: {
        count: 1, next: null, previous: null,
        results: [{ id: 1, title: 'test', language: 'python', code: '', style: 'friendly', linenos: false, highlighted: '' }],
      },
      loading: false, error: null, refetch,
    })
    render(<SnippetsPage />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    await waitFor(() => expect(refetch).toHaveBeenCalled())
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/app/snippets-page.test.tsx
```
期待結果: FAIL

- [ ] **Step 3: `app/snippets/page.tsx` を実装する**

```typescript
'use client'
import { useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSnippets } from '@/hooks/useSnippets'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'
import { SnippetCard } from '@/components/snippets/SnippetCard'

export default function SnippetsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = Number(searchParams.get('page') ?? '1')
  const { data, loading, error, refetch } = useSnippets(page)
  const { remove, error: deleteError } = useDeleteSnippet()

  const handleDelete = useCallback(async (id: number) => {
    try {
      await remove(id)
      await refetch()
    } catch {
      // error は deleteError に反映済み
    }
  }, [remove, refetch])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">読み込み中...</p>
    </div>
  )
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error.message}</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">スニペット一覧</h1>
        <Link
          href="/snippets/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      {deleteError && (
        <p role="alert" className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {deleteError.message}
        </p>
      )}
      {data?.results.length === 0 && (
        <p className="text-gray-500 text-center py-12">スニペットがありません</p>
      )}
      <div className="space-y-2">
        {data?.results.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} onDelete={handleDelete} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div>
          {data?.previous && (
            <button
              onClick={() => router.push(`/snippets?page=${new URL(data.previous!).searchParams.get('page') ?? '1'}`)}
              className="text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              前へ
            </button>
          )}
        </div>
        {data && <span className="text-sm text-gray-500">ページ {page}</span>}
        <div>
          {data?.next && (
            <button
              onClick={() => router.push(`/snippets?page=${new URL(data.next!).searchParams.get('page')}`)}
              className="text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              次へ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

> **設計ポイント:** `previous` URL の `page` パラメータ取得に `?? '1'` フォールバックを付ける。DRF は1ページ目の `previous` URL に `?page=` を省略するため、フォールバックなしだと `undefined` になる。

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/app/snippets-page.test.tsx
```
期待結果: `Tests  9 passed (9)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/app/snippets/page.tsx nextjs-practice/__tests__/app/snippets-page.test.tsx
git commit -m "feat: add snippets list page with pagination and inline delete"
```

---

## Task 11: スニペット詳細画面

**Files:**
- Create: `nextjs-practice/app/snippets/[id]/page.tsx`
- Test: `nextjs-practice/__tests__/app/snippet-detail-page.test.tsx`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/app/snippet-detail-page.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SnippetDetailPage from '@/app/snippets/[id]/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useSnippet', () => ({ useSnippet: vi.fn() }))
vi.mock('@/hooks/useDeleteSnippet', () => ({ useDeleteSnippet: vi.fn() }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { useSnippet } from '@/hooks/useSnippet'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

const mockUseSnippet = vi.mocked(useSnippet)
const mockUseDeleteSnippet = vi.mocked(useDeleteSnippet)
const mockRemove = vi.fn()

beforeEach(() => {
  mockPush.mockReset()
  mockRemove.mockReset()
  mockUseDeleteSnippet.mockReturnValue({ remove: mockRemove, loading: false, error: null })
})

const mockSnippet = {
  id: 1, title: 'My Snippet', code: 'print(1)', language: 'python',
  style: 'friendly', linenos: false, highlighted: '<pre>print(1)</pre>',
}

describe('SnippetDetailPage', () => {
  it('ローディング中は「読み込み中...」を表示する', () => {
    mockUseSnippet.mockReturnValue({ data: null, loading: true, error: null })
    render(<SnippetDetailPage />)
    expect(screen.getByText('読み込み中...')).toBeDefined()
  })

  it('Not found エラー時は「スニペットが見つかりません」を表示する', () => {
    mockUseSnippet.mockReturnValue({ data: null, loading: false, error: new Error('Not found') })
    render(<SnippetDetailPage />)
    expect(screen.getByText('スニペットが見つかりません')).toBeDefined()
  })

  it('タイトル・言語・スタイルを表示する', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    expect(screen.getByText('My Snippet')).toBeDefined()
    expect(screen.getByText(/python/)).toBeDefined()
    expect(screen.getByText(/friendly/)).toBeDefined()
  })

  it('highlighted HTML をレンダリングする', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    const { container } = render(<SnippetDetailPage />)
    expect(container.querySelector('pre')).not.toBeNull()
  })

  it('編集ボタンが /snippets/1/edit にリンクしている', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    expect(screen.getByRole('link', { name: '編集' }).getAttribute('href')).toBe('/snippets/1/edit')
  })

  it('一覧に戻るリンクが /snippets にリンクしている', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    expect(screen.getByRole('link', { name: '一覧に戻る' }).getAttribute('href')).toBe('/snippets')
  })

  it('削除ボタンを押して確認後、/snippets に遷移する', async () => {
    const user = userEvent.setup()
    mockRemove.mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/snippets'))
  })

  it('削除確認をキャンセルした場合は /snippets に遷移しない', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    expect(mockPush).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/app/snippet-detail-page.test.tsx
```
期待結果: FAIL

- [ ] **Step 3: `app/snippets/[id]/page.tsx` を実装する**

```typescript
'use client'
import DOMPurify from 'dompurify'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSnippet } from '@/hooks/useSnippet'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

export default function SnippetDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data: snippet, loading, error } = useSnippet(id)
  const { remove, error: deleteError } = useDeleteSnippet()

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">読み込み中...</p>
    </div>
  )
  if (error?.message === 'Not found') return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">スニペットが見つかりません</p>
    </div>
  )
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error.message}</p>
    </div>
  )
  if (!snippet) return null

  const handleDelete = async () => {
    if (!window.confirm(`「${snippet.title || 'このスニペット'}」を削除しますか？`)) return
    try {
      await remove(id)
      router.push('/snippets')
    } catch {
      // deleteError に反映済み
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/snippets" className="text-indigo-600 hover:underline text-sm inline-block mb-6">
        一覧に戻る
      </Link>
      {deleteError && (
        <p role="alert" className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {deleteError.message}
        </p>
      )}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {snippet.title || '(タイトルなし)'}
        </h1>
        <dl className="grid grid-cols-3 gap-3 mb-6 text-sm">
          <div>
            <dt className="text-gray-500 mb-0.5">言語</dt>
            <dd className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded inline-block">{snippet.language}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-0.5">スタイル</dt>
            <dd className="text-gray-800">{snippet.style}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-0.5">行番号</dt>
            <dd className="text-gray-800">{snippet.linenos ? '有効' : '無効'}</dd>
          </div>
        </dl>
        <div
          className="overflow-auto rounded-lg border border-gray-200 text-sm"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(snippet.highlighted) }}
        />
      </div>
      <div className="flex gap-3 mt-6">
        <Link
          href={`/snippets/${id}/edit`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          編集
        </Link>
        <button
          onClick={handleDelete}
          className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 border border-red-200 rounded-lg transition-colors"
        >
          削除
        </button>
      </div>
    </div>
  )
}
```

> **設計ポイント:** `highlighted` フィールドは DRF が Pygments で生成した HTML。`dangerouslySetInnerHTML` で挿入するため、`DOMPurify.sanitize()` で XSS を防ぐ。

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/app/snippet-detail-page.test.tsx
```
期待結果: `Tests  8 passed (8)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/app/snippets/[id]/page.tsx nextjs-practice/__tests__/app/snippet-detail-page.test.tsx
git commit -m "feat: add snippet detail page with DOMPurify-sanitized highlight rendering"
```

---

## Task 12: 新規作成画面

**Files:**
- Create: `nextjs-practice/app/snippets/new/page.tsx`
- Test: `nextjs-practice/__tests__/app/new-snippet-page.test.tsx`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/app/new-snippet-page.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewSnippetPage from '@/app/snippets/new/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useCreateSnippet', () => ({ useCreateSnippet: vi.fn() }))

import { useCreateSnippet } from '@/hooks/useCreateSnippet'

const mockUseCreateSnippet = vi.mocked(useCreateSnippet)
const mockCreate = vi.fn()

beforeEach(() => {
  mockPush.mockReset()
  mockCreate.mockReset()
  mockUseCreateSnippet.mockReturnValue({ create: mockCreate, loading: false, error: null })
})

describe('NewSnippetPage', () => {
  it('フォームを表示する', () => {
    render(<NewSnippetPage />)
    expect(screen.getByLabelText('コード')).toBeDefined()
    expect(screen.getByRole('button', { name: '保存' })).toBeDefined()
  })

  it('保存成功後に /snippets に遷移する', async () => {
    const user = userEvent.setup()
    const created = { id: 1, title: '', code: 'x=1', language: 'python', style: 'friendly', linenos: false, highlighted: '' }
    mockCreate.mockResolvedValue(created)
    render(<NewSnippetPage />)
    await user.type(screen.getByLabelText('コード'), 'x=1')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/snippets'))
  })

  it('キャンセルすると /snippets に遷移する', async () => {
    const user = userEvent.setup()
    render(<NewSnippetPage />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(mockPush).toHaveBeenCalledWith('/snippets')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/app/new-snippet-page.test.tsx
```
期待結果: FAIL

- [ ] **Step 3: `app/snippets/new/page.tsx` を実装する**

```typescript
'use client'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateSnippet } from '@/hooks/useCreateSnippet'
import { SnippetForm, SnippetFormData } from '@/components/snippets/SnippetForm'

export default function NewSnippetPage() {
  const router = useRouter()
  const { create } = useCreateSnippet()

  const handleSubmit = useCallback(async (data: SnippetFormData) => {
    await create(data)
    router.push('/snippets')
  }, [create, router])

  const handleCancel = useCallback(() => {
    router.push('/snippets')
  }, [router])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規作成</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SnippetForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/app/new-snippet-page.test.tsx
```
期待結果: `Tests  3 passed (3)`

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/app/snippets/new/page.tsx nextjs-practice/__tests__/app/new-snippet-page.test.tsx
git commit -m "feat: add new snippet page"
```

---

## Task 13: 編集画面

**Files:**
- Create: `nextjs-practice/app/snippets/[id]/edit/page.tsx`
- Test: `nextjs-practice/__tests__/app/edit-snippet-page.test.tsx`

- [ ] **Step 1: テストファイルを作成する**

`nextjs-practice/__tests__/app/edit-snippet-page.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditSnippetPage from '@/app/snippets/[id]/edit/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useSnippet', () => ({ useSnippet: vi.fn() }))
vi.mock('@/hooks/useUpdateSnippet', () => ({ useUpdateSnippet: vi.fn() }))

import { useSnippet } from '@/hooks/useSnippet'
import { useUpdateSnippet } from '@/hooks/useUpdateSnippet'

const mockUseSnippet = vi.mocked(useSnippet)
const mockUseUpdateSnippet = vi.mocked(useUpdateSnippet)
const mockUpdate = vi.fn()

beforeEach(() => {
  mockPush.mockReset()
  mockUpdate.mockReset()
  mockUseUpdateSnippet.mockReturnValue({ update: mockUpdate, loading: false, error: null })
})

const mockSnippet = {
  id: 1, title: 'Original', code: 'x=0', language: 'python',
  style: 'friendly', linenos: false, highlighted: '',
}

describe('EditSnippetPage', () => {
  it('ローディング中は「読み込み中...」を表示する', () => {
    mockUseSnippet.mockReturnValue({ data: null, loading: true, error: null })
    render(<EditSnippetPage />)
    expect(screen.getByText('読み込み中...')).toBeDefined()
  })

  it('Not found エラー時は「スニペットが見つかりません」を表示する', () => {
    mockUseSnippet.mockReturnValue({ data: null, loading: false, error: new Error('Not found') })
    render(<EditSnippetPage />)
    expect(screen.getByText('スニペットが見つかりません')).toBeDefined()
  })

  it('既存データをフォームの初期値としてセットする', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<EditSnippetPage />)
    expect((screen.getByLabelText('コード') as HTMLTextAreaElement).value).toBe('x=0')
  })

  it('保存成功後に /snippets/1 に遷移する', async () => {
    const user = userEvent.setup()
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    mockUpdate.mockResolvedValue({ ...mockSnippet, code: 'x=1', highlighted: '' })
    render(<EditSnippetPage />)
    await user.click(screen.getByRole('button', { name: '更新' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/snippets/1'))
  })

  it('キャンセルすると /snippets/1 に遷移する', async () => {
    const user = userEvent.setup()
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<EditSnippetPage />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(mockPush).toHaveBeenCalledWith('/snippets/1')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run __tests__/app/edit-snippet-page.test.tsx
```
期待結果: FAIL

- [ ] **Step 3: `app/snippets/[id]/edit/page.tsx` を実装する**

```typescript
'use client'
import { useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSnippet } from '@/hooks/useSnippet'
import { useUpdateSnippet } from '@/hooks/useUpdateSnippet'
import { SnippetForm, SnippetFormData } from '@/components/snippets/SnippetForm'

export default function EditSnippetPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data: snippet, loading, error } = useSnippet(id)
  const { update } = useUpdateSnippet()

  const initialData = useMemo<SnippetFormData | undefined>(() => {
    if (!snippet) return undefined
    return {
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      style: snippet.style,
      linenos: snippet.linenos,
    }
  }, [snippet])

  const handleSubmit = useCallback(async (data: SnippetFormData) => {
    await update(id, data)
    router.push(`/snippets/${id}`)
  }, [update, id, router])

  const handleCancel = useCallback(() => {
    router.push(`/snippets/${id}`)
  }, [id, router])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">読み込み中...</p>
    </div>
  )
  if (error?.message === 'Not found') return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">スニペットが見つかりません</p>
    </div>
  )
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error.message}</p>
    </div>
  )
  if (!snippet) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">編集</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SnippetForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="更新"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run __tests__/app/edit-snippet-page.test.tsx
```
期待結果: `Tests  5 passed (5)`

- [ ] **Step 5: 全テストを実行する**

```bash
npm test
```
期待結果:
```
Test Files  12 passed (12)
Tests       XX passed (XX)
```

- [ ] **Step 6: コミット**

```bash
git add nextjs-practice/app/snippets/[id]/edit/page.tsx nextjs-practice/__tests__/app/edit-snippet-page.test.tsx
git commit -m "feat: add edit snippet page"
```
