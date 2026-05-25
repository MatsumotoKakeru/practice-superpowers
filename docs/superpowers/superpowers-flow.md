# Superpowers スキルフロー一覧

## 全体の流れ

```
using-superpowers（セッション開始）
    ↓ 自動
brainstorming（設計）
    ↓ 自動
writing-plans（実装計画作成）
    ↓ ここだけ手動で選択
    ├─ subagent-driven-development（同セッション推奨）
    │       ↓ 各タスク内で自動
    │   using-git-worktrees / test-driven-development
    │   requesting-code-review（タスクごとに自動）
    │
    └─ executing-plans（サブエージェント非対応環境向け）
            ↓ 自動
        using-git-worktrees / test-driven-development
            ↓ 両方から自動
verification-before-completion
    ↓ 自動
finishing-a-development-branch（マージ/PR作成）
```

---

## フェーズ別スキル一覧

### フェーズ1: セッション開始

| スキル | 役割 | 呼び出し |
|---|---|---|
| `using-superpowers` | スキルの使い方を確立。「1%でも該当する可能性があれば必ずスキルを呼べ」というルールを設定する | 自動（セッション開始時に常に呼ばれる） |

---

### フェーズ2: 設計

| スキル | 役割 | 呼び出し |
|---|---|---|
| `brainstorming` | アイデアを設計に変える。質問→アプローチ提案→設計承認→設計書作成まで担当。コードを1行も書く前に必須 | 自動（「機能追加して」「作って」など創作的な作業の前） |
| `writing-plans` | 承認された設計書をもとに実装計画ファイルを作成 | 自動（`brainstorming`完了後に必ず呼ばれる） |

> `brainstorming` → `writing-plans` はセットで自動連鎖する

---

### フェーズ3: 作業環境構築

| スキル | 役割 | 呼び出し |
|---|---|---|
| `using-git-worktrees` | 作業用のworktreeとブランチを作成。mainブランチを汚さない環境を用意する | 自動（`subagent-driven-development`や`executing-plans`が内部で必須として呼ぶ） |

---

### フェーズ4: 実装

| スキル | 役割 | 呼び出し |
|---|---|---|
| `test-driven-development` | テストを先に書いてから実装する（RED→GREEN→REFACTOR） | 自動（実装作業の前。サブエージェントも内部で使用） |
| `subagent-driven-development` | タスクをサブエージェントに1つずつ分散して実行。各タスク後に仕様レビュー→品質レビューの2段階レビューを自動実施。**同セッション内で完結させたいとき** | **手動で選択** |
| `executing-plans` | 計画通りにタスクを順番に実行。サブエージェント非対応環境向け。**別セッションで実行したいとき** | **手動で選択** |
| `dispatching-parallel-agents` | 独立した複数タスクを並列で処理したいとき | 自動（並列処理可能な場面でClaudeが判断） |

> `subagent-driven-development` と `executing-plans` はどちらか一方を選ぶ

---

### フェーズ5: レビュー

| スキル | 役割 | 呼び出し |
|---|---|---|
| `requesting-code-review` | タスク完了後にサブエージェントをレビュアーとして派遣する | 自動（`subagent-driven-development`内で各タスク後に自動。単体では手動） |
| `receiving-code-review` | レビュー指摘を受けたときの対応手順（検証→実装→テスト）。感情的な同意ではなく技術的な検証を求める | 自動（レビュー指摘を受けた場面でClaudeが判断） |
| `systematic-debugging` | バグ・テスト失敗が発生したときの原因特定手順 | 自動（エラー・バグが発生した場面でClaudeが判断） |

---

### フェーズ6: 完了

| スキル | 役割 | 呼び出し |
|---|---|---|
| `verification-before-completion` | 「完了」「テストが通った」などの主張をする前に必ず実際のコマンドを実行して証拠を示す | 自動（完了を宣言しようとする前にClaudeが判断） |
| `finishing-a-development-branch` | テスト確認→マージ/PR作成/破棄の4択を提示して実行 | 自動（`subagent-driven-development`等の最後に呼ばれる） |

---

## 選択が必要な唯一のポイント

実装フェーズで **`subagent-driven-development`** と **`executing-plans`** のどちらを使うかだけ明示的に選ぶ。

| | subagent-driven-development | executing-plans |
|---|---|---|
| 実行場所 | 同セッション内 | 別セッション |
| レビュー | 各タスク後に自動（2段階） | なし（手動で依頼） |
| 推奨環境 | Claude Code（サブエージェント対応） | サブエージェント非対応環境 |

---

## 例外・状況依存スキル

メインフローには含まれないが、特定の状況でClaudeが自動的に呼び出すスキル。

| スキル | 使う場面 | 説明 |
|---|---|---|
| `systematic-debugging` | バグ・テスト失敗が発生したとき | 通常フローではバグが出ないことを前提としているが、実際に発生した場合に「なんとなく直す」のではなく根本原因を特定する手順に従って対処する |
| `dispatching-parallel-agents` | 独立した複数タスクを並列処理したいとき | `subagent-driven-development`は1タスクずつ順番に処理するが、完全に独立したタスク（例：フロントとバックエンドを同時に作る）は並列で走らせることで高速化できる。そのときに複数サブエージェントを同時に立ち上げる |
