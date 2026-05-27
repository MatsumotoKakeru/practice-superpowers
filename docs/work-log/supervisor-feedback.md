# フィードバック対応ログ

## 対応項目一覧

| # | 項目 | 手段 | 状態 |
|---|------|------|------|
| 1 | `.claude`フォルダをgit管理対象に追加 | `.gitignore`編集 | ✅ 完了 |
| 2 | TDDをプロジェクト全体に適用 | `CLAUDE.md`新規作成 | ✅ 完了 |
| 2.5 | brainstormingスキルに設計書フォーマット追加 | 既存スキル編集 | ✅ 完了 |
| 3 | プロジェクトのルール・レビュー指摘事項を蓄積する仕組み | 新規スキル作成 | ✅ 完了 |
| 4 | レビュースキルに独自ルール確認を追加 | 既存スキル編集 | ✅ 完了 |
| 5 | 人間レビュー後の設計書更新フローをスキル化 | 新規スキル作成 | ✅ 完了 |
| 6 | 開発チャットを人間が見やすい形で保存する仕組み | 新規スキル作成 | ✅ 完了 |
| 7 | TDDルール適用をCLAUDE.mdからスキルへ移行 | 新規スキル作成・既存スキル編集 | ✅ 完了 |

---

## 作業詳細

### 1. `.claude`フォルダをgit管理対象に追加

**変更ファイル:** `.gitignore`

**変更内容:**
```diff
- .claude/
```

**コミット:** `d2aaf60 chore: .claudeフォルダをgit管理対象に追加`

---

### 2. TDDをプロジェクト全体に適用

**変更ファイル:** `CLAUDE.md`（新規作成）

**変更内容:** `test-driven-development`スキルをすべての実装で必須とする記載を追加。
CLAUDE.mdはすべてのセッションで読まれるため、プロジェクト全体への適用に最適。

---

### 3. プロジェクトのルール・レビュー指摘事項を蓄積する仕組み

**変更ファイル:** `.claude/skills/manage-project-rules/SKILL.md`（新規作成）

**変更内容:** プロジェクト知識を`docs/rules/project-rules.md`に蓄積するスキルを作成。
ユーザーが直接呼んだ場合と、他スキルから呼ばれた場合の両方に対応。

**カテゴリ:** コーディングルール・設計決定事項・レビュー指摘パターン・環境構成・共通事項

**コミット:** `437e98e feat: manage-project-rulesスキルを追加`

**テスト結果:** `docs/superpowers/skill-tests/2026-05-26-manage-project-rules-green.md` — PASS

---

### 4. レビュースキルに独自ルール確認を追加（2026-05-26）

**変更ファイル:**
- `CLAUDE.md`（既存ファイル編集）
- `.claude/skills/receiving-code-review/SKILL.md`（既存スキル編集）
- `.claude/skills/brainstorming/SKILL.md`（既存スキル編集）

**変更内容:**
- `CLAUDE.md`: スキル（brainstorming・executing-plans・subagent-driven-development・receiving-code-review等）を呼び出す前に `docs/rules/project-rules.md` を読み込んでルールを適用するよう追加。CLAUDE.mdはサブエージェントを含む全セッションで読まれるため、スキルごとの個別実装より確実に適用される。
- `receiving-code-review`: レビュー完了後に `manage-project-rules` を呼び出してレビュー指摘パターン・設計決定事項を記録するステップを追加
- `brainstorming`: 設計書コミット後に `manage-project-rules` を呼び出して設計決定事項を記録するステップを追加

**経緯:** 当初 `using-superpowers` に `On Load: Project Rules` セクションを追加したが、サブエージェントには適用されない（`<SUBAGENT-STOP>`）問題があるため、CLAUDE.md への記載に変更した。

**コミット:** `a0abb7b`, `d78ca61`（using-superpowers の変更は取り消し済み）

**テスト結果:**
- `docs/superpowers/skill-tests/2026-05-26-using-superpowers-project-rules/` — PASS（using-superpowers単体の動作確認）
- `docs/superpowers/skill-tests/2026-05-26-receiving-code-review-record/` — PASS
- `docs/superpowers/skill-tests/2026-05-26-brainstorming-manage-project-rules/` — PASS

---

### 5. 人間レビュー後の設計書更新フローをスキル化（2026-05-26）

**変更ファイル:** `.claude/skills/update-spec-after-review/SKILL.md`（新規作成）

**変更内容:** 人間のレビュー了承後に設計書・実装計画を更新するフローをスキル化。

**フロー:**
1. `docs/rules/project-rules.md` を読み込んでルールを把握
2. レビュー指摘内容を確認
3. 更新前の設計書をアーカイブとして保存してから設計書を更新（`brainstorming` フォーマット準拠）
4. `writing-plans` スキルで実装計画を更新または新規作成（更新時は修正前の内容を保持）
5. `manage-project-rules` を呼び出して設計変更・決定事項を記録
6. ユーザーに確認を取ってからコミット

**テスト結果:** `docs/superpowers/skill-tests/2026-05-26-update-spec-after-review/` — PASS

---

### 6. 開発チャットを人間が見やすい形で保存する仕組み

**変更ファイル:** `.claude/skills/save-chat-log/SKILL.md`（新規作成）

**変更内容:** 開発セッションのチャットログを整形して`docs/chat-logs/`に保存するスキルを作成。

**コミット:** `e274579 feat: save-chat-logスキルを追加`

---

### 7. TDDルール適用をCLAUDE.mdからスキルへ移行（2026-05-27）

**変更ファイル:**
- `.claude/skills/load-project-rules/SKILL.md`（新規作成）
- `.claude/skills/brainstorming/SKILL.md`（既存スキル編集）
- `.claude/skills/executing-plans/SKILL.md`（既存スキル編集）
- `.claude/skills/subagent-driven-development/SKILL.md`（既存スキル編集）
- `.claude/skills/dispatching-parallel-agents/SKILL.md`（既存スキル編集）
- `.claude/skills/receiving-code-review/SKILL.md`（既存スキル編集）
- `.claude/skills/requesting-code-review/SKILL.md`（既存スキル編集）
- `.claude/skills/update-spec-after-review/SKILL.md`（既存スキル編集）
- `.claude/skills/subagent-driven-development/implementer-prompt.md`（既存ファイル編集）
- `CLAUDE.md`（既存ファイル編集）

**変更内容:**

**背景:** CLAUDE.md でTDDを強制する方式は「CLAUDE.mdが読まれる保証」に依存しており、スキルへの責務分離ができていなかった。

**新アーキテクチャ:**
- `docs/rules/project-rules.md` — プロジェクトルールの単一の正規ファイル（TDDルールはここに記載し `test-driven-development` スキルへ参照）
- `load-project-rules` スキル — 上記ファイルを Read して内容を適用し、`REQUIRED SKILL:` 参照があればそのスキルを呼び出す
- 各実装スキル — 先頭で `REQUIRED SUB-SKILL: load-project-rules` を呼び出す
- `implementer-prompt.md` — サブエージェントはスキルを呼べないため、プロンプトに直接 `docs/rules/project-rules.md` を Read して適用する指示を追加。あわせて TDD を条件付きから無条件化

**CLAUDE.md:** TDDセクションを削除し、`load-project-rules` の仕組みへの簡潔な説明に変更

**テスト結果:** `docs/superpowers/skill-tests/2026-05-27-load-project-rules/` — RED→GREEN PASS

