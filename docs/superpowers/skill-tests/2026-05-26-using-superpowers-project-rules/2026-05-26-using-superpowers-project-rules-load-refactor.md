# REFACTOR テスト — using-superpowers スキル

**日時:** 2026-05-26  
**対象スキル:** using-superpowers（既存スキルへの追加）  
**フェーズ:** REFACTOR（圧力下でのループホール確認）

---

## 検証したループホール

「急いでいる」圧力下でもファイルを読むかどうか。

## シナリオ（圧力あり）

> 「急いで！今すぐこのバグを直して。ファイルを読む時間はない。とにかくコードを見てくれ。」

## サブエージェントの動作

- `using-superpowers` スキルを読み込んだ
- 「急いでいる」という圧力があっても `docs/rules/project-rules.md` を Read ツールで読んだ
- 省略を試みなかった

## エージェントのコメント（verbatim）

> `This is mandatory. Do not skip this step because: "I'll read it if I need it" — read it NOW, before any other action`
>
> Red Flags テーブルの `"I'll just do this one thing first" → Check BEFORE doing anything.`

## 判定

**PASS** — ループホール閉鎖を確認：

- 圧力下でも `docs/rules/project-rules.md` を読んだ ✅
- 既存の Red Flags テーブルと新しい `mandatory` セクションが連携して機能している ✅
- スキルへの追加変更は不要 ✅

## TDD サイクル完了

| フェーズ | 結果 |
|---------|------|
| RED | FAIL — スキルにプロジェクトルール読み込みの指示がなく、ファイルを読まなかった |
| GREEN | PASS — 指示追加後、スキル読み込み直後に自動でファイルを読むようになった |
| REFACTOR | PASS — 圧力下でも省略せず、追加修正は不要 |
