# GREEN テスト — manage-project-rules 既存セクション重複バグ修正

**日時:** 2026-05-26
**対象スキル:** manage-project-rules（既存スキル修正）
**変更内容:** Common Process に Step 4「SECTION CHECK」を追加
**フェーズ:** GREEN（修正後の検証）

---

## 修正内容

Common Process の Step 4 を以下に変更:

```
旧:
4. APPEND to the appropriate section
   IF section already exists: add new bullet WITHIN it — do NOT add a new ## heading
   IF section does NOT exist: add ## heading + content
   IF file doesn't exist: CREATE with full structure

新:
4. SECTION CHECK: Grep the file for the target ## heading
   (e.g., grep "## 設計決定事項" to check if the section exists)
5. APPEND:
   IF file doesn't exist: CREATE with full structure
   IF section heading not found in file: add ## heading + bullet
   IF section heading found: add new bullet WITHIN the existing section
     — do NOT add a new ## heading
```

「セクションが存在するかどうかを grep で確認する」という明示的な手順を追加した。

## テスト前の準備

HEAD の project-rules.md は 12 行のみ（テスト用ルールのみ）だったため、全セクション揃った版をテスト用に作成してから実行。

## シナリオ

全セクション（コーディングルール、設計決定事項、レビュー指摘パターン、環境・構成、共通事項）が揃った project-rules.md に対して、設計決定事項カテゴリの新規ルールを追記する。

## サブエージェントの出力（要約）

1. ファイルを読み込み
2. `## 設計決定事項` を grep → 行 15 に**存在することを確認**
3. 新規ヘッダーを追加せず、既存セクション内に新エントリを追記

追記後の設計決定事項セクション:
```markdown
## 設計決定事項
- **UserService**: Singletonパターンで実装する（理由: ...）
- **削除操作の確認ダイアログ**: 削除操作には確認ダイアログを必ず挟む。...
```

## 判定

**PASS** — 修正が正しく機能している

- ✅ SECTION CHECK で既存セクションを発見（行 15）
- ✅ 新規 `## 設計決定事項` ヘッダーを追加しなかった
- ✅ 既存エントリ（UserService）を保持しつつ新エントリを追記
- ✅ ファイルが壊れていない

## テストが失敗した原因（前回まで）

前回テストでは HEAD の project-rules.md が 12 行（全セクションなし）だったため、
エージェントが「セクションが存在しない」と正しく判断して新規ヘッダーを追加していた。
これはバグではなく正常動作だった。
実際のバグは「全セクション揃った状態での追記」でのみ発生するため、テストセットアップが不正確だった。
