# RED テスト — using-superpowers スキル

**日時:** 2026-05-26  
**対象スキル:** using-superpowers（既存スキルへの追加）  
**フェーズ:** RED（変更前のベースライン）

---

## シナリオ

`using-superpowers` を読み込ませ、「新しい機能を追加したい」というリクエストへの応答を観察する。`docs/rules/project-rules.md` が存在する状態でスキルを読み込み、自発的に読むかどうかを確認。

## サブエージェントの動作

- `using-superpowers` スキルを読み込んだ
- フローチャートに従い `brainstorming` スキルを呼び出した
- `docs/rules/project-rules.md` は読まなかった

## エージェントのコメント（verbatim）

> `using-superpowers` スキルの指示の中に、プロジェクトルールファイルを読むよう指示する内容は含まれていなかった。

## 判定

**FAIL** — 以下の問題を確認：

- `docs/rules/project-rules.md` を読まなかった
- スキルにプロジェクトルール読み込みの指示が存在しない
