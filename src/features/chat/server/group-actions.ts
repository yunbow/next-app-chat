"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth/options";
import { prisma } from "@/shared/lib/db/prisma";
import { createGroupSchema, updateGroupSchema } from "../schema/message-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createGroupAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "認証が必要です" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, error: "ユーザーが見つかりません" };
  }

  const parsed = createGroupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const group = await prisma.group.create({
      data: {
        ...parsed.data,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: "admin",
          },
        },
      },
    });

    logger.info("Group created successfully", {
      userId: user.id,
      groupId: group.id,
    });

    revalidatePath("/chat");
    return { success: true, data: { id: group.id } };
  } catch (error) {
    logger.error("Error creating group", { err: error, userId: user.id });
    return { success: false, error: "グループの作成に失敗しました" };
  }
}

export async function updateGroupAction(
  id: string,
  data: unknown
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "認証が必要です" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, error: "ユーザーが見つかりません" };
  }

  // 管理者権限確認
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: id,
      },
    },
  });

  if (!membership || membership.role !== "admin") {
    logger.warn("Unauthorized group update attempt", {
      userId: user.id,
      groupId: id,
      action: "update_group",
      reason: "not_admin",
    });
    return { success: false, error: "管理者権限が必要です" };
  }

  const parsed = updateGroupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.group.update({
      where: { id },
      data: parsed.data,
    });

    logger.info("Group updated", { userId: user.id, groupId: id });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    logger.error("Error updating group", { err: error, userId: user.id, groupId: id });
    return { success: false, error: "グループの更新に失敗しました" };
  }
}

export async function deleteGroupAction(
  id: string
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "認証が必要です" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, error: "ユーザーが見つかりません" };
  }

  // 作成者確認
  const group = await prisma.group.findUnique({
    where: { id },
    select: { createdById: true },
  });

  if (!group) {
    return { success: false, error: "グループが見つかりません" };
  }

  if (group.createdById !== user.id) {
    logger.warn("Unauthorized group deletion attempt", {
      userId: user.id,
      groupId: id,
      action: "delete_group",
      reason: "not_creator",
    });
    return { success: false, error: "グループの作成者のみ削除できます" };
  }

  try {
    await prisma.group.delete({
      where: { id },
    });

    logger.info("Group deleted", { userId: user.id, groupId: id });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    logger.error("Error deleting group", { err: error, userId: user.id, groupId: id });
    return { success: false, error: "グループの削除に失敗しました" };
  }
}

export async function addGroupMemberAction(
  groupId: string,
  userId: string
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "認証が必要です" };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) {
    return { success: false, error: "ユーザーが見つかりません" };
  }

  // 管理者権限確認
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: currentUser.id,
        groupId,
      },
    },
  });

  if (!membership || membership.role !== "admin") {
    logger.warn("Unauthorized add member attempt", {
      userId: currentUser.id,
      groupId,
      action: "add_member",
      reason: "not_admin",
    });
    return { success: false, error: "管理者権限が必要です" };
  }

  try {
    await prisma.groupMember.create({
      data: {
        userId,
        groupId,
        role: "member",
      },
    });

    logger.info("Member added to group", {
      userId: currentUser.id,
      groupId,
      newMemberId: userId,
    });

    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    logger.error("Error adding member", {
      err: error,
      userId: currentUser.id,
      groupId,
      newMemberId: userId,
    });
    return { success: false, error: "メンバーの追加に失敗しました" };
  }
}
