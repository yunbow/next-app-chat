import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // テストユーザーを作成
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      password: hashedPassword,
      status: 'online',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      password: hashedPassword,
      status: 'online',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      name: 'Charlie',
      password: hashedPassword,
      status: 'offline',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    },
  });

  console.log('✅ Created users:', { user1, user2, user3 });

  // グループを作成
  const group1 = await prisma.group.create({
    data: {
      name: 'General Discussion',
      description: 'A place for general conversation',
      createdById: user1.id,
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=General',
      members: {
        create: [
          { userId: user1.id, role: 'admin' },
          { userId: user2.id, role: 'member' },
          { userId: user3.id, role: 'member' },
        ],
      },
    },
  });

  const group2 = await prisma.group.create({
    data: {
      name: 'Project Team',
      description: 'Team collaboration space',
      createdById: user2.id,
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Project',
      members: {
        create: [
          { userId: user1.id, role: 'member' },
          { userId: user2.id, role: 'admin' },
        ],
      },
    },
  });

  console.log('✅ Created groups:', { group1, group2 });

  // サンプルメッセージを作成
  await prisma.message.create({
    data: {
      content: 'Hello everyone! Welcome to our chat app.',
      type: 'text',
      senderId: user1.id,
      groupId: group1.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Thanks Alice! Excited to be here.',
      type: 'text',
      senderId: user2.id,
      groupId: group1.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Let\'s start working on the project!',
      type: 'text',
      senderId: user2.id,
      groupId: group2.id,
    },
  });

  console.log('✅ Created sample messages');

  // フレンド関係を作成
  await prisma.userFriend.create({
    data: {
      userId: user1.id,
      friendId: user2.id,
      status: 'accepted',
    },
  });

  await prisma.userFriend.create({
    data: {
      userId: user1.id,
      friendId: user3.id,
      status: 'pending',
    },
  });

  console.log('✅ Created friend relationships');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
