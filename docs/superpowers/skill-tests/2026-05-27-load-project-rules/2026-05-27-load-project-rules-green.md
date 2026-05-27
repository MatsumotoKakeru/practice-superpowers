# GREEN テスト — load-project-rules スキルありの挙動確認

**日時:** 2026-05-27
**対象スキル:** load-project-rules（新規作成）
**変更内容:** SKILL.md 初版作成後の検証
**フェーズ:** GREEN（スキルありの挙動）

---

## シナリオ

- タスク: 「user profile page」機能のbrainstormingを開始する
- スキル: `load-project-rules` を明示的に提供
- 質問: 最初のアクションとして `load-project-rules` を呼び出したか？

## サブエージェントの出力（要約）

エージェントは以下を報告した：
1. `load-project-rules` をbrainstorming前に最初に呼び出した
2. `docs/rules/project-rules.md` を読んだ
3. ルールを適用した（TDD必須、App Router）
4. `REQUIRED SKILL:` 参照をスキャンした（見つからなかった）
5. 最初のアクションが `load-project-rules` の呼び出しであったと明示

## 判定

**PASS** — スキルが正しく機能した

- ✅ `load-project-rules` を最初に明示的に呼び出した
- ✅ `docs/rules/project-rules.md` を読んだ
- ✅ ルールをセッションに適用した
- ✅ `REQUIRED SKILL:` パターンをスキャンした
- ✅ ファイルが存在しない場合のスキップ動作は説明通り

## 結論

スキルは GREEN フェーズをパス。エージェントはスキルの指示に従い、
project-rules.md を deliberate な最初のステップとして読み込んだ。
