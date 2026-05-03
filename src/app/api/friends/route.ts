import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db/prisma';
import { z } from 'zod';
import { auth } from "@/shared/lib/auth/options";
export const dynamic = 'force-dynamic';

const sendFriendRequestSchema = z.object({
  friendId: z.string(),
});

// フレンド一覧取得
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
    const status = searchParams.get('status');

    const friends = await prisma.userFriend.findMany({
      where: {
        OR: [
          { userId: user.id },
          { friendId: user.id },
        ],
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            image: true,
            status: true,
            lastSeenAt: true,
          },
        },
        friend: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            image: true,
            status: true,
            lastSeenAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// フレンドリクエスト送信
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
    const validatedData = sendFriendRequestSchema.parse(body);

    // 自分自身へのリクエストを防ぐ
    if (validatedData.friendId === user.id) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // 既存のリクエストをチェック
    const existingRequest = await prisma.userFriend.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: validatedData.friendId },
          { userId: validatedData.friendId, friendId: user.id },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Friend request already exists' },
        { status: 400 }
      );
    }

    const friendRequest = await prisma.userFriend.create({
      data: {
        userId: user.id,
        friendId: validatedData.friendId,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            image: true,
          },
        },
        friend: {
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // フレンド申請の通知を作成
    await prisma.notification.create({
      data: {
        userId: validatedData.friendId, // 受信者
        type: 'friend_request',
        title: 'フレンド申請',
        content: `${user.name || 'ユーザー'}さんからフレンド申請が届きました`,
      },
    });

    return NextResponse.json({ friendRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
