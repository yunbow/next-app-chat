import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db/prisma';
import { z } from 'zod';
import { auth } from "@/shared/lib/auth/options";
import { getUserPlan } from "@/shared/lib/stripe/get-user-plan";
import { getLimits } from "@/shared/lib/stripe/plan-limits";
export const dynamic = 'force-dynamic';

const addMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member']).default('member'),
});

// グループに参加
export async function POST(req: NextRequest, props: { params: Promise<{ groupId: string }> }) {
  const params = await props.params;
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

    const { groupId } = params;

    // グループの存在確認
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // 管理者権限の確認
    const adminMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        role: 'admin',
      },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { error: 'Only admins can add members' },
        { status: 403 }
      );
    }

    // プランに基づくメンバー数チェック（グループ作成者のプランを参照）
    const plan = await getUserPlan(group.createdById);
    const limits = getLimits(plan);
    if (limits.maxMembersPerGroup !== Infinity) {
      const memberCount = await prisma.groupMember.count({ where: { groupId } });
      if (memberCount >= limits.maxMembersPerGroup) {
        return NextResponse.json(
          { error: `このグループのメンバーは最大${limits.maxMembersPerGroup}人までです（グループ作成者のプラン: ${plan}）`, code: 'MEMBER_LIMIT_REACHED', limit: limits.maxMembersPerGroup, plan },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const validatedData = addMemberSchema.parse(body);

    // メンバーを追加
    const member = await prisma.groupMember.create({
      data: {
        groupId,
        userId: validatedData.userId,
        role: validatedData.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// グループから退出
export async function DELETE(req: NextRequest, props: { params: Promise<{ groupId: string }> }) {
  const params = await props.params;
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

    const { groupId } = params;
    const { searchParams } = new URL(req.url);
    const userIdToRemove = searchParams.get('userId') || user.id;

    // 自分が退出する場合、または管理者が他のメンバーを削除する場合
    if (userIdToRemove !== user.id) {
      const adminMembership = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: user.id,
          role: 'admin',
        },
      });

      if (!adminMembership) {
        return NextResponse.json(
          { error: 'Only admins can remove other members' },
          { status: 403 }
        );
      }
    }

    // メンバーシップを削除
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: userIdToRemove,
          groupId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
