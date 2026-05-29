---
name: update-spec-after-review
description: Use when a human has approved review feedback and you need to update design documents and implementation plans to reflect the changes.
---

# Update Spec After Review

## Overview

Update design documents and implementation plans after human review approval. Preserves old versions, follows established formats, and records design changes before committing.

**Announce at start:** "I'm using the update-spec-after-review skill."

**REQUIRED SUB-SKILL:** このスキルを開始する前に必ず `superpowers:load-project-rules` を呼び出すこと。

## Checklist

Execute in order:

```
0. JUDGE & CONFIRM: 今回のレビューフィードバックを確認し、何を更新すべきか判断してユーザーに確認する
   判断後、以下をユーザーに提示して確認を取る：
   「今回のレビュー内容を確認しました。
   - 設計書の更新: 必要 / 不要
   - 実装計画の更新: 必要 / 不要
   上記の判断で進めますか？」
   ユーザーが承認した内容のみ実施する。不要と判断した項目はスキップする。
1. READ docs/rules/project-rules.md
2. CONFIRM the review feedback with the user
3. UPDATE the design document
   - Archive old version first (rename with date/revision)
   - Follow brainstorming skill's 画面設計書フォーマット exactly
4. UPDATE the implementation plan
   - Incomplete plan: update existing file (preserve old content)
   - Completed plan: create new file
5. CALL manage-project-rules to record design decisions
6. ASK user to confirm before committing
```

## Step 3: Update Design Document

**Archive first:**

Rename the current file before editing:
```
docs/superpowers/specs/YYYY-MM-DD-<feature>-design.md
→ docs/superpowers/specs/YYYY-MM-DD-<feature>-design-rev<N>.md
  (or add the review date: -before-YYYY-MM-DD-review)
```

Keep the archived file in the same directory. Do NOT delete it.

**Then update:**

Edit the new copy following brainstorming skill's 画面設計書フォーマット.

For UI screens, update the **イベント処理** section — not implementation details:

```markdown
## イベント処理
- 削除ボタン押下：
  - チェック：（バリデーション・条件チェック）
  - 正常：成功時に何が起きるか
  - エラー：失敗時に何が起きるか
```

**NEVER write in the design document:**
- TypeScript / Python code blocks
- File paths or function names
- API endpoint specs
- Test strategy

## Step 4: Update Implementation Plan

```
IF existing plan file is incomplete (has unchecked [ ] items):
  EDIT the existing file
  Add new tasks at the appropriate position
  Preserve the original plan content (add, don't replace)

IF existing plan file is fully completed (all [ ] checked):
  CREATE a new file: docs/superpowers/plans/YYYY-MM-DD-<feature>-v2.md
```

## Step 5: Record Design Decisions

Call `manage-project-rules` after updating documents.

Pass the design changes and decisions made during the review. The skill will classify and append to the correct section.

## Step 6: Confirm Before Committing

**REQUIRED:** Ask the user to confirm before running any git commands.

Show:
- Which files were changed
- Summary of changes

Wait for explicit approval. Do NOT auto-commit.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Overwriting design doc directly | Archive old version first, then edit |
| Updating processing/API details in design doc | Update only 画面設計書フォーマット sections (イベント処理) |
| Adding code blocks to design doc | Design doc has no code — behavior only |
| Creating new plan when old is incomplete | Edit existing plan file |
| Calling manage-project-rules before updating docs | Update docs first, then record decisions |
| Committing without user approval | Always ask before `git commit` |
