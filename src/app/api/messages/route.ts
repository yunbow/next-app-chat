import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db/prisma';
import { z } from 'zod';
import { getPusherServer, pusherChannels, pusherEvents } from '@/lib/pusher/server';
import { auth } from "@/shared/lib/auth/options";
export const dynamic = 'force-dynamic';

const createMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'image', 'file']).default('text'),
  groupId: z.string().optional(),
  receiverId: z.string().optional(),
  imageUrl: z.string().optional(), // 画像URL（相対パスまたは絶対URL）
});

// メッセージ一覧取得
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

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const messages = await prisma.message.findMany({
      where: groupId
        ? { groupId, isDeleted: false }
        : {
            OR: [
              { senderId: user.id },
              {
                group: {
                  members: {
                    some: { userId: user.id },
                  },
                },
              },
            ],
            isDeleted: false,
          },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            status: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
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
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// メッセージ送信
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

    const body = await req.json();
    const validatedData = createMessageSchema.parse(body);

    console.log('Creating message with data:', validatedData);
    console.log('Has imageUrl:', !!validatedData.imageUrl);

    // グループメッセージの場合、メンバーシップを確認
    if (validatedData.groupId) {
      const membership = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: validatedData.groupId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: 'Not a member of this group' },
          { status: 403 }
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        content: validatedData.content,
        type: validatedData.type,
        senderId: user.id,
        groupId: validatedData.groupId || null,
        attachments: validatedData.imageUrl
          ? {
              create: {
                type: 'image',
                url: validatedData.imageUrl,
                fileName: validatedData.imageUrl.split('/').pop() || 'image',
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
            status: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attachments: true,
      },
    });

    console.log('Created message:', message);
    console.log('Message attachments:', message.attachments);

    // Pusher経由でリアルタイム通知を送信
    if (validatedData.groupId) {
      const pusher = getPusherServer();
      if (pusher) {
        await pusher.trigger(
          pusherChannels.group(validatedData.groupId),
          pusherEvents.messageCreated,
          message
        ).catch((err) => {
          console.error('Pusher trigger error:', err);
        });
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
