# レビュー・指摘ログ

スニペット管理フロントエンド実装中に出た指摘・不備の記録。  
PR: https://github.com/MatsumotoKakeru/practice-superpowers/pull/1

---

## 1. コードレビュー #1（2026-05-21 16:46 修正コミット）

**タイミング:** 初期実装（一覧・新規作成・編集ページ）完了後に `/requesting-code-review` を実施

| 重要度 | 指摘内容 | 対象ファイル | 修正内容 |
|--------|---------|------------|--------|
| Critical | 削除ボタンに確認ダイアログがなく、クリック即削除される | `app/page.tsx` | `window.confirm()` を追加 |
| Critical | `handleResponse` が 204 レスポンスでも `res.json()` を呼んでおり、パースエラーになる | `lib/api.ts` | ステータスコード 204 / `content-length: 0` のチェックを追加 |
| Important | 編集ページのルートパラメータ `id` が非数値のとき `Number(id)` が `NaN` になるケースが未処理 | `app/snippets/[id]/edit/page.tsx` | `isNaN(snippetId)` チェック後に `notFound()` を呼ぶよう修正 |

**修正コミット:** `eb80f45`

---

## 2. 会話中のユーザー指摘（2026-05-21〜2026-05-22）

初期実装の確認後にユーザーから直接寄せられた不備。

| 日時 | 指摘内容 | 対象 | 修正内容 |
|------|---------|------|--------|
| 2026-05-21 | ページネーションが未実装（仕様外として片付けていた） | `app/page.tsx`, `hooks/useSnippets.ts` | 前へ/次へボタン＋ページ番号 UI を追加。`useSnippets` に `page` パラメータと `snippetsPageKey` を追加 |
| 2026-05-21 | 関数がメモ化されていない | 全コンポーネント・フック | `useCallback`（onSubmit・削除ハンドラ）、`useMemo`（SWR データ加工・totalPages）を追加 |
| 2026-05-21 | あやふやな点を「仕様外」で片付けず質問してほしい（プロセス指摘） | — | 以降は不明点を質問してから実装する方針に変更 |
| 2026-05-22 | 必須項目が未入力のときボタンが無効化されない | 両フォームページ | `mode: 'onChange'` + `disabled={!isValid}` を追加 |
| 2026-05-22 | タイトルが必須になっている（DRF モデルは `blank=True`） | `schemas/snippet.ts`, 両フォームページ | Zod スキーマから `min(1)` を削除、UI の `*` を除去 |
| 2026-05-22 | 言語・スタイルが自由入力でバックエンドのchoicesにない値を送るとエラーになる | 両フォームページ | DRF に `GET /choices/` エンドポイントを追加、`<select>` で動的取得に変更 |
| 2026-05-22 | 言語・スタイルの選択肢が表示されない・選択できない | 両フォームページ | `register` から `Controller` に変更（非同期でオプションが追加される場合、uncontrolled では初期値が反映されない） |

---

## 3. コードレビュー #2（2026-05-22）

**タイミング:** ページネーション・メモ化・選択肢動的取得の実装完了後に `/requesting-code-review` を実施

| 重要度 | 指摘内容 | 対象ファイル | 対応 |
|--------|---------|------------|------|
| Critical | EditForm で `reset()` 後に `isValid` が `false` のまま保存ボタンが永続無効になる | `EditSnippetForm.tsx` | `reset()` 直後に `trigger()` を追加し即時再バリデーション |
| Critical | pagination の次へボタンが `totalPages === 0` のとき有効になる | `app/page.tsx` | **却下** — `totalPages > 1` が `false` のときページネーションブロック全体が非表示になるため、ボタン自体が DOM に存在しない。実際のバグではない |
| Important | mutation 後にスピナーが点滅する（`undefined` を渡すとキャッシュがクリアされ `isLoading` が `true` になる） | 全 mutation フック | `mutate` の第2引数 `undefined` を削除。stale data を保持しながら revalidate するよう変更 |
| Important | `PAGE_SIZE` がフロントエンドとバックエンドで重複定義されており、変更時に両方修正が必要 | `app/page.tsx`, `settings.py` | 未対応（学習用途として許容） |
| Important | EditForm のボタンに `choicesLoading` が未考慮（選択肢読み込み中でもボタンが有効） | `EditSnippetForm.tsx` | `disabled` 条件に `choicesLoading` を追加 |
| Important | `GET /choices/` にキャッシュヘッダーがない（毎回大量の Pygments データを返す） | `DRF-practice/snippets/views.py` | 未対応（学習用途として許容） |
| Minor | `STYLE_CHOICES` のタプルを展開するより `list(get_all_styles())` の方が直接的 | `DRF-practice/snippets/views.py` | 未対応 |
| Minor | `useSnippetChoices` の `useMemo` が2つに分かれており、1つにまとめられる | `hooks/useSnippetChoices.ts` | 未対応 |
| Minor | ページ番号ボタンが全件表示のため件数が増えると並びすぎる | `app/page.tsx` | 未対応（学習用途として許容） |

**修正コミット:** `fca4c0b`

---

## 未対応の指摘まとめ

| 内容 | 理由 |
|------|------|
| `PAGE_SIZE` の重複定義 | 学習用途のため許容 |
| `GET /choices/` へのキャッシュヘッダー追加 | 学習用途のため許容 |
| `STYLE_CHOICES` の書き方 | 動作上問題なし |
| `useSnippetChoices` の `useMemo` 統合 | 機能差なし |
| ページ番号のウィンドウ制限（省略表示） | 学習用途のため許容 |
