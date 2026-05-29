# GREEN テスト — brainstorming manage-project-rules呼び出し追加

**日時:** 2026-05-26
**対象スキル:** brainstorming（既存スキルへの追加）
**変更内容:** 設計書コミット後にmanage-project-rulesスキルを呼び出して設計決定事項を記録するステップの追加
**フェーズ:** GREEN（スキル編集後の検証）

---

## シナリオ

brainstormingセッションが完了し、設計書をコミットした後、エージェントがmanage-project-rulesスキルを呼び出すかどうかを確認した。

設計決定事項の例：
- 検索はタイトル・コード・言語タグで全文検索
- フロントエンドはリアルタイム検索（入力のたびにフィルタリング）
- バックエンドAPIは既存の /api/snippets にクエリパラメータ追加
- 却下した選択肢: 専用の検索エンドポイント（シンプルさを優先したため）

## サブエージェントの出力（要約）

チェックリストのステップ7が「Record design decisions — invoke manage-project-rules skill to record decisions made during design」として追加されており、エージェントは設計書コミット後にmanage-project-rulesを呼び出すと回答。

記録内容として以下を挙げた：
- 設計決定事項（アーキテクチャ選択・制約・却下した代替案・根拠）

## 判定

**PASS** — エージェントはmanage-project-rulesを呼び出す

- ✅ チェックリストのステップ7にmanage-project-rules呼び出しが追加された
- ✅ フローチャートに「Invoke manage-project-rules」ノードが追加された
- ✅ 「After the Design」セクションに「Record Design Decisions」サブセクションが追加された
