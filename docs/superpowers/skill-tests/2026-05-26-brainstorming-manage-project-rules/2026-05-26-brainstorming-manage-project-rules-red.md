# RED テスト — brainstorming manage-project-rules呼び出し追加

**日時:** 2026-05-26
**対象スキル:** brainstorming（既存スキルへの追加）
**変更内容:** 設計書コミット後にmanage-project-rulesスキルを呼び出して設計決定事項を記録するステップの追加
**フェーズ:** RED（スキル編集前のベースライン）

---

## シナリオ

brainstormingセッションが完了し、設計が承認された後、エージェントが設計書を`docs/superpowers/specs/`に保存してコミットした時点で、自然にmanage-project-rulesスキルを呼び出すかどうかを確認した。

設計で決定した事項の例：
- 検索はタイトル・コード・言語タグで全文検索
- フロントエンドはリアルタイム検索（入力のたびにフィルタリング）
- バックエンドAPIは既存の /api/snippets にクエリパラメータ追加

## サブエージェントの出力（要約）

設計書コミット後のステップとして、スキルに記載されているのは：
1. Spec self-review（TBD・矛盾・曖昧さのチェック）
2. User Review Gate（ユーザーにレビューを依頼）
3. writing-plansスキルの呼び出し

manage-project-rulesへの言及はスキル内に一切なし。スキルには「Do NOT invoke any other skill. writing-plans is the next step.」と明記されており、manage-project-rulesを呼ぶ指示はない。

## 判定

**FAIL** — 設計決定事項はproject-rules.mdに記録されない

- ✅ writing-plansスキルへの遷移は正しく動作する
- ❌ manage-project-rulesスキルが呼び出されない
- ❌ 設計で決定した事項がproject-rules.mdに残らない
