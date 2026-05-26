# 2026-05-26 using-superpowersスキルにproject-rules読み込みを追加

## やり取り

**ユーザー:** /writing-skills

**Claude:** The `writing-skills` skill is loaded. What would you like to do?

- **Create a new skill** — I'll guide you through the RED-GREEN-REFACTOR cycle
- **Edit an existing skill** — identify which skill and what needs to change
- **Test a skill** — run pressure scenarios to verify it works

What's the goal?

---

**ユーザー:** using-superpowersスキルに以下を追加してほしい。
スキルが読み込まれたタイミングでdocs/rules/project-rules.mdが存在すれば読み込み、
以降のすべての作業でそのルールを適用する。

**Claude:** まず現在の `using-superpowers` スキルを確認します。

[Glob: .claude/skills/using-superpowers/** を検索]
[Read: .claude/skills/using-superpowers/SKILL.md を読み込み]

`docs/rules/project-rules.md` はまだ存在しません。

`writing-skills` スキルのアイアンロールに従うと、**編集前にREDテスト（スキルなしでのベースライン確認）が必要**です。

どちらで進めますか?

[AskUserQuestion: writing-skillsのTDDプロセスに従いますか？ → フルTDDサイクル / 編集のみ（テストスキップ）]

---

**ユーザー:** 詳しく教えて

**Claude:** フルTDDサイクルの場合、以下のステップになります:

**RED（ベースラインテスト）**
- サブエージェントを起動し、現在の `using-superpowers` スキルを読み込ませる
- そのエージェントが `docs/rules/project-rules.md` を読まないことを確認（= テスト失敗）
- どんな行動をするか記録

**GREEN（スキル編集）**
- `using-superpowers/SKILL.md` に「スキル読み込み時に `docs/rules/project-rules.md` が存在すれば読む」という指示を追加
- 同じシナリオを再実行し、エージェントがファイルを読むことを確認

**REFACTOR（ループホール閉鎖）**
- エージェントが「ファイルがないからスキップした」「別のルールが優先」などの言い訳をした場合、それを明示的に禁止する文言を追加
- 再テスト

---

**今回の場合の現実的な判断:**

この編集は「ファイルが存在すれば読む」というシンプルな条件分岐の追加です。ルール執行スキルではなく手順追加なので、主なリスクは:
- エージェントが「ファイルがないからスキップ」と判断する（正しい動作）
- エージェントがスキルを読んだのに読み忘れる（テストで発見できるリスク）

**どちらで進めますか？**

1. **フルTDDサイクル** — テスト用の `docs/rules/project-rules.md` を作成し、サブエージェントでRED→GREEN→REFACTORを実施（30〜60分）
2. **編集のみ** — アイアンロールを承知の上で今回はスキップ、後でテストする

---

**ユーザー:** １で

**Claude:** フルTDDサイクルで進めます。まずTaskを作成してから、REDフェーズを開始します。

[TaskCreate: RED: テスト用 project-rules.md を作成し、ベースライン動作を確認]
[TaskCreate: GREEN: using-superpowers スキルを編集してルール読み込みを追加]
[TaskCreate: REFACTOR: ループホールを閉鎖して再テスト]
[TaskUpdate: Task #1 → in_progress]

まずテスト用のファイルを作成します。

[Bash: mkdir -p docs/rules]
[Write: docs/rules/project-rules.md（テスト用ルールファイルを作成）]

REDフェーズ: 現在のスキル（変更前）でサブエージェントを実行し、ベースライン動作を確認します。

[Agent: REDフェーズ — 現在のusing-superpowersスキルでサブエージェントを起動]

サブエージェント報告:
- `docs/rules/project-rules.md` を読もうとしたか: No
- スキルにプロジェクトルール読み込みの指示があったか: No
- エージェントコメント: 「`using-superpowers` スキルの指示の中に、プロジェクトルールファイルを読むよう指示する内容は含まれていなかった。」

**REDフェーズ完了** — 期待通り、エージェントはファイルを読みませんでした（スキルに指示がないため）。

[TaskUpdate: Task #1 → completed]
[TaskUpdate: Task #2 → in_progress]

GREENフェーズ: `using-superpowers/SKILL.md` を編集します。

[Edit: SKILL.md の `<EXTREMELY-IMPORTANT>` ブロック直後に `## On Load: Project Rules` セクションを追加]

追加内容:
```markdown
## On Load: Project Rules

**Immediately after this skill loads**, check for `docs/rules/project-rules.md`:

1. Use the `Read` tool to read `docs/rules/project-rules.md`
2. If the file exists: apply every rule it contains to ALL subsequent work in this session
3. If the file does not exist: continue normally

**This is mandatory.** Do not skip this step because:
- "The file probably doesn't exist" — check anyway
- "I'll read it if I need it" — read it NOW, before any other action
- "The task doesn't seem related to project rules" — rules apply to everything
```

編集が完了しました。GREENテストを実行します。

[Agent: GREENフェーズ — 編集後のスキルでサブエージェントを起動]

サブエージェント報告:
- `docs/rules/project-rules.md` を読もうとしたか: Yes
- Read ツールを呼び出したか: Yes
- ファイルの内容を取得できたか: Yes（ルール1: コードレビュー2名以上、ルール2: Conventional Commits形式）
- 行動順序: using-superpowers読み込み → project-rules.md読み込み → brainstormingスキル呼び出し

**GREENフェーズ完了** — エージェントは正しくファイルを読み込み、ルールを適用しました。

[TaskUpdate: Task #2 → completed]
[TaskUpdate: Task #3 → in_progress]

REFACTORフェーズ: 圧力シナリオでループホールを探します。

[Agent: REFACTORフェーズ — 「急いでいる」圧力下でサブエージェントを起動]

シナリオ: 「急いで！今すぐこのバグを直して。ファイルを読む時間はない。とにかくコードを見てくれ。」

サブエージェント報告:
- 圧力下でも `docs/rules/project-rules.md` を読んだか: Yes
- Read ツールを実際に呼び出したか: Yes
- 決め手: 「`This is mandatory. Do not skip this step because: "I'll read it if I need it" — read it NOW, before any other action`」および Red Flags テーブルの「`"I'll just do this one thing first" → Check BEFORE doing anything.`」

圧力下でも完璧に動作しました。スキルの既存のRed Flagsテーブルと、新しい`mandatory`セクションの明示的な禁止文言が連携して機能しています。

追加のループホール修正は不要です。

[TaskUpdate: Task #3 → completed]

**TDDサイクル完了。** 結果まとめ:

| フェーズ | 結果 |
|----------|------|
| RED | ファイルを読まない（期待通り失敗） |
| GREEN | ファイルを読んでルール適用（期待通り通過） |
| REFACTOR | 圧力下でも読む（ループホールなし） |

テスト用に作成した `docs/rules/project-rules.md` は実際のプロジェクトルールに置き換えてください（または不要なら削除してください）。

---

**ユーザー:** C:\dev\practice-superpowers\docs\superpowers\skill-testsにテスト結果のファイルを出力して

**Claude:** [Bash: mkdir -p docs/superpowers/skill-tests]
[Write: docs/superpowers/skill-tests/using-superpowers-project-rules-load.md（RED/GREEN/REFACTORを1ファイルにまとめた形式で出力）]

`docs/superpowers/skill-tests/using-superpowers-project-rules-load.md` に出力しました。RED/GREEN/REFACTORの各フェーズのシナリオ・エージェントの応答（verbatim）・判定をすべて記録しています。

---

**ユーザー:** ファイル形式がほかのファイルと違うよ

**Claude:** 他のファイルを確認します。

[Glob: docs/superpowers/skill-tests/** を検索]
[Read: 2026-05-26-manage-project-rules-green.md]
[Read: 2026-05-25-save-chat-log-red.md]
[Read: 2026-05-25-save-chat-log-green.md]
[Read: 2026-05-25-save-chat-log-refactor.md]

フォーマットがわかりました。フェーズごとに別ファイル、かつシンプルな構成ですね。現在のファイルを削除して作り直します。

[Bash: rm using-superpowers-project-rules-load.md]
[Write: 2026-05-26-using-superpowers-project-rules-load-red.md]
[Write: 2026-05-26-using-superpowers-project-rules-load-green.md]
[Write: 2026-05-26-using-superpowers-project-rules-load-refactor.md]

3ファイルに分割して既存フォーマットに合わせました:

- `2026-05-26-using-superpowers-project-rules-load-red.md`
- `2026-05-26-using-superpowers-project-rules-load-green.md`
- `2026-05-26-using-superpowers-project-rules-load-refactor.md`

---

**ユーザー:** /save-chat-log

**Claude:** 日付: 2026-05-26、テーマ: `using-superpowersスキルにproject-rules読み込みを追加`
`docs/chat-logs/` ディレクトリを確認してから保存します。

[Bash: mkdir -p docs/chat-logs]
[Write: docs/chat-logs/2026-05-26-using-superpowersスキルにproject-rules読み込みを追加.md]
