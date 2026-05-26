# スニペット管理フロントエンド 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DRF-practiceバックエンド（`http://localhost:8000`）と連携するNext.jsスニペット管理アプリを実装する

**Architecture:** App RouterのClient Componentsで構築。SWRでデータフェッチ・キャッシュ、react-hook-form + ZodでフォームバリデーHook管理。編集ページはServer Componentでparamsを解決してClientコンポーネントにpropsで渡す。

**Tech Stack:** Next.js 16.2.6 (App Router), SWR, react-hook-form, @hookform/resolvers, Zod, Tailwind CSS v4

---

## ⚠️ Next.js 16 注意事項

- **`params` は Promise** — `const { id } = await params`（Server Component）または `React.use(params)`（Client Component）が必要
- **クライアントコンポーネント** — SWR・react-hook-formを使うファイルには `'use client'` が必要
- **PageProps ヘルパー** — `PageProps<'/snippets/[id]/edit'>` は `next dev` 実行後に自動生成される型
- 詳細は `nextjs-practice/node_modules/next/dist/docs/` を参照

---

## ファイルマップ

| ファイル | 役割 | 新規/変更 |
|----------|------|-----------|
| `DRF-practice/snippets/views.py` | AllowAnyパーミッション追加 | 変更 |
| `nextjs-practice/types/index.ts` | Snippet型定義 | 新規 |
| `nextjs-practice/schemas/snippet.ts` | Zodスキーマ・型推論 | 新規 |
| `nextjs-practice/lib/api.ts` | fetch関数（CRUD）・API_BASE定数 | 新規 |
| `nextjs-practice/hooks/useSnippets.ts` | SWR: 一覧取得 | 新規 |
| `nextjs-practice/hooks/useSnippet.ts` | SWR: 1件取得 | 新規 |
| `nextjs-practice/hooks/useCreateSnippet.ts` | POST /snippets/ | 新規 |
| `nextjs-practice/hooks/useUpdateSnippet.ts` | PUT /snippets/{id}/ | 新規 |
| `nextjs-practice/hooks/useDeleteSnippet.ts` | DELETE /snippets/{id}/ | 新規 |
| `nextjs-practice/app/page.tsx` | スニペット一覧（テーブル） | 変更 |
| `nextjs-practice/app/snippets/new/page.tsx` | 新規作成フォーム | 新規 |
| `nextjs-practice/app/snippets/[id]/edit/page.tsx` | Server Component（params解決） | 新規 |
| `nextjs-practice/app/snippets/[id]/edit/EditSnippetForm.tsx` | 編集フォーム（Client Component） | 新規 |

---

## Task 0: DRFバックエンドのパーミッション変更

**Files:**
- Modify: `DRF-practice/snippets/views.py`

- [ ] **Step 1: views.py を修正**

`DRF-practice/snippets/views.py` の `SnippetViewSet` に `permission_classes` を追加する：

```python
from django.contrib.auth.models import User
from rest_framework import generics, permissions, renderers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from snippets.models import Snippet
from snippets.serializers import SnippetSerializer, UserSerializer
from snippets.permissions import IsOwnerOrReadOnly


class SnippetViewSet(viewsets.ModelViewSet):
    queryset = Snippet.objects.all()
    serializer_class = SnippetSerializer
    permission_classes = [AllowAny]

    @action(detail=True, renderer_classes=[renderers.StaticHTMLRenderer])
    def highlight(self, request, *args, **kwargs):
        snippet = self.get_object()
        return Response(snippet.highlighted)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(owner=self.request.user)
        else:
            serializer.save(owner=None)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
```

- [ ] **Step 2: Dockerを起動してAPIの動作確認**

```bash
cd DRF-practice
docker compose up -d
```

起動後、別ターミナルで確認：

```bash
curl -s http://localhost:8000/snippets/ | python -m json.tool
```

期待結果（認証なしでアクセスできる）:
```json
{
    "count": 0,
    "next": null,
    "previous": null,
    "results": []
}
```

401や403が返る場合はDockerが起動していないか、設定が誤っている。

- [ ] **Step 3: コミット**

```bash
git add DRF-practice/snippets/views.py
git commit -m "feat: SnippetViewSetにAllowAnyパーミッションを追加"
```

---

## Task 1: パッケージインストール

**Files:**
- Modify: `nextjs-practice/package.json`（npm installで自動更新）

- [ ] **Step 1: 必要なパッケージをインストール**

```bash
cd nextjs-practice
npm install swr react-hook-form @hookform/resolvers zod
```

- [ ] **Step 2: テスト用パッケージをインストール（Zodスキーマ単体テスト用）**

```bash
npm install --save-dev jest @types/jest ts-jest
```

- [ ] **Step 3: jest.config.ts を作成**

`nextjs-practice/jest.config.ts`:
```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
```

- [ ] **Step 4: package.json に test スクリプトを追加**

`nextjs-practice/package.json` を開き、`scripts` に追加：
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "jest"
  }
}
```

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/package.json nextjs-practice/package-lock.json nextjs-practice/jest.config.ts
git commit -m "chore: SWR, react-hook-form, Zod, Jest をインストール"
```

---

## Task 2: 型定義

**Files:**
- Create: `nextjs-practice/types/index.ts`

- [ ] **Step 1: Snippet 型を作成**

`nextjs-practice/types/index.ts`:
```ts
export type Snippet = {
  id: number
  url: string
  title: string
  code: string
  language: string
  style: string
  linenos: boolean
  owner: string | null
  highlight: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
```

- [ ] **Step 2: コミット**

```bash
git add nextjs-practice/types/index.ts
git commit -m "feat: Snippet型定義を追加"
```

---

## Task 3: Zodスキーマ（TDD）

**Files:**
- Create: `nextjs-practice/schemas/snippet.ts`
- Create: `nextjs-practice/__tests__/schemas/snippet.test.ts`

- [ ] **Step 1: テストファイルを作成**

`nextjs-practice/__tests__/schemas/snippet.test.ts`:
```ts
import { snippetSchema } from '@/schemas/snippet'

describe('snippetSchema', () => {
  it('有効なデータはバリデーションを通過する', () => {
    const result = snippetSchema.safeParse({
      title: 'Hello World',
      code: 'console.log("hello")',
      language: 'javascript',
      style: 'monokai',
      linenos: false,
    })
    expect(result.success).toBe(true)
  })

  it('titleが空の場合はバリデーションエラーになる', () => {
    const result = snippetSchema.safeParse({
      title: '',
      code: 'console.log("hello")',
      language: 'javascript',
      style: 'monokai',
      linenos: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('タイトルを入力してください')
    }
  })

  it('codeが空の場合はバリデーションエラーになる', () => {
    const result = snippetSchema.safeParse({
      title: 'Hello',
      code: '',
      language: 'javascript',
      style: 'monokai',
      linenos: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('コードを入力してください')
    }
  })

  it('languageが空の場合はバリデーションエラーになる', () => {
    const result = snippetSchema.safeParse({
      title: 'Hello',
      code: 'print()',
      language: '',
      style: 'monokai',
      linenos: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('言語を入力してください')
    }
  })

  it('styleが空の場合はバリデーションエラーになる', () => {
    const result = snippetSchema.safeParse({
      title: 'Hello',
      code: 'print()',
      language: 'python',
      style: '',
      linenos: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('スタイルを入力してください')
    }
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
cd nextjs-practice && npx jest __tests__/schemas/snippet.test.ts
```

期待結果: `FAIL` — `Cannot find module '@/schemas/snippet'`

- [ ] **Step 3: Zodスキーマを実装**

`nextjs-practice/schemas/snippet.ts`:
```ts
import { z } from 'zod'

export const snippetSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  code: z.string().min(1, 'コードを入力してください'),
  language: z.string().min(1, '言語を入力してください'),
  style: z.string().min(1, 'スタイルを入力してください'),
  linenos: z.boolean(),
})

export type SnippetFormInput = z.infer<typeof snippetSchema>
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx jest __tests__/schemas/snippet.test.ts
```

期待結果: `PASS` — 5 tests passed

- [ ] **Step 5: コミット**

```bash
git add nextjs-practice/schemas/snippet.ts nextjs-practice/__tests__/schemas/snippet.test.ts
git commit -m "feat: Zodスキーマを追加（TDD）"
```

---

## Task 4: API関数

**Files:**
- Create: `nextjs-practice/lib/api.ts`

- [ ] **Step 1: API関数を実装**

`nextjs-practice/lib/api.ts`:
```ts
import type { PaginatedResponse, Snippet } from '@/types'
import type { SnippetFormInput } from '@/schemas/snippet'

export const API_BASE = 'http://localhost:8000'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || 'APIエラーが発生しました')
  }
  return res.json() as Promise<T>
}

export async function fetchSnippets(): Promise<PaginatedResponse<Snippet>> {
  const res = await fetch(`${API_BASE}/snippets/`)
  return handleResponse(res)
}

export async function fetchSnippet(id: number): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/${id}/`)
  return handleResponse(res)
}

export async function createSnippet(data: SnippetFormInput): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateSnippet(id: number, data: SnippetFormInput): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteSnippet(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/snippets/${id}/`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || '削除に失敗しました')
  }
}
```

- [ ] **Step 2: コミット**

```bash
git add nextjs-practice/lib/api.ts
git commit -m "feat: API関数を追加"
```

---

## Task 5: SWR取得フック

**Files:**
- Create: `nextjs-practice/hooks/useSnippets.ts`
- Create: `nextjs-practice/hooks/useSnippet.ts`

- [ ] **Step 1: useSnippets を実装**

`nextjs-practice/hooks/useSnippets.ts`:
```ts
import useSWR from 'swr'
import { fetchSnippets, API_BASE } from '@/lib/api'
import type { Snippet } from '@/types'

export const SNIPPETS_KEY = `${API_BASE}/snippets/`

export function useSnippets() {
  const { data, error, isLoading } = useSWR(SNIPPETS_KEY, fetchSnippets)

  return {
    snippets: data?.results ?? [],
    isLoading,
    error,
  }
}
```

- [ ] **Step 2: useSnippet を実装**

`nextjs-practice/hooks/useSnippet.ts`:
```ts
import useSWR from 'swr'
import { fetchSnippet, API_BASE } from '@/lib/api'
import type { Snippet } from '@/types'

export function snippetKey(id: number) {
  return `${API_BASE}/snippets/${id}/`
}

export function useSnippet(id: number) {
  const { data, error, isLoading } = useSWR(snippetKey(id), () => fetchSnippet(id))

  return {
    snippet: data,
    isLoading,
    error,
  }
}
```

- [ ] **Step 3: コミット**

```bash
git add nextjs-practice/hooks/useSnippets.ts nextjs-practice/hooks/useSnippet.ts
git commit -m "feat: SWR取得フック（useSnippets, useSnippet）を追加"
```

---

## Task 6: SWR更新フック

**Files:**
- Create: `nextjs-practice/hooks/useCreateSnippet.ts`
- Create: `nextjs-practice/hooks/useUpdateSnippet.ts`
- Create: `nextjs-practice/hooks/useDeleteSnippet.ts`

- [ ] **Step 1: useCreateSnippet を実装**

`nextjs-practice/hooks/useCreateSnippet.ts`:
```ts
import { useState } from 'react'
import { mutate } from 'swr'
import { createSnippet } from '@/lib/api'
import { SNIPPETS_KEY } from '@/hooks/useSnippets'
import type { SnippetFormInput } from '@/schemas/snippet'

export function useCreateSnippet() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create(data: SnippetFormInput): Promise<boolean> {
    setIsLoading(true)
    setError(null)
    try {
      await createSnippet(data)
      await mutate(SNIPPETS_KEY)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : '作成に失敗しました')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, error }
}
```

- [ ] **Step 2: useUpdateSnippet を実装**

`nextjs-practice/hooks/useUpdateSnippet.ts`:
```ts
import { useState } from 'react'
import { mutate } from 'swr'
import { updateSnippet } from '@/lib/api'
import { SNIPPETS_KEY } from '@/hooks/useSnippets'
import { snippetKey } from '@/hooks/useSnippet'
import type { SnippetFormInput } from '@/schemas/snippet'

export function useUpdateSnippet() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function update(id: number, data: SnippetFormInput): Promise<boolean> {
    setIsLoading(true)
    setError(null)
    try {
      await updateSnippet(id, data)
      await mutate(SNIPPETS_KEY)
      await mutate(snippetKey(id))
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新に失敗しました')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { update, isLoading, error }
}
```

- [ ] **Step 3: useDeleteSnippet を実装**

`nextjs-practice/hooks/useDeleteSnippet.ts`:
```ts
import { useState } from 'react'
import { mutate } from 'swr'
import { deleteSnippet } from '@/lib/api'
import { SNIPPETS_KEY } from '@/hooks/useSnippets'

export function useDeleteSnippet() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove(id: number): Promise<boolean> {
    setIsLoading(true)
    setError(null)
    try {
      await deleteSnippet(id)
      await mutate(SNIPPETS_KEY)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { remove, isLoading, error }
}
```

- [ ] **Step 4: コミット**

```bash
git add nextjs-practice/hooks/useCreateSnippet.ts nextjs-practice/hooks/useUpdateSnippet.ts nextjs-practice/hooks/useDeleteSnippet.ts
git commit -m "feat: SWR更新フック（useCreateSnippet, useUpdateSnippet, useDeleteSnippet）を追加"
```

---

## Task 7: 一覧ページ

**Files:**
- Modify: `nextjs-practice/app/page.tsx`

- [ ] **Step 1: 一覧ページを実装**

`nextjs-practice/app/page.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { useSnippets } from '@/hooks/useSnippets'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

export default function HomePage() {
  const { snippets, isLoading, error } = useSnippets()
  const { remove, isLoading: isDeleting } = useDeleteSnippet()

  if (isLoading) return <p className="p-8 text-gray-500">読み込み中...</p>
  if (error) return <p className="p-8 text-red-500">データの取得に失敗しました</p>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">スニペット一覧</h1>
        <Link
          href="/snippets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      {snippets.length === 0 ? (
        <p className="text-gray-500">スニペットがありません</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-200">タイトル</th>
              <th className="text-left p-3 border border-gray-200">言語</th>
              <th className="p-3 border border-gray-200">編集</th>
              <th className="p-3 border border-gray-200">削除</th>
            </tr>
          </thead>
          <tbody>
            {snippets.map((snippet) => (
              <tr key={snippet.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-200">{snippet.title}</td>
                <td className="p-3 border border-gray-200">
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded-full">
                    {snippet.language}
                  </span>
                </td>
                <td className="p-3 border border-gray-200 text-center">
                  <Link
                    href={`/snippets/${snippet.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    編集
                  </Link>
                </td>
                <td className="p-3 border border-gray-200 text-center">
                  <button
                    onClick={() => remove(snippet.id)}
                    disabled={isDeleting}
                    className="text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 開発サーバーを起動して動作確認**

```bash
cd nextjs-practice && npm run dev
```

ブラウザで `http://localhost:3000` を開き確認：
- 一覧テーブルが表示される（DRFが起動していること）
- 「新規作成」ボタンが表示される
- スニペットがある場合はタイトル・言語・編集・削除ボタンが表示される

- [ ] **Step 3: コミット**

```bash
git add nextjs-practice/app/page.tsx
git commit -m "feat: スニペット一覧ページを実装"
```

---

## Task 8: 新規作成ページ

**Files:**
- Create: `nextjs-practice/app/snippets/new/page.tsx`

- [ ] **Step 1: 新規作成ページを実装**

`nextjs-practice/app/snippets/new/page.tsx`:
```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { snippetSchema, type SnippetFormInput } from '@/schemas/snippet'
import { useCreateSnippet } from '@/hooks/useCreateSnippet'

export default function NewSnippetPage() {
  const router = useRouter()
  const { create, isLoading, error: apiError } = useCreateSnippet()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SnippetFormInput>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: '',
      code: '',
      language: 'python',
      style: 'monokai',
      linenos: false,
    },
  })

  const onSubmit = async (data: SnippetFormInput) => {
    const success = await create(data)
    if (success) router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          ← 一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">スニペットを新規作成</h1>
      </div>

      {apiError && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200">
          {apiError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="FizzBuzz in Python"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              言語 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('language')}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="python"
            />
            {errors.language && (
              <p className="mt-1 text-sm text-red-500">{errors.language.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スタイル <span className="text-red-500">*</span>
            </label>
            <input
              {...register('style')}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="monokai"
            />
            {errors.style && (
              <p className="mt-1 text-sm text-red-500">{errors.style.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            コード <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('code')}
            rows={10}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="for i in range(1, 101):"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            {...register('linenos')}
            type="checkbox"
            id="linenos"
            className="w-4 h-4"
          />
          <label htmlFor="linenos" className="text-sm font-medium text-gray-700">
            行番号を表示する
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: ブラウザで動作確認**

`http://localhost:3000/snippets/new` を開き確認：
- フォームが表示される
- 空で送信すると各フィールドにバリデーションエラーが表示される（「タイトルを入力してください」等）
- 正しく入力して保存すると一覧画面に遷移し、作成されたスニペットが表示される

- [ ] **Step 3: コミット**

```bash
git add nextjs-practice/app/snippets/
git commit -m "feat: スニペット新規作成ページを実装"
```

---

## Task 9: 編集ページ

**Files:**
- Create: `nextjs-practice/app/snippets/[id]/edit/page.tsx`
- Create: `nextjs-practice/app/snippets/[id]/edit/EditSnippetForm.tsx`

> **Note:** Next.js 16 では `params` が `Promise` になった。Server Component の `page.tsx` でawaitして解決した `id` を Client Component に渡す。

- [ ] **Step 1: EditSnippetForm（Client Component）を実装**

`nextjs-practice/app/snippets/[id]/edit/EditSnippetForm.tsx`:
```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { snippetSchema, type SnippetFormInput } from '@/schemas/snippet'
import { useSnippet } from '@/hooks/useSnippet'
import { useUpdateSnippet } from '@/hooks/useUpdateSnippet'

export default function EditSnippetForm({ snippetId }: { snippetId: number }) {
  const router = useRouter()
  const { snippet, isLoading: isFetching, error: fetchError } = useSnippet(snippetId)
  const { update, isLoading: isUpdating, error: apiError } = useUpdateSnippet()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SnippetFormInput>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: '',
      code: '',
      language: 'python',
      style: 'monokai',
      linenos: false,
    },
  })

  useEffect(() => {
    if (snippet) {
      reset({
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        style: snippet.style,
        linenos: snippet.linenos,
      })
    }
  }, [snippet, reset])

  const onSubmit = async (data: SnippetFormInput) => {
    const success = await update(snippetId, data)
    if (success) router.push('/')
  }

  if (isFetching) return <p className="p-8 text-gray-500">読み込み中...</p>
  if (fetchError) return <p className="p-8 text-red-500">スニペットの取得に失敗しました</p>

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          ← 一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">スニペットを編集</h1>
      </div>

      {apiError && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200">
          {apiError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              言語 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('language')}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.language && (
              <p className="mt-1 text-sm text-red-500">{errors.language.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スタイル <span className="text-red-500">*</span>
            </label>
            <input
              {...register('style')}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.style && (
              <p className="mt-1 text-sm text-red-500">{errors.style.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            コード <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('code')}
            rows={10}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            {...register('linenos')}
            type="checkbox"
            id="linenos"
            className="w-4 h-4"
          />
          <label htmlFor="linenos" className="text-sm font-medium text-gray-700">
            行番号を表示する
          </label>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: page.tsx（Server Component）を実装**

`nextjs-practice/app/snippets/[id]/edit/page.tsx`:
```tsx
import EditSnippetForm from './EditSnippetForm'

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditSnippetForm snippetId={Number(id)} />
}
```

- [ ] **Step 3: ブラウザで動作確認**

一覧ページで「編集」をクリックし確認：
- 現在の値がフォームに表示される
- 変更して保存すると一覧に戻り更新された値が反映される
- 空にして保存しようとするとバリデーションエラーが表示される

- [ ] **Step 4: コミット**

```bash
git add nextjs-practice/app/snippets/
git commit -m "feat: スニペット編集ページを実装"
```

---

## Task 10: 最終確認とプッシュ

- [ ] **Step 1: 全テストを実行**

```bash
cd nextjs-practice && npx jest
```

期待結果: 全テストがPASS

- [ ] **Step 2: E2Eの動作確認**

DRFバックエンド（Docker）とNext.js開発サーバーが起動している状態で：
1. `http://localhost:3000` — 一覧表示確認
2. 「新規作成」→ フォーム入力 → 保存 → 一覧に反映
3. 「編集」→ 値の変更 → 保存 → 一覧に反映
4. 「削除」→ 一覧から消える
5. バリデーション: 空フォームで送信 → エラーメッセージ表示（日本語）
6. ローディング中はボタンが無効化される

- [ ] **Step 3: リモートにプッシュ**

```bash
git push origin master
```
