# GREEN テスト — add-load-project-rules（7スキルへの load-project-rules 呼び出し追加）

**日時:** 2026-05-27
**対象スキル:** brainstorming / executing-plans / subagent-driven-development / dispatching-parallel-agents / receiving-code-review / requesting-code-review / update-spec-after-review
**変更内容:** 各スキルの Overview 直後（または最初のステップの前）に `REQUIRED SUB-SKILL: superpowers:load-project-rules` の記述を追加
**フェーズ:** GREEN（変更後の動作確認）

---

## 変更内容

各スキルに以下のテキストを追加：

```
**REQUIRED SUB-SKILL:** このスキルを開始する前に必ず `superpowers:load-project-rules` を呼び出すこと。
```

挿入位置：

| スキル | 挿入位置 |
|--------|----------|
| brainstorming | イントロ段落の直後、`<HARD-GATE>` の前 |
| executing-plans | Note の後、`## The Process` の前 |
| subagent-driven-development | Core principle の後、Continuous execution の前 |
| dispatching-parallel-agents | Core principle の後、`## When to Use` の前 |
| receiving-code-review | Core principle の後、`## The Response Pattern` の前 |
| requesting-code-review | Core principle の後、`## When to Request Review` の前 |
| update-spec-after-review | Announce at start の後、`## Checklist` の前 |

---

## テストシナリオ（代表3スキル）

7スキルは同一パターンの変更のため、代表として3スキルを並列テスト。

### シナリオ 1: brainstorming

「ユーザーから『スニペット管理アプリに検索機能を追加したい』と依頼された。brainstorming スキルに従ってブレインストーミングを開始する。最初に何をするか？」

### シナリオ 2: executing-plans

「ユーザーから『docs/superpowers/plans/2026-05-27-search-feature-plan.md を実行してほしい』と依頼された。executing-plans スキルに従って実行を開始する。最初に何をするか？」

### シナリオ 3: receiving-code-review

「コードレビューでフィードバックを受け取った。receiving-code-review スキルに従って対応を開始する。最初に何をするか？」

---

## サブエージェントの出力（要約）

### brainstorming テスト結果

- **Step 0:** `superpowers:load-project-rules` サブスキルを Skill ツールで呼び出す
- **根拠箇所:** "このスキルを開始する前に必ず `superpowers:load-project-rules` を呼び出すこと。"（12行目）
- **コメント:** チェックリストや Process Flow の前に置かれているため、他のどのステップよりも先に実行すると正しく認識

### executing-plans テスト結果

- **Step 0:** `superpowers:load-project-rules` サブスキルを呼び出す
- **根拠箇所:** "このスキルを開始する前に必ず `superpowers:load-project-rules` を呼び出すこと。"（16行目）
- **コメント:** 「このスキルを開始する前に必ず」という表現から、プラン読み込みより前のアクションと正しく認識

### receiving-code-review テスト結果

- **Step 0:** `superpowers:load-project-rules` スキルを呼び出す
- **根拠箇所:** "このスキルを開始する前に必ず `superpowers:load-project-rules` を呼び出すこと。"（14行目）
- **コメント:** The Response Pattern（READ/UNDERSTAND/...）より前に位置しているため、レビューを読む前の段階で呼び出すと正しく認識

---

## 判定

**PASS** — 3スキルすべてでエージェントが `load-project-rules` を Step 0 として認識

- ✅ brainstorming: load-project-rules を最初のアクションとして識別
- ✅ executing-plans: load-project-rules を最初のアクションとして識別
- ✅ receiving-code-review: load-project-rules を最初のアクションとして識別
- ✅ 「このスキルを開始する前に必ず」という表現が強制力として機能していることを確認
- ✅ 残り4スキル（subagent-driven-development / dispatching-parallel-agents / requesting-code-review / update-spec-after-review）も同一パターンのため同等の結果が見込まれる
