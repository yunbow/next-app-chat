import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db/prisma';
import { auth } from "@/shared/lib/auth/options";
export const dynamic = 'force-dynamic';

// GET: DM一覧を取得
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 自分が参加しているDMを取得
    const directMessages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            image: true,
            status: true,
          },
        },
        user2: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            image: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // 各DMについて、相手ユーザーと未読数を取得
    const dmsWithDetails = await Promise.all(
      directMessages.map(async (dm: any) => {
        // 相手ユーザーを特定
        const otherUser = dm.user1Id === user.id ? dm.user2 : dm.user1;
        const otherUserId = otherUser.id;

        // フレンド関係を確認
        const friendship = await prisma.userFriend.findFirst({
          where: {
            OR: [
              { userId: user.id, friendId: otherUserId, status: 'accepted' },
              { userId: otherUserId, friendId: user.id, status: 'accepted' },
            ],
          },
        });

        // フレンド関係がない場合は null を返す
        if (!friendship) {
          return null;
        }

        // 未読メッセージ数を取得
        const unreadCount = await prisma.dMMessage.count({
          where: {
            directMessageId: dm.id,
            senderId: { not: user.id },
            reads: {
              none: {
                userId: user.id,
              },
            },
          },
        });

        return {
          id: dm.id,
          otherUser,
          lastMessage: dm.messages[0] || null,
          unreadCount,
          updatedAt: dm.updatedAt,
        };
      })
    );

    // null を除外（フレンド関係がないDMを除外）
    const filteredDMs = dmsWithDetails.filter((dm) => dm !== null);

    return NextResponse.json({ directMessages: filteredDMs });
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch direct messages' },
      { status: 500 }
    );
  }
}

// POST: 新しいDMを作成（または既存のDMを取得）
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { friendId } = await req.json();

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }

    // フレンド関係を確認
    const friendship = await prisma.userFriend.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId, status: 'accepted' },
          { userId: friendId, friendId: user.id, status: 'accepted' },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friend relationship not found' },
        { status: 403 }
      );
    }

    // IDを正規化（小さい方をuser1Id、大きい方をuser2Idに）
    const [user1Id, user2Id] = [user.id, friendId].sort();

    // 既存のDMを検索
    let directMessage = await prisma.directMessage.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            image: true,
            status: true,
          },
        },
        user2: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            image: true,
            status: true,
          },
        },
      },
    });

    // 存在しない場合は新規作成
    if (!directMessage) {
      directMessage = await prisma.directMessage.create({
        data: {
          user1Id,
          user2Id,
        },
        include: {
          user1: {
            select: {
              id: true,
              userId: true,
              name: true,
              email: true,
              image: true,
              status: true,
            },
          },
          user2: {
            select: {
              id: true,
              userId: true,
              name: true,
              email: true,
              image: true,
              status: true,
            },
          },
        },
      });
    }

    // 相手ユーザーを特定
    const otherUser = directMessage.user1Id === user.id
      ? directMessage.user2
      : directMessage.user1;

    return NextResponse.json({
      directMessage: {
        id: directMessage.id,
        otherUser,
        updatedAt: directMessage.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating/getting direct message:', error);
    return NextResponse.json(
      { error: 'Failed to create/get direct message' },
      { status: 500 }
    );
  }
}
