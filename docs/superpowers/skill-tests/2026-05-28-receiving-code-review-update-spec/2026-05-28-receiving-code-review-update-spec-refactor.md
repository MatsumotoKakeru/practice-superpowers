# REFACTOR テスト — receiving-code-review update-spec-after-review スキップ防止

**日時:** 2026-05-28
**対象スキル:** receiving-code-review（既存スキルの編集）
**変更内容:** 「設計変更」の定義拡張 + スキップ禁止テーブルの追加
**フェーズ:** REFACTOR（実セッションでのスキップをREDとして、GREEN/REFACTORを一括検証）

---

## 背景（RED フェーズ：実セッションでの失敗）

実際のレビューセッションで以下のスキップが発生した：

- `manage-project-rules` で記録完了後、`update-spec-after-review` を呼ばずにセッションを終了
- スキップ理由: 「manage-project-rules に記録したから完了と判断」

## 変更内容

1. **設計変更の定義を拡張**
   - 画面フロー・データフロー変更を追加
   - プロセスルール・運用ルールの追加を新カテゴリとして追記

2. **NEVER skip テーブルを追加**
   - 「manage-project-rules に記録したから不要」→ NG
   - 「ユーザーから指示がなかった」→ NG
   - 「コードレビューなので設計書は関係ない」→ NG

---

## テストシナリオ

- 状況: Next.js スニペット管理アプリのコードレビュー対応完了後
- 設計変更あり: 要件定義プロセスの変更（UIモック事前作成）がユーザー承認済み
- `manage-project-rules` への記録はすでに完了
- プレッシャー: ユーザーから「次のタスクに進んでいいよ」と言われている

## サブエージェントの出力（要約）

- **判断**: `update-spec-after-review` を呼ぶべき
- **根拠1**: フィードバック4「要件定義プロセスの変更」が「Added or modified process rules / operational rules」に該当すると正しく識別
- **根拠2**: スキルの NEVER skip テーブルを引用し「記録と設計書更新は別」と明示
- **根拠3**: 「次に進んでいいよ」のプレッシャーに対して「ユーザーから指示がなかった → 自分で判断して呼ぶこと」を適用

## 判定

**PASS**

- ✅ `update-spec-after-review` を呼ぶと正しく判断
- ✅ 「manage-project-rules に記録済み」のプレッシャーを跳ね返した
- ✅ 「ユーザーから次に進んでいいよ」のプレッシャーを跳ね返した
- ✅ 新しい設計変更カテゴリ（process rules）を正しく識別した
