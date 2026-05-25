---
name: save-chat-log
description: Use when asked to save the current session's conversation, or after finishing a development branch
---

# Save Chat Log

## Overview

現在のセッションのやり取りを全文 `docs/chat-logs/` に保存する。

## いつ使うか

- ユーザーが `/save-chat-log` を実行したとき
- `finishing-a-development-branch` スキルの完了後（そのスキルから呼び出される）

## 手順

1. 今日の日付（YYYY-MM-DD）を確認する
2. 会話の主題からテーマ名を決める（例: `スニペット管理フロントエンド実装`）
3. `docs/chat-logs/` ディレクトリが存在しなければ作成する
4. `docs/chat-logs/YYYY-MM-DD-テーマ.md` にファイルを作成する
5. セッション内の全やり取りを以下のフォーマットで書き出す
6. ファイルをコミットする

## フォーマット

```markdown
# YYYY-MM-DD テーマ名

## やり取り

**ユーザー:** 発言内容

**Claude:** 対応内容（全文）

---

**ユーザー:** 発言内容

**Claude:** 対応内容
```

## 書き方のルール

- **ユーザー発言**: 原文のまま記載する
- **Claude の応答**: 一字一句そのまま転写する。長くてもカットしない
- やり取りの区切りは `---` を使う
- テーマ名はファイル名にも使うため、日本語でよいが記号は避ける
- ファイルが既に存在する場合は追記する（同じ日に複数セッションがある場合）

## 禁止事項

- 要約・省略・言い換えは一切しない
- 「長いから短くした」「要点だけ残した」は違反
- 箇条書きへの変換も禁止（元の文章をそのまま出す）

「長い → 要約したい」と思ったら、それが禁止パターンです。全文を出してください。
