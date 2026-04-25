"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth/options";
import { prisma } from "@/shared/lib/db/prisma";
import { sendDMSchema, updateDMSchema } from "../schema/dm-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/utils/error-handler";

export async function sendDirectMessageAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "認証が必要です", code: "UNAUTHORIZED" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "ユーザーが見つかりません", code: "NOT_FOUND" };
    }

    const parsed = sendDMSchema.parse(data);

    // 自分自身にメッセージを送れないようにする
    if (parsed.receiverId === user.id) {
      return { success: false, error: "自分自身にメッセージを送ることはできません", code: "INVALID_REQUEST" };
    }

    // DirectMessageレコードを取得または作成（user1Id < user2Idの順序で保存）
    const [user1Id, user2Id] = [user.id, parsed.receiverId].sort();
    
    let directMessage = await prisma.directMessage.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
    });

    if (!directMessage) {
      directMessage = await prisma.directMessage.create({
        data: {
          user1Id,
          user2Id,
        },
      });
    }

    // メッセージを作成
    const message = await prisma.dMMessage.create({
      data: {
        content: parsed.content,
        type: parsed.type,
        senderId: user.id,
        directMessageId: directMessage.id,
        attachments: parsed.imageUrl
          ? {
              create: {
                type: "image",
                url: parsed.imageUrl,
                fileName: parsed.imageUrl.split("/").pop() || "image",
                fileSize: 0,
              },
            }
          : undefined,
      },
    });

    // DirectMessageのupdatedAtを更新
    await prisma.directMessage.update({
      where: { id: directMessage.id },
      data: { updatedAt: new Date() },
    });

    // 通知を作成
    await prisma.notification.create({
      data: {
        userId: parsed.receiverId,
        type: "message",
        title: "新しいメッセージ",
        content: `${user.name || user.email}さんからメッセージが届きました`,
      },
    });

    logger.info("Direct message sent", {
      userId: user.id,
      receiverId: parsed.receiverId,
      messageId: message.id,
    });

    revalidatePath("/chat");
    return { success: true, data: { id: message.id } };
  } catch (error) {
    const errorResult = handleActionError(error, { action: "sendDirectMessage" });
    if (!errorResult.success) {
      return errorResult;
    }
    // This should never happen, but TypeScript needs it
    return { success: false, error: "予期しないエラーが発生しました", code: "UNKNOWN_ERROR" };
  }
}

export async function updateDirectMessageAction(
  id: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "認証が必要です", code: "UNAUTHORIZED" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "ユーザーが見つかりません", code: "NOT_FOUND" };
    }

    // メッセージの所有者確認
    const message = await prisma.dMMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return { success: false, error: "メッセージが見つかりません", code: "NOT_FOUND" };
    }

    if (message.senderId !== user.id) {
      logger.warn("Unauthorized DM update attempt", {
        userId: user.id,
        messageId: id,
      });
      return { success: false, error: "権限がありません", code: "UNAUTHORIZED" };
    }

    const parsed = updateDMSchema.parse(data);

    await prisma.dMMessage.update({
      where: { id },
      data: parsed,
    });

    logger.info("Direct message updated", { userId: user.id, messageId: id });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "updateDirectMessage" });
  }
}

export async function deleteDirectMessageAction(
  id: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "認証が必要です", code: "UNAUTHORIZED" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "ユーザーが見つかりません", code: "NOT_FOUND" };
    }

    // メッセージの所有者確認
    const message = await prisma.dMMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return { success: false, error: "メッセージが見つかりません", code: "NOT_FOUND" };
    }

    if (message.senderId !== user.id) {
      logger.warn("Unauthorized DM deletion attempt", {
        userId: user.id,
        messageId: id,
      });
      return { success: false, error: "権限がありません", code: "UNAUTHORIZED" };
    }

    await prisma.dMMessage.update({
      where: { id },
      data: { isDeleted: true },
    });

    logger.info("Direct message deleted", { userId: user.id, messageId: id });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "deleteDirectMessage" });
  }
}

export async function markDMAsReadAction(
  directMessageId: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "認証が必要です", code: "UNAUTHORIZED" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "ユーザーが見つかりません", code: "NOT_FOUND" };
    }

    // DirectMessageの参加者確認
    const directMessage = await prisma.directMessage.findUnique({
      where: { id: directMessageId },
    });

    if (!directMessage) {
      return { success: false, error: "ダイレクトメッセージが見つかりません", code: "NOT_FOUND" };
    }

    if (directMessage.user1Id !== user.id && directMessage.user2Id !== user.id) {
      logger.warn("Unauthorized DM read attempt", {
        userId: user.id,
        directMessageId,
      });
      return { success: false, error: "権限がありません", code: "UNAUTHORIZED" };
    }

    // 未読メッセージを既読にする
    const unreadMessages = await prisma.dMMessage.findMany({
      where: {
        directMessageId,
        senderId: { not: user.id },
        reads: {
          none: {
            userId: user.id,
          },
        },
      },
    });

    // 既読レコードを作成
    for (const msg of unreadMessages) {
      await prisma.dMMessageRead.create({
        data: {
          dmMessageId: msg.id,
          userId: user.id,
        },
      }).catch(() => {
        // 既に存在する場合は無視
      });
    }

    logger.info("DM marked as read", { userId: user.id, directMessageId });
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "markDMAsRead" });
  }
}
