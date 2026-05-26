# スニペット管理アプリ フロントエンド設計書

## 概要

DRF-practiceバックエンド（`http://localhost:8000`）と連携するNext.jsフロントエンド。スニペットの一覧表示・新規作成・編集・削除を行う。

## 前提条件

- バックエンド: Django REST Framework（`DRF-practice/`）
- フロントエンド: Next.js（`nextjs-practice/`）
- 認証: なし（未認証ユーザーに全権限）
- CORS: バックエンド側で`http://localhost:3000`を許可済み

## ページ構成

| URL | 役割 |
|-----|------|
| `/` | スニペット一覧（テーブル形式） |
| `/snippets/new` | 新規作成フォーム |
| `/snippets/[id]/edit` | 編集フォーム |

## ファイル構成

```
nextjs-practice/
├── app/
│   ├── page.tsx                    # スニペット一覧
│   ├── snippets/
│   │   ├── new/page.tsx            # 新規作成
│   │   └── [id]/edit/page.tsx      # 編集
├── hooks/
│   ├── useSnippets.ts              # SWR: 一覧取得
│   ├── useSnippet.ts               # SWR: 1件取得
│   ├── useCreateSnippet.ts         # POST /snippets/
│   ├── useUpdateSnippet.ts         # PUT /snippets/{id}/
│   └── useDeleteSnippet.ts         # DELETE /snippets/{id}/
├── lib/
│   └── api.ts                      # fetch関数（CRUD）
├── schemas/
│   └── snippet.ts                  # Zodスキーマ・型推論
└── types/
    └── index.ts                    # Snippet型定義
```

## 技術スタック

| 用途 | ライブラリ |
|------|-----------|
| データフェッチ・キャッシュ | SWR |
| フォーム管理 | react-hook-form |
| バリデーション | Zod（zodResolver経由） |
| スタイリング | Tailwind CSS v4 |

## Snippetモデル

```typescript
type Snippet = {
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
```

## Zodスキーマ（`schemas/snippet.ts`）

```typescript
const snippetSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  code: z.string().min(1, 'コードを入力してください'),
  language: z.string().min(1, '言語を入力してください'),
  style: z.string().min(1, 'スタイルを入力してください'),
  linenos: z.boolean(),
})
```

## カスタムフック

### 取得系（SWR）

- **`useSnippets()`**: `GET /snippets/` で一覧取得。`{ snippets, isLoading, error }` を返す。
- **`useSnippet(id)`**: `GET /snippets/{id}/` で1件取得。`{ snippet, isLoading, error }` を返す。

### 更新系

- **`useCreateSnippet()`**: `POST /snippets/` で新規作成。`{ create, isLoading, error }` を返す。
- **`useUpdateSnippet()`**: `PUT /snippets/{id}/` で更新。`{ update, isLoading, error }` を返す。
- **`useDeleteSnippet()`**: `DELETE /snippets/{id}/` で削除。`{ remove, isLoading, error }` を返す。

更新系フックはミューテーション後に`mutate()`でSWRキャッシュを更新する。

## データフロー

### 一覧（`/`）
1. `useSnippets()` で`GET /snippets/`
2. テーブルにスニペット一覧を表示
3. 削除ボタン → `useDeleteSnippet()` → `DELETE /snippets/{id}/` → `mutate()`でテーブル更新
4. 「新規作成」ボタン → `/snippets/new`へ遷移

### 新規作成（`/snippets/new`）
1. react-hook-form + zodResolverでフォーム管理
2. 送信 → `useCreateSnippet()` → `POST /snippets/`
3. 成功時 → `/`にリダイレクト
4. DRFエラー時 → フォームにエラーメッセージ表示（日本語）

### 編集（`/snippets/[id]/edit`）
1. `useSnippet(id)` で現在値を取得してフォームに初期値セット
2. 送信 → `useUpdateSnippet()` → `PUT /snippets/{id}/`
3. 成功時 → `/`にリダイレクト
4. DRFエラー時 → フォームにエラーメッセージ表示（日本語）

## バックエンドの変更点

### パーミッション設定（`snippets/views.py`）

`SnippetViewSet` にパーミッションクラスを追加：

```python
from rest_framework.permissions import AllowAny

class SnippetViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
```

### `perform_create`の修正

未認証ユーザーに対応するため`owner`をオプションに：

```python
def perform_create(self, serializer):
    owner = self.request.user if self.request.user.is_authenticated else None
    serializer.save(owner=owner)
```

## ページネーション

バックエンドは `PAGE_SIZE=10` のページネーションが有効。今回は1ページ目（最大10件）のみ表示し、ページネーションUIは実装しない。

## UIルール

- 全ラベル・エラーメッセージ・ボタンテキストは日本語
- ローディング中はボタンを無効化
- エラーはフォーム各フィールド直下に表示
- `language` のデフォルト値: `python`、`style` のデフォルト値: `monokai`
