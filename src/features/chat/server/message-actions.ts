"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth/options";
import { prisma } from "@/shared/lib/db/prisma";
import { createMessageSchema, updateMessageSchema } from "../schema/message-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createMessageAction(
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

  const parsed = createMessageSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // グループメッセージの場合、メンバーシップを確認
  if (parsed.data.groupId) {
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: parsed.data.groupId,
        },
      },
    });

    if (!membership) {
      logger.warn("Unauthorized group message attempt", {
        userId: user.id,
        groupId: parsed.data.groupId,
        action: "create_message",
        reason: "not_member",
      });
      return { success: false, error: "このグループのメンバーではありません" };
    }
  }

  try {
    const message = await prisma.message.create({
      data: {
        content: parsed.data.content,
        type: parsed.data.type,
        senderId: user.id,
        groupId: parsed.data.groupId || null,
        attachments: parsed.data.imageUrl
          ? {
              create: {
                type: "image",
                url: parsed.data.imageUrl,
                fileName: parsed.data.imageUrl.split("/").pop() || "image",
                fileSize: 0,
              },
            }
          : undefined,
      },
    });

    logger.info("Message created successfully", {
      userId: user.id,
      messageId: message.id,
      groupId: parsed.data.groupId,
    });

    revalidatePath("/chat");
    return { success: true, data: { id: message.id } };
  } catch (error) {
    logger.error("Error creating message", { err: error, userId: user.id });
    return { success: false, error: "メッセージの作成に失敗しました" };
  }
}

export async function updateMessageAction(
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

  // IDOR 対策: 所有者確認
  const message = await prisma.message.findUnique({
    where: { id },
    select: { senderId: true },
  });

  if (!message) {
    return { success: false, error: "メッセージが見つかりません" };
  }

  if (message.senderId !== user.id) {
    logger.warn("Unauthorized message update attempt", {
      userId: user.id,
      messageId: id,
      action: "update_message",
      reason: "not_owner",
    });
    return { success: false, error: "権限がありません" };
  }

  const parsed = updateMessageSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.message.update({
      where: { id },
      data: parsed.data,
    });

    logger.info("Message updated", { userId: user.id, messageId: id });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    logger.error("Error updating message", { err: error, userId: user.id, messageId: id });
    return { success: false, error: "メッセージの更新に失敗しました" };
  }
}

export async function deleteMessageAction(
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

  // IDOR 対策: 所有者確認
  const message = await prisma.message.findUnique({
    where: { id },
    select: { senderId: true },
  });

  if (!message) {
    return { success: false, error: "メッセージが見つかりません" };
  }

  if (message.senderId !== user.id) {
    logger.warn("Unauthorized message deletion attempt", {
      userId: user.id,
      messageId: id,
      action: "delete_message",
      reason: "not_owner",
    });
    return { success: false, error: "権限がありません" };
  }

  try {
    await prisma.message.update({
      where: { id },
      data: { isDeleted: true },
    });

    logger.info("Message deleted", { userId: user.id, messageId: id });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    logger.error("Error deleting message", { err: error, userId: user.id, messageId: id });
    return { success: false, error: "メッセージの削除に失敗しました" };
  }
}
