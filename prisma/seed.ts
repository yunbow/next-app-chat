import { PrismaClient } from '@prisma/client';

const VALID_MODES = ['dev', 'prod'] as const;
type SeedMode = (typeof VALID_MODES)[number];

function isValidMode(value: string): value is SeedMode {
  return (VALID_MODES as readonly string[]).includes(value);
}

function resolveMode(): SeedMode {
  const explicit = process.env.SEED_MODE?.trim();
  if (explicit) {
    if (!isValidMode(explicit)) {
      throw new Error(
        `Invalid SEED_MODE: "${explicit}". Expected one of: ${VALID_MODES.join(', ')}`,
      );
    }
    return explicit;
  }
  // SEED_MODE 未指定時は NODE_ENV から推定。
  // development → dev、それ以外（production / undefined / その他）は prod 既定でフェイルセーフ。
  return process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
}

function assertSafety(mode: SeedMode): void {
  if (process.env.NODE_ENV === 'production' && mode === 'dev') {
    throw new Error(
      'Refused to run "dev" seed under NODE_ENV=production. ' +
        'Dev fixtures must not be inserted into a production database.',
    );
  }
}

async function main(): Promise<void> {
  const mode = resolveMode();
  assertSafety(mode);

  const prisma = new PrismaClient();
  console.log(`🌱 Seeding database (mode="${mode}", NODE_ENV="${process.env.NODE_ENV ?? ''}")`);

  try {
    if (mode === 'prod') {
      const { seedProd } = await import('./seeds/prod');
      await seedProd(prisma);
    } else {
      const { seedDev } = await import('./seeds/dev');
      await seedDev(prisma);
    }
    console.log('🎉 Seeding completed successfully!');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Error during seeding:', e);
  process.exit(1);
});
