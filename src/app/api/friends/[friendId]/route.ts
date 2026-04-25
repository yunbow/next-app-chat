import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth/options';
import { prisma } from '@/shared/lib/db/prisma';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

const updateFriendRequestSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'blocked']),
});

// フレンドリクエストの承認/拒否
export async function PATCH(
  req: NextRequest,
  { params }: { params: { friendId: string } }
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

    const { friendId } = params;
    const body = await req.json();
    const validatedData = updateFriendRequestSchema.parse(body);

    // フレンドリクエストの存在確認（自分が受信者である必要がある）
    const friendRequest = await prisma.userFriend.findUnique({
      where: { id: friendId },
    });

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // 自分が受信者であることを確認
    if (friendRequest.friendId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this request' },
        { status: 403 }
      );
    }

    // ステータスが pending であることを確認
    if (friendRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      );
    }

    // ステータスを更新
    const updatedRequest = await prisma.userFriend.update({
      where: { id: friendRequest.id },
      data: { status: validatedData.status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // 承認された場合、申請者に通知を送る
    if (validatedData.status === 'accepted') {
      await prisma.notification.create({
        data: {
          userId: friendRequest.userId, // 申請者
          type: 'friend_request',
          title: 'フレンド申請が承認されました',
          content: `${user.name || 'ユーザー'}さんがフレンド申請を承認しました`,
        },
      });
    }

    return NextResponse.json({ friendRequest: updatedRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating friend request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// フレンド削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: { friendId: string } }
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

    const { friendId } = params;

    // friendId はフレンドシップレコードのIDとして扱う
    const friendship = await prisma.userFriend.findUnique({
      where: { id: friendId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    // 自分がこのフレンドシップの当事者であることを確認
    if (friendship.userId !== user.id && friendship.friendId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this friendship' },
        { status: 403 }
      );
    }

    // 相手のユーザーIDを取得
    const otherUserId = friendship.userId === user.id
      ? friendship.friendId
      : friendship.userId;

    // 2人のユーザーIDを正規化（小さい方をuser1Id、大きい方をuser2Idに）
    const [user1Id, user2Id] = [user.id, otherUserId].sort();

    // フレンド関係を削除
    await prisma.userFriend.delete({
      where: { id: friendId },
    });

    // 2人の間のダイレクトメッセージを削除
    await prisma.directMessage.deleteMany({
      where: {
        user1Id,
        user2Id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting friend:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
