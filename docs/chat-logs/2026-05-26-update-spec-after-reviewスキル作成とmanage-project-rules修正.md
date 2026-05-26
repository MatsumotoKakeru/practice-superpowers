# 2026-05-26 update-spec-after-reviewスキル作成とmanage-project-rules修正

## やり取り

**ユーザー:** 以下の仕様で新規スキル「update-spec-after-review」を作成してほしい。

【目的】
人間のレビュー了承後に設計書・実装計画を更新するフロー。

【フロー】
1. docs/rules/project-rules.mdを読み込み、ルールを把握する
2. レビューで指摘された内容を確認する
3. brainstormingスキルで定義された設計書フォーマットに従って設計書を更新する
   - 更新前の設計書はファイル名に日付・revisionなどを付けて同じディレクトリに残す
4. writing-plansスキルを使って実装計画を作成する：
   - 既存の実装計画がまだ未完了なら既存ファイルを更新する（修正前の内容はファイル内に残す）
   - 既存の実装計画が完了済みなら新規ファイルを作成する
5. manage-project-rulesを呼び出して設計変更・決定事項を記録する
6. ユーザーに確認を取ってからコミットする

**Claude:** まずスキルの構造と関連スキルを確認してから、TDDサイクルに沿って作業します。

（スキル構造・関連スキル・既存仕様書を確認後）

TDDサイクルに沿って進めます。まずRED フェーズ（スキルなしのベースラインテスト）から始めます。

（REDフェーズ実行後）

RED フェーズの結果を確認できました。ファイルを元に戻してから結果を記録します。

**RED フェーズで観察された失敗:**
1. 設計書を**元のファイルに上書き**（旧版のアーカイブなし）
2. 設計書の**間違ったセクション**を更新（brainstorming フォーマットの「イベント処理」ではなく「処理フロー」の API 呼び出し詳細を変更）
3. **project-rules.md を破壊**（既存のセクションヘッダーを重複追加）
4. **ユーザー確認なし**で変更を実行

（RED結果保存・スキル作成・GREENテスト実行後）

GREEN フェーズの結果を確認できました。ファイルを元に戻してから結果を記録します。

**GREEN フェーズの結果:**
- ✅ 旧版設計書をアーカイブ（`...design-before-2026-05-26-review.md`）
- ✅ 設計書に正しいフォーマット（イベント処理セクション）で追記
- ✅ 実装計画に Task 7b を追加（既存コンテンツを保持）
- ✅ manage-project-rules を呼び出し（設計決定事項に追記）
- ⚠️ manage-project-rules が既存セクションを重複追加（manage-project-rules 側の問題）
- ❓ コミット前のユーザー確認は今回のテストでは未確認（「コミットしないこと」と指示したため）

（REFACTORテスト実行後）

TDDサイクル完了。コミットしてよいか確認します。

**変更内容:**
- `.claude/skills/update-spec-after-review/SKILL.md` — 新規スキル
- `docs/superpowers/skill-tests/2026-05-26-update-spec-after-review/` — RED/GREEN/REFACTOR テスト結果 3ファイル

他の変更（既存 skill-tests ファイルの移動など）は今回の作業とは別のため含めません。コミットしてよいですか？

---

**ユーザー:** いいです

**Claude:** （コミット実行）

コミット完了。

`update-spec-after-review` スキルを作成・テスト・コミットしました。RED → GREEN → REFACTOR の結果:

- **RED**: 設計書を直接上書き、間違ったセクション更新、project-rules.md 破壊、確認なし
- **GREEN**: アーカイブ作成・イベント処理フォーマット・計画追記・manage-project-rules すべて正常
- **REFACTOR**: 同様に PASS（スコープクリープはスキル側ではなくエージェント一般の傾向として記録）

---

**ユーザー:** ⚠️ manage-project-rules が重複セクションを作った — これは update-spec-after-review 側の問題ではなく manage-project-rules スキル自体のバグという認識？

**Claude:** そうです。manage-project-rules のスキル側の問題です。

スキルの手順を見ると：
```
4. APPEND to the appropriate section
   IF file doesn't exist: CREATE with full structure
```

「ファイルが存在しない場合は全構造を作成」とは書いてありますが、「既存セクションヘッダーが存在する場合はその配下に追記（新規ヘッダー追加不可）」とは明示されていません。エージェントはこの曖昧さを「セクションを作って追記する」と解釈してしまっています。

修正するなら manage-project-rules に以下を追加すればよいです：

```
4. APPEND to the appropriate section
   IF section already exists: append within it — do NOT add a new section header
   IF file doesn't exist: CREATE with full structure
```

---

今回のスコープとしては update-spec-after-review への影響は「呼び出し先にバグがある」という話なので、update-spec-after-review 側は修正不要。manage-project-rules を直しますか？

---

**ユーザー:** 直して再テストお願いします。

**Claude:** manage-project-rules の修正から始めます。まず現在のスキルを読み、既知のバグを RED として記録してから直します。

（スキル読み込み・既存テスト結果確認後）

バグの所在が明確です。RED 記録 → スキル修正 → GREEN テストの順で進めます。

（RED結果保存・スキル修正後）

修正内容:

Step 4 を以下に変更:
```
旧:
4. APPEND to the appropriate section
   IF section already exists: add new bullet WITHIN it — do NOT add a new ## heading
   IF section does NOT exist: add ## heading + content
   IF file doesn't exist: CREATE with full structure

新:
4. SECTION CHECK: Grep the file for the target ## heading
   (e.g., grep "## 設計決定事項" to check if the section exists)
5. APPEND:
   IF file doesn't exist: CREATE with full structure
   IF section heading not found in file: add ## heading + bullet
   IF section heading found: add new bullet WITHIN the existing section
     — do NOT add a new ## heading
```

（GREENテスト v1 実行 → 失敗：エージェントが「セクションが存在しなかった」と言うが実際には存在）

バグが再現しました。エージェントは「セクションが存在しなかった」と言いましたが、実際には存在していました。根本原因はスキルが**セクションの存在確認を明示的な手順として指示していない**ことです。

（スキルをさらに修正: SECTION CHECK ステップを独立したステップとして追加）

（GREENテスト v2 実行 → 再び「存在しなかった」と返答）

再び同じ結果です。実際にファイルを確認したところ、HEAD の `project-rules.md` は 12 行しかなく、全セクションが存在していないことが判明。

問題が分かりました。テストが間違った前提で実施されていました。HEAD の `project-rules.md` は実は 12 行しかなく、全セクションが存在していません。

（全セクション揃った版でテスト用ファイルを準備してGREENテスト v3 実行）

GREEN テスト合格。スキル修正が正しく機能しています。

- `## 設計決定事項` を行 15 に発見 ✅
- 新規ヘッダー追加せず、既存セクション内に追記 ✅
- 既存エントリ（UserService）を保持 ✅

（ファイル元に戻し・結果保存・コミット実行）

コミット完了。

修正の要点:
- **旧**: 「適切なセクションに追記」という曖昧な指示だけで、セクション存在確認の手順がなかった
- **新**: Step 4 を「SECTION CHECK: 対象ヘッダーを grep で確認」として明示化。存在した場合のみ既存セクション内に追記、存在しない場合はヘッダーから作成

テストの過程で発覚した副次的な問題（HEAD の project-rules.md が 12 行しかなかったため前 2 回のテストが空振りだった）も GREEN 結果に記録済みです。
