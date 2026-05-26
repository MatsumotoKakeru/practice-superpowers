# 2026-05-26 brainstormingスキルmanage-project-rules追加

## やり取り

**ユーザー:** `/writing-skills`

**Claude:** （writing-skillsスキルのコンテンツが読み込まれた）

メモリはまだありません。どのような作業をしたいですか?

- **新しいスキルを作成する** (RED-GREEN-REFACTORサイクル)
- **既存スキルを編集する** (特定の変更をテストして検証)
- **スキルの動作を検証する** (デプロイ前のテスト)

どれを行いたいですか?

---

**ユーザー:** brainstormingスキルに以下を追加してほしい。
設計書のコミット後にmanage-project-rulesスキルを呼び出して
設計で決定した事項を記録する。

**Claude:** まず既存のbrainstormingスキルを確認します。

（`C:\dev\practice-superpowers\.claude\skills\brainstorming\SKILL.md` を読み込み）

writing-skillsのIron Lawに従い、編集前にREDテストが必要です。現在のスキルで「設計書コミット後にmanage-project-rulesを呼ぶか」をベースライン測定します。

（サブエージェントによるREDフェーズテストを実行）

**サブエージェント結果:**

Analysis complete.

What the brainstorming skill says to do after committing the design doc (step 6):

The checklist in SKILL.md specifies:
- Step 7: Spec self-review (scan for placeholders, contradictions, ambiguity)
- Step 8: Ask user to review the written spec
- Step 9: Invoke the `writing-plans` skill

The "After the Design" section reinforces this: after committing, run the spec self-review loop, then present a User Review Gate message, wait for approval, and then invoke `writing-plans`. The skill explicitly states: "Do NOT invoke any other skill. writing-plans is the next step."

Is there any instruction to call manage-project-rules?

No. There is zero mention of `manage-project-rules` anywhere in the brainstorming SKILL.md. The only skill invocation mentioned is `writing-plans`.

What would an agent do naturally (without the new step)?

After committing the design doc, the agent would:
1. Run the spec self-review (check for TBDs, contradictions, scope issues)
2. Present the User Review Gate message: "Spec written and committed to `<path>`. Please review it and let me know if you want to make any changes before we start writing out the implementation plan."
3. Wait for user approval
4. Invoke `writing-plans`

The agent would never call `manage-project-rules` because the skill does not mention it.

VERDICT: FAIL

The agent would NOT call `manage-project-rules`. The brainstorming skill has no step for recording design decisions to the project rules file. The design decisions (full-text search on title/code/language, real-time frontend filtering, backend via query params on existing endpoint) would be lost — not persisted to `docs/rules/project-rules.md`.

---

REDフェーズ確認: FAIL — スキルにはmanage-project-rules呼び出しの記載なし。

次にREDテスト結果を保存し、スキルを編集します。

（`docs/superpowers/skill-tests/2026-05-26-brainstorming-manage-project-rules/` ディレクトリを作成）

（REDテスト結果を `2026-05-26-brainstorming-manage-project-rules-red.md` に保存）

REDテスト保存完了。GREENフェーズ: スキルを編集します。

チェックリスト・フローチャート・「After the Design」セクションの3箇所を更新します。

（`SKILL.md` を3箇所編集：
1. チェックリストのステップ7に「Record design decisions — invoke manage-project-rules skill to record decisions made during design」を追加し、以降のステップ番号を繰り上げ
2. フローチャートに `"Write design doc" -> "Invoke manage-project-rules\n(record design decisions)"` ノードを追加
3. 「After the Design」セクションに「Record Design Decisions」サブセクションを追加）

GREENフェーズのテストを実行します。

（サブエージェントによるGREENフェーズテストを実行）

**サブエージェント結果:**

Answers:

1. Step 7 in the checklist:
Step 7 is "Record design decisions" — invoke the `manage-project-rules` skill to record decisions made during design.

2. What the agent should do immediately after committing the design doc:
According to both the checklist (step 7) and the "Record Design Decisions" section under "After the Design," the agent must immediately invoke `manage-project-rules` to record key decisions before proceeding to the spec self-review (step 8).

3. Would the agent call `manage-project-rules`? What would it record?
Yes. The skill was invoked from brainstorming, so `manage-project-rules` would skip asking the user and use content passed by the calling skill. It would classify and record under the `設計決定事項` (Design Decisions) category:

- 検索はタイトル・コード・言語タグで全文検索（理由: ユーザーが探しやすい）
- フロントエンドはリアルタイム検索（入力のたびにフィルタリング）（理由: UX向上）
- バックエンドAPIは既存の /api/snippets にクエリパラメータ追加（理由: シンプルさを優先）
- 却下した選択肢: 専用検索エンドポイント（理由: 実装の複雑さを避けるため）

VERDICT: PASS

The skill's checklist, process flow diagram, and "Record Design Decisions" prose section all explicitly require invoking `manage-project-rules` after committing the design doc. The instruction is present in three separate places, making it unambiguous that a compliant agent would call it.

---

GREEN PASS。ただし潜在的なループホールを確認します。

（`SKILL.md` 内の「ONLY skill|only.*skill|writing-plans is the next」を検索）

検索結果:
```
68:**The terminal state is invoking writing-plans.** Do NOT invoke frontend-design, mcp-builder, or any other implementation skill. The ONLY skill you invoke after brainstorming is writing-plans.
182:- Do NOT invoke any other skill. writing-plans is the next step.
```

ループホール発見: 「The ONLY skill you invoke after brainstorming is writing-plans」が新ステップと矛盾しています。REFACTORします。

（`SKILL.md` を2箇所修正：
1. 「The ONLY skill you invoke after brainstorming is writing-plans.」→「The two skills invoked after brainstorming are: (1) manage-project-rules to record design decisions, then (2) writing-plans to create the implementation plan.」
2. 「Do NOT invoke any other skill. writing-plans is the next step.」→「First invoke manage-project-rules (step 7), then invoke writing-plans. Do NOT invoke any other skill.」）

REFACTORテストでループホールが潰されたか確認します。

（サブエージェントによるREFACTORフェーズテストを実行）

**サブエージェント結果:**

Findings:

The skill has three places that describe what to invoke after brainstorming. They are consistent:

1. Checklist (lines 30-33): Step 7 = manage-project-rules, Step 10 = writing-plans. Clear sequential order.
2. Process Flow diagram (line 60): "Write design doc" -> "Invoke manage-project-rules" -> "Spec self-review" -> ... -> "Invoke writing-plans skill". Explicit and unambiguous.
3. Terminal state note (line 68): "The two skills invoked after brainstorming are: (1) manage-project-rules to record design decisions, then (2) writing-plans to create the implementation plan."
4. "After the Design" section (lines 159-160 and 182): Dedicated "Record Design Decisions" subsection explicitly says to invoke manage-project-rules after committing. Line 182 repeats: "First invoke manage-project-rules (step 7), then invoke writing-plans. Do NOT invoke any other skill."

Pressure-test result: An agent trying to rationalize "writing-plans is next, I can skip manage-project-rules" would find no support anywhere in the skill. Every mechanism — checklist, diagram, prose summary, and implementation section — lists manage-project-rules before writing-plans.

No conflicting or ambiguous statements found.

VERDICT: PASS

---

REFACTOR PASS。テスト結果を保存します。

（`2026-05-26-brainstorming-manage-project-rules-green.md` を保存）

（`2026-05-26-brainstorming-manage-project-rules-refactor.md` を保存）

RED→GREEN→REFACTORサイクル完了。変更内容まとめ：

**編集箇所（SKILL.md）:**
1. **チェックリスト** — ステップ7として「Record design decisions — invoke manage-project-rules」を追加（以降ステップ番号を繰り上げ）
2. **フローチャート** — 「Write design doc」→「Invoke manage-project-rules」→「Spec self-review」のノードを追加
3. **After the Design セクション** — 「Record Design Decisions」サブセクションを追加
4. **矛盾する記述を修正** — 「writing-plansのみ呼ぶ」→「manage-project-rules、次にwriting-plans」に2箇所更新

---

**ユーザー:** `/save-chat-log`

**Claude:** 今日の日付は2026-05-26。テーマ: `brainstormingスキルmanage-project-rules追加`。ディレクトリを確認してログを保存します。

（`docs/chat-logs/` ディレクトリを作成し、このチャットログファイルを保存）
