import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth/options';
import { prisma } from '@/shared/lib/db/prisma';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

const updateUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  userId: z.string().min(1).max(50).optional(),
  status: z.enum(['online', 'offline', 'away']).optional(),
});

// 現在のユーザー情報取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        image: true,
        status: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ユーザー情報更新（名前・ステータス）
export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // 更新するデータを構築
    const updateData: any = {
      lastSeenAt: new Date(),
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name.trim();
    }

    if (validatedData.userId !== undefined) {
      const trimmedUserId = validatedData.userId.trim();

      // userIdが変更されている場合、既存のuserIdをチェック
      if (trimmedUserId !== user.userId) {
        const existingUser = await prisma.user.findUnique({
          where: { userId: trimmedUserId },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: 'このIDは既に使用されています' },
            { status: 400 }
          );
        }
      }

      updateData.userId = trimmedUserId;
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        image: true,
        status: true,
        lastSeenAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
