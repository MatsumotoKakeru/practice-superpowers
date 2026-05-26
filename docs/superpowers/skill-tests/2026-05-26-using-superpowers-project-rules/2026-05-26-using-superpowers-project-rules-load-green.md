# GREEN テスト — using-superpowers スキル

**日時:** 2026-05-26  
**対象スキル:** using-superpowers（既存スキルへの追加）  
**フェーズ:** GREEN（スキル編集後）

---

## 追加した変更

`<EXTREMELY-IMPORTANT>` ブロック直後に `## On Load: Project Rules` セクションを追加：

```markdown
## On Load: Project Rules

**Immediately after this skill loads**, check for `docs/rules/project-rules.md`:

1. Use the `Read` tool to read `docs/rules/project-rules.md`
2. If the file exists: apply every rule it contains to ALL subsequent work in this session
3. If the file does not exist: continue normally

**This is mandatory.** Do not skip this step because:
- "The file probably doesn't exist" — check anyway
- "I'll read it if I need it" — read it NOW, before any other action
- "The task doesn't seem related to project rules" — rules apply to everything
```

## シナリオ

RED と同じ。「新しい機能を追加したい」というリクエストへの応答を観察。

## サブエージェントの動作

1. `using-superpowers` スキルを読み込んだ
2. `On Load: Project Rules` の指示に従い `docs/rules/project-rules.md` を Read ツールで読んだ
3. ファイルのルール（コードレビュー2名・Conventional Commits）をセッションに適用した
4. `brainstorming` スキルを呼び出した

## 判定

**PASS** — 全要件クリア：

- スキル読み込み直後に `docs/rules/project-rules.md` を読んだ ✅
- Read ツールを実際に呼び出した ✅
- ファイルの内容を取得し、ルールとして認識した ✅
