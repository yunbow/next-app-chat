# テストカバレッジ計測レポート

**実施日時:** 2026-05-09  
**コマンド:** `vitest run --coverage`  
**Vitest バージョン:** v4.1.5  
**カバレッジプロバイダー:** V8

---

## サマリー

| 指標 | カバレッジ | 対象数 |
|------|-----------|--------|
| Statements | **86%** | 86 / 100 |
| Branches | **77.27%** | 34 / 44 |
| Functions | **91.66%** | 11 / 12 |
| Lines | **85.85%** | 85 / 99 |

---

## テスト実行結果

| 項目 | 結果 |
|------|------|
| テストファイル数 | 6 passed |
| テスト総数 | 69 passed |
| 失敗 | 0 |
| 実行時間 | 17.84s |

---

## ファイル別カバレッジ

| ファイル | Stmts | Branches | Funcs | Lines | 未カバー行 |
|---------|-------|----------|-------|-------|-----------|
| **features/chat/server/message-actions.ts** | 82.25% | 73.52% | 100% | 82.25% | 147, 157, 167, 190–191 |
| **lib/utils/url-validation.ts** | 83.33% | 90% | 75% | 82.35% | 28, 33–41 |
| **All files** | 86% | 77.27% | 91.66% | 85.85% | — |

---

## テスト一覧

### integration/server-actions/message-actions.test.ts (11 tests)

| テスト名 | 結果 |
|---------|------|
| createMessageAction > should return error if not authenticated | ✓ |
| createMessageAction > should return error if user not found | ✓ |
| createMessageAction > should return error for invalid data | ✓ |
| createMessageAction > should create message successfully | ✓ |
| createMessageAction > should check group membership for group messages | ✓ |
| updateMessageAction > should return error if not authenticated | ✓ |
| updateMessageAction > should return error if message not found | ✓ |
| updateMessageAction > should return error if not owner (IDOR protection) | ✓ |
| updateMessageAction > should update message successfully | ✓ |
| deleteMessageAction > should return error if not owner (IDOR protection) | ✓ |
| deleteMessageAction > should delete message successfully (soft delete) | ✓ |

### features/chat/message-schema.test.ts (18 tests)

| テスト名 | 結果 |
|---------|------|
| createMessageSchema > should validate valid message data | ✓ |
| createMessageSchema > should reject empty content | ✓ |
| createMessageSchema > should reject content exceeding 5000 characters | ✓ |
| createMessageSchema > should accept valid image URL | ✓ |
| createMessageSchema > should reject invalid image URL | ✓ |
| createMessageSchema > should default type to text | ✓ |
| updateMessageSchema > should validate valid update data | ✓ |
| updateMessageSchema > should reject empty content | ✓ |
| createGroupSchema > should validate valid group data | ✓ |
| createGroupSchema > should reject empty name | ✓ |
| createGroupSchema > should reject name exceeding 100 characters | ✓ |
| createGroupSchema > should accept optional description | ✓ |
| createGroupSchema > should reject description exceeding 500 characters | ✓ |
| createGroupSchema > should accept valid image URL | ✓ |
| createGroupSchema > should reject invalid image URL | ✓ |
| updateGroupSchema > should validate valid update data | ✓ |
| updateGroupSchema > should accept partial updates | ✓ |
| updateGroupSchema > should accept empty object | ✓ |

### features/auth/auth-schema.test.ts (10 tests)

| テスト名 | 結果 |
|---------|------|
| loginSchema > should validate valid login data | ✓ |
| loginSchema > should reject invalid email | ✓ |
| loginSchema > should reject short password | ✓ |
| registerSchema > should validate valid registration data | ✓ |
| registerSchema > should reject empty name | ✓ |
| registerSchema > should reject name exceeding 50 characters | ✓ |
| registerSchema > should reject password without uppercase | ✓ |
| registerSchema > should reject password without lowercase | ✓ |
| registerSchema > should reject password without number | ✓ |
| registerSchema > should reject mismatched passwords | ✓ |

### lib/utils/text-sanitizer.test.ts (12 tests)

| テスト名 | 結果 |
|---------|------|
| sanitizeUnicode > 通常のテキストはそのまま返す | ✓ |
| sanitizeUnicode > RTLオーバーライド文字を除去する | ✓ |
| sanitizeUnicode > ゼロ幅文字を除去する | ✓ |
| sanitizeUnicode > BOMを除去する | ✓ |
| sanitizeUnicode > 制御文字を除去する | ✓ |
| sanitizeUnicode > タブと改行は維持する | ✓ |
| containsDangerousUnicode > 危険な文字がない場合はfalse | ✓ |
| containsDangerousUnicode > 危険な文字がある場合はtrue | ✓ |
| hasMixedScripts > 単一スクリプトの場合はfalse | ✓ |
| hasMixedScripts > ラテン文字とキリル文字が混在する場合はtrue | ✓ |
| hasMixedScripts > ラテン文字とギリシャ文字が混在する場合はtrue | ✓ |
| sanitizeForDisplay > 連続する改行を2つに制限する | ✓ |
| sanitizeForDisplay > 危険文字と改行制限を同時に適用する | ✓ |

### lib/utils/url-validation.test.ts (13 tests)

| テスト名 | 結果 |
|---------|------|
| isSafeImageUrl > 相対パス（/uploads/）を許可する | ✓ |
| isSafeImageUrl > HTTPS URLを許可する | ✓ |
| isSafeImageUrl > HTTP URLを拒否する | ✓ |
| isSafeImageUrl > javascript: URLを拒否する | ✓ |
| isSafeImageUrl > data: URLを拒否する | ✓ |
| isSafeImageUrl > 空文字列を拒否する | ✓ |
| isSafeImageUrl > nullish値を拒否する | ✓ |
| hasDangerousScheme > javascript:を検出する | ✓ |
| hasDangerousScheme > data:を検出する | ✓ |
| hasDangerousScheme > vbscript:を検出する | ✓ |
| hasDangerousScheme > file:を検出する | ✓ |
| hasDangerousScheme > https:は安全 | ✓ |
| hasDangerousScheme > 大文字小文字を区別しない | ✓ |

### integration/race/message-read.test.ts (4 tests)

| テスト名 | 結果 |
|---------|------|
| chat read-status race-safety > uses `createMany` (bulk insert) rather than per-row `create` | ✓ |
| chat read-status race-safety > filters out already-read messages via `reads: { none: { userId } }` | ✓ |
| chat read-status race-safety > passes `skipDuplicates: true` so concurrent readers don't hit P2002 | ✓ |
| chat read-status race-safety > runInParallel helper is wired for live-DB integration follow-up | ✓ |

---

## 未カバー箇所の分析

### features/chat/server/message-actions.ts（未カバー行: 147, 157, 167, 190–191）
- **147, 157, 167行:** エラーハンドリングの catch ブロック（例外が意図的にスローされる境界ケース）
- **190–191行:** 削除時の条件分岐（認証済みでオーナーでない場合のエラーパス）

### lib/utils/url-validation.ts（未カバー行: 28, 33–41）
- **28行:** allowedHostnames リストへの追加パス（現状のテストでは到達しない拡張用コード）
- **33–41行:** 追加の URL バリデーションロジック（エッジケース）
