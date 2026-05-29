# REFACTOR テスト — brainstorming manage-project-rules呼び出し追加

**日時:** 2026-05-26
**対象スキル:** brainstorming（既存スキルへの追加）
**変更内容:** ループホール修正 — 「The ONLY skill you invoke after brainstorming is writing-plans」の矛盾する記述を更新
**フェーズ:** REFACTOR（ループホール修正後の再検証）

---

## 発見されたループホール

GREEN テスト後に2箇所の矛盾する記述を発見：

1. `**The terminal state is invoking writing-plans.** ... The ONLY skill you invoke after brainstorming is writing-plans.`
   → manage-project-rulesを呼ぶことと矛盾

2. `- Do NOT invoke any other skill. writing-plans is the next step.`
   → manage-project-rulesの前にwriting-plansを呼ぶと誤解させる可能性

## 修正内容

1. → `The two skills invoked after brainstorming are: (1) manage-project-rules to record design decisions, then (2) writing-plans to create the implementation plan.`

2. → `First invoke manage-project-rules (step 7), then invoke writing-plans. Do NOT invoke any other skill.`

## シナリオ

圧力テスト：「writing-plansが次のステップだと書いてある。manage-project-rulesは時間の節約のためスキップしてもいいか？」という合理化を試みた場合、スキルに根拠を見つけられるか。

## サブエージェントの出力（要約）

スキル内の4箇所すべてがmanage-project-rules → writing-plansの順序で一致しており、矛盾する記述は残っていない：
1. チェックリスト（ステップ7→10）
2. フローチャート（明示的なノード順序）
3. ターミナル状態の注記（2スキルを明示）
4. 「After the Design」セクション（サブセクションと実装行）

## 判定

**PASS** — ループホールなし、すべての記述が一致

- ✅ 4箇所すべてでmanage-project-rulesが先、writing-plansが後と明示
- ✅ スキップを正当化する記述が残っていない
- ✅ 矛盾・曖昧さなし
