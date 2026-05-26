---
name: manage-project-rules
description: Use when recording project knowledge, coding conventions, design decisions, review patterns, or environment configuration to the project rules file. Invoked directly by user or called from other skills (receiving-code-review, brainstorming, etc.).
---

# Manage Project Rules

## Overview

Accumulates project-specific knowledge in `docs/rules/project-rules.md`. Single source of truth for coding conventions, design decisions, and patterns discovered during development.

## Invocation Modes

```
WHEN called by user directly:
  ASK: "どのルールを追加しますか？内容を教えてください。"
  WAIT for user input
  THEN proceed to Common Process

WHEN called from another skill (receiving-code-review, brainstorming, etc.):
  USE the content passed by the calling skill
  SKIP asking the user
  THEN proceed to Common Process
```

## Common Process

```
1. READ docs/rules/project-rules.md (if exists)
2. DUPLICATE CHECK: search for similar existing rules (keyword match)
3. CLASSIFY into one of the 5 categories below
4. APPEND to the appropriate section
   IF file doesn't exist: CREATE with full structure
5. CONFIRM: show what was added
```

## Categories

| Category | 日本語 | Use for |
|----------|--------|---------|
| `コーディングルール` | Coding Rules | "〇〇はこう書くべき" - style, patterns, conventions |
| `設計決定事項` | Design Decisions | "このプロジェクトではXXXを使う、理由はYYY" - ADRs |
| `レビュー指摘パターン` | Review Patterns | Recurring code review findings |
| `環境・構成` | Environment/Config | Setup, tooling, environment-specific config |
| `共通事項` | Common Conventions | Formatting, shared UI patterns, warning messages |

## File Format

```markdown
# プロジェクトルール

## コーディングルール
- ルール内容

## 設計決定事項
- **ライブラリ名**: 説明（理由: YYY）

## レビュー指摘パターン
- 指摘内容

## 環境・構成
- 設定内容

## 共通事項
- 共通ルール内容
```

## Duplicate Check

Before appending, Grep for keywords from the new rule. If a similar rule exists:
- **Same rule**: Skip, tell the user it already exists
- **Related rule**: Add as a new bullet that complements the existing one
- **Contradicting rule**: Stop and ask the user which is correct

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Writing to `CLAUDE.md` | Rules go in `docs/rules/project-rules.md` only |
| Creating ad-hoc categories | Use only the 5 defined categories |
| Skipping duplicate check | Always read the file first |
| Asking user when called from skill | Trust the content passed by the calling skill |
| Missing the "why" for design decisions | Design decisions must include reason |
