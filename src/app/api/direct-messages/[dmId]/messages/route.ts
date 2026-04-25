import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth/options';
import { prisma } from '@/shared/lib/db/prisma';
import { getPusherServer, pusherChannels, pusherEvents } from '@/lib/pusher/server';
import { isBlockedBetween } from '@/features/chat/services/chat-service';
export const dynamic = 'force-dynamic';

// GET: DMメッセージ一覧を取得
export async function GET(
  req: NextRequest,
  { params }: { params: { dmId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { dmId } = params;

    // DMの存在確認と権限チェック
    const directMessage = await prisma.directMessage.findUnique({
      where: { id: dmId },
    });

    if (!directMessage) {
      return NextResponse.json({ error: 'Direct message not found' }, { status: 404 });
    }

    if (directMessage.user1Id !== user.id && directMessage.user2Id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const otherUserId =
      directMessage.user1Id === user.id ? directMessage.user2Id : directMessage.user1Id;
    if (await isBlockedBetween(user.id, otherUserId)) {
      return NextResponse.json(
        { error: 'ブロック関係のためこのDMは利用できません' },
        { status: 403 }
      );
    }

    // メッセージ取得
    const messages = await prisma.dMMessage.findMany({
      where: {
        directMessageId: dmId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        attachments: true,
        reads: {
          include: {
            user: {
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
        createdAt: 'asc',
      },
    });

    // 受信したメッセージを既読にする
    const unreadMessageIds = messages
      .filter(
        (msg: any) =>
          msg.senderId !== user.id &&
          !msg.reads.some((read: any) => read.userId === user.id)
      )
      .map((msg: any) => msg.id);

    if (unreadMessageIds.length > 0) {
      const readAt = new Date();
      await prisma.dMMessageRead.createMany({
        data: unreadMessageIds.map((messageId: string) => ({
          dmMessageId: messageId,
          userId: user.id,
          readAt,
        })),
      });

      // 送信者に「既読になった」をリアルタイム通知
      const pusher = getPusherServer();
      if (pusher) {
        await pusher
          .trigger(pusherChannels.dm(dmId), pusherEvents.messageRead, {
            messageIds: unreadMessageIds,
            readerId: user.id,
            reader: {
              id: user.id,
              name: user.name,
              image: user.image,
            },
            readAt,
          })
          .catch((err) => {
            console.error("Pusher trigger (message:read) error:", err);
          });
      }
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching DM messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DM messages' },
      { status: 500 }
    );
  }
}

// POST: 新しいDMメッセージを送信
export async function POST(
  req: NextRequest,
  { params }: { params: { dmId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { dmId } = params;
    const { content, type = 'text', imageUrl } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // DMの存在確認と権限チェック
    const directMessage = await prisma.directMessage.findUnique({
      where: { id: dmId },
    });

    if (!directMessage) {
      return NextResponse.json({ error: 'Direct message not found' }, { status: 404 });
    }

    if (directMessage.user1Id !== user.id && directMessage.user2Id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const otherUserId =
      directMessage.user1Id === user.id ? directMessage.user2Id : directMessage.user1Id;
    if (await isBlockedBetween(user.id, otherUserId)) {
      return NextResponse.json(
        { error: 'ブロック関係のためこのDMは利用できません' },
        { status: 403 }
      );
    }

    // メッセージ作成
    const message = await prisma.dMMessage.create({
      data: {
        content,
        type,
        senderId: user.id,
        directMessageId: dmId,
        attachments: imageUrl
          ? {
              create: {
                url: imageUrl,
                type: 'image',
                fileName: 'uploaded-image',
                fileSize: 0,
              },
            }
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        attachments: true,
      },
    });

    // DirectMessageのupdatedAtを更新
    await prisma.directMessage.update({
      where: { id: dmId },
      data: { updatedAt: new Date() },
    });

    // Pusher経由でリアルタイム通知を送信
    const pusher = getPusherServer();
    if (pusher) {
      await pusher.trigger(
        pusherChannels.dm(dmId),
        pusherEvents.messageCreated,
        message
      ).catch((err) => {
        console.error('Pusher trigger error:', err);
      });
    }

    // 相手ユーザーに通知を送信
    const recipientId =
      directMessage.user1Id === user.id
        ? directMessage.user2Id
        : directMessage.user1Id;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'message',
        title: `${user.name || user.email}からのメッセージ`,
        content: content.substring(0, 50),
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending DM message:', error);
    return NextResponse.json(
      { error: 'Failed to send DM message' },
      { status: 500 }
    );
  }
}
