import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedCommon } from './common';

const DEV_PASSWORD = 'password123';

/**
 * 開発向けシード。
 * - ユーザー 2 名 (alice / bob) と 1 グループ
 * - 各ユーザーがグループに 3 件ずつメッセージを投稿
 * - 双方向フレンド関係 (accepted)
 *
 * 全て upsert もしくは「存在チェック → 作成」で冪等。
 */
export async function seedDev(prisma: PrismaClient): Promise<void> {
  console.log('  → seeding common (master) data');
  await seedCommon(prisma);

  console.log('  → seeding dev users');
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      password: passwordHash,
      status: 'online',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
  });

  await prisma.subscription.upsert({
    where: { userId: alice.id },
    update: { plan: 'premium' },
    create: { userId: alice.id, plan: 'premium', status: 'active' },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      password: passwordHash,
      status: 'online',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    },
  });

  console.log('  → seeding dev group / members');
  const groupName = 'General Discussion';
  let group = await prisma.group.findFirst({
    where: { name: groupName, createdById: alice.id },
  });
  if (!group) {
    group = await prisma.group.create({
      data: {
        name: groupName,
        description: 'A place for general conversation',
        createdById: alice.id,
        image: 'https://api.dicebear.com/7.x/shapes/svg?seed=General',
        members: {
          create: [
            { userId: alice.id, role: 'admin' },
            { userId: bob.id, role: 'member' },
          ],
        },
      },
    });
  }

  console.log('  → seeding dev messages');
  const existingMessageCount = await prisma.message.count({
    where: { groupId: group.id },
  });
  if (existingMessageCount === 0) {
    const aliceMessages = [
      'Welcome to the General channel!',
      'Feel free to introduce yourselves here.',
      'Let me know if you have any questions.',
    ];
    const bobMessages = [
      'Thanks Alice, glad to be here!',
      'Looking forward to collaborating.',
      "I'll share project updates in this channel.",
    ];

    for (const content of aliceMessages) {
      await prisma.message.create({
        data: { content, type: 'text', senderId: alice.id, groupId: group.id },
      });
    }
    for (const content of bobMessages) {
      await prisma.message.create({
        data: { content, type: 'text', senderId: bob.id, groupId: group.id },
      });
    }
  }

  console.log('  → seeding dev friend relations');
  await prisma.userFriend.upsert({
    where: { userId_friendId: { userId: alice.id, friendId: bob.id } },
    update: {},
    create: { userId: alice.id, friendId: bob.id, status: 'accepted' },
  });
}
