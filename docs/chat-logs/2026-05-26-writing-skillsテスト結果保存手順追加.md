# 2026-05-26 writing-skillsテスト結果保存手順追加

## やり取り

**ユーザー:** （`/writing-skills` を実行）

**Claude:** The `writing-skills` skill is loaded. Let me check memory for context before asking what you'd like to do.

（メモリファイルを確認 → 存在しない）

No prior memory for this project. What would you like to do with `writing-skills` — create a new skill, edit an existing one, or verify one works?

---

**ユーザー:** writing-skillsdでスキル作成時にC:\dev\practice-superpowers\docs\superpowers\skill-testsにテスト結果のファイルを出力してほしい。形式はすでに存在するフォルダとファイルを参照。またテスト時に出力されたファイルも合わせて保存するようにしてほしい。

**Claude:** 既存のskill-testsディレクトリの構造を確認します。

（`docs/superpowers/skill-tests/` 配下のフォルダ・ファイルを確認）

フォーマットを把握しました。`writing-skills` SKILL.mdにテスト結果保存のセクションを追加し、チェックリストにも項目を追加します。

（SKILL.mdを読み込み、`## Test Result Documentation` セクションを追加、チェックリストに保存タスクを追加）

追加完了です。変更内容をまとめます:

**SKILL.mdに追加した内容:**

1. **`## Test Result Documentation` セクション**（RED-GREEN-REFACTORセクションの直後）
   - 保存先: `docs/superpowers/skill-tests/{YYYY-MM-DD}-{skill-name}/`
   - ファイル命名規則: `{date}-{skill-name}-red.md`, `-green.md`, `-refactor.md`（反復時は`-v2`や`-refactor2`）
   - ファイルフォーマットのテンプレート（日時・対象スキル・変更内容・フェーズ・シナリオ・出力・判定）
   - テスト中に生成されたファイルも同じフォルダに保存する指示

2. **チェックリストの各フェーズに追記**
   - REDフェーズ: `Save RED result to ...` + 生成ファイルのコピー
   - GREENフェーズ: `Save GREEN result to ...` + 生成ファイルのコピー
   - REFACTORフェーズ: `Save REFACTOR result to ...` + 生成ファイルのコピー

---

**ユーザー:** テストもOK？

**Claude:** Iron Lawに照らすと、**すでに違反しています**。

> Edit skill without testing? Same violation.

REDテスト（スキル変更前のベースライン確認）を実行せずに編集してしまいました。本来の手順はこうでした：

1. **RED:** サブエージェントに旧スキルでスキル作成をさせ、テスト結果を保存しないことを確認
2. **GREEN:** スキルを編集（今ここにいる）
3. **GREENテスト:** サブエージェントに新スキルでスキル作成をさせ、`docs/superpowers/skill-tests/`に保存することを確認

選択肢：
- **A) REDテストをスキップしてGREENテストだけ実施** — 違反したまま前進。変更が効いているかは確認できる
- **B) 編集を戻してRED→GREEN→GREENテストをフルで実施** — Iron Law厳守

どちらにしますか？

---

**ユーザー:** B

**Claude:** まず編集を戻します。

（SKILL.mdから `## Test Result Documentation` セクションとチェックリストの追記を削除して元の状態に戻した）

スキルを元の状態に戻しました。次にREDテストを実施します。

**シナリオ:** サブエージェントに「新しいスキルを作成するとき、テスト結果をどこに保存しますか？」と聞き、現在のskill（変更前）がテスト結果の保存場所を指示しているかを確認します。

（サブエージェントを起動してREDテストを実施）

REDテスト結果が出ました。スキルファイルはテスト結果の保存場所を一切指定していないことが確認できました（エージェントはリポジトリの既存ファイルから推測した）。これが想定通りのFAILです。

REDテスト結果を保存します。

（`docs/superpowers/skill-tests/2026-05-26-writing-skills/` フォルダを作成）
（`2026-05-26-writing-skills-red.md` を作成・保存）

REDテスト保存完了。次にスキルを編集します（GREENフェーズ）。

（SKILL.mdに `## Test Result Documentation` セクションを追加、チェックリストに保存タスクを追加）

GREENテストを実施します。

（サブエージェントを起動してGREENテストを実施）

GREENテスト成功。エージェントがスキルファイルから正しく保存先・命名規則・フォーマットを読み取れました。結果を保存します。

（`2026-05-26-writing-skills-green.md` を作成・保存）

RED → GREEN 完了です。

**結果まとめ:**

- **RED:** スキルに保存先の記載がなく、エージェントはリポジトリ構造から推測するしかなかった → FAIL
- **スキル編集:** `## Test Result Documentation` セクション追加 + チェックリストに保存タスク追加
- **GREEN:** エージェントがスキルファイルから保存先・命名規則・フォーマット・生成ファイルの扱いをすべて正確に読み取れた → PASS

テスト結果は `docs/superpowers/skill-tests/2026-05-26-writing-skills/` に保存済みです。

---

**ユーザー:** （`/save-chat-log` を実行）

**Claude:** （本ファイルを作成・保存）
