import type { PrismaClient } from '@prisma/client';
import { seedCommon } from './common';

/**
 * 本番向けシード。マスタ・参照データのみ。
 * ユーザー / メッセージ等の業務データは投入しない。
 */
export async function seedProd(prisma: PrismaClient): Promise<void> {
  console.log('  → seeding common (master) data');
  await seedCommon(prisma);
}
