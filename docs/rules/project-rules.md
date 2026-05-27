# プロジェクトルール

## コーディングルール

REQUIRED SKILL: test-driven-development

## 設計決定事項
- **Next.js App Router**: このプロジェクトはNext.js App Routerを使用する（理由: SSR対応とルーティングの簡潔さ）
- **スニペット管理UI構成**: シンプルなページ遷移型。全CRUD画面を独立したページで実装する（/snippets, /snippets/new, /snippets/[id], /snippets/[id]/edit）（理由: TDD しやすく Next.js App Router に素直な設計）
- **バックエンドAPI呼び出し**: クライアントサイドから直接 fetch する（Next.js API Routes 経由のプロキシなし）（理由: シンプルさを優先）
- **認証**: スニペット管理UIは認証なし、全スニペットを誰でも操作可能（理由: 練習プロジェクトのため省略）
- **カスタムフック構成**: useSnippets（一覧取得）, useSnippet（詳細取得）, useCreateSnippet（作成）, useUpdateSnippet（更新）, useDeleteSnippet（削除）の5フックに分離する（理由: 操作ごとに責務を明確に分けるため）
- **コードフィールドの文字制限**: バックエンドは TextField で制限なしだが、フロントエンド側で2,000文字上限を設ける（理由: UI上の実用性のため）
- **タイトルフィールド**: バックエンド仕様に従い任意（blank=True）、最大100文字
