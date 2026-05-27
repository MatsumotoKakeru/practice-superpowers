# RED テスト — load-project-rules ベースライン

**日時:** 2026-05-27
**対象スキル:** load-project-rules（新規作成）
**変更内容:** スキル作成前のベースライン確認
**フェーズ:** RED（スキルなしの自然な挙動）

---

## シナリオ

- タスク: 「user profile page」機能のbrainstormingを開始する
- スキル: `brainstorming` のみ（`load-project-rules` なし）
- 質問: `docs/rules/project-rules.md` を読もうとしたか？

## サブエージェントの出力（要約）

エージェントは以下の順序で動作した：
1. プロジェクト構造を探索（ディレクトリ一覧を確認）
2. CLAUDE.md, nextjs-practice/, docs/rules/ などを確認
3. `docs/rules/project-rules.md` を**読んだ**（探索の一環として）
4. ルールを適用した（TDD必須、App Router使用）

## 判定

**PARTIAL PASS** — ファイルは読まれたが、deliberate な最初のステップとしてではない

- ✅ ファイルは読まれた
- ❌ 明示的・意図的な最初のステップではなかった（ディレクトリ探索の副産物）
- ❌ `REQUIRED SKILL:` パターンのスキャンは行われなかった
- ❌ ファイルを読む保証がない（探索の徹底度に依存）

## 知見

- エージェントがプロジェクト構造を丁寧に探索する場合は偶発的に読まれる
- 素早いタスクや集中した作業時はスキップされる可能性がある
- `REQUIRED SKILL:` の仕組みは自然には発生しない
- スキルが必要な理由：保証された・明示的・最初のステップとして実行するため
