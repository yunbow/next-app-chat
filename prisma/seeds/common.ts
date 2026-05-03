import type { PrismaClient } from '@prisma/client';

/**
 * prod / dev 共通で投入するマスタ・参照データ。
 * 冪等であること（upsert もしくは「存在チェック → 作成」）。
 *
 * 現状のスキーマには Category 等のマスタ表が無いため no-op。
 * 将来マスタ表を追加する際はここに upsert を集約する。
 */
export async function seedCommon(_prisma: PrismaClient): Promise<void> {
  // intentionally empty
}
