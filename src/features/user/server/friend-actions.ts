"use server";

import { prisma } from "@/shared/lib/db/prisma";
import { sendFriendRequestSchema, respondFriendRequestSchema } from "../schema/user-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/utils/error-handler";
import { auth } from "@/shared/lib/auth/options";

export async function sendFriendRequestAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "認証が必要です", code: "UNAUTHORIZED" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "ユーザーが見つかりません", code: "NOT_FOUND" };
    }

    const parsed = sendFriendRequestSchema.parse(data);

    // 自分自身にリクエストを送れないようにする
    if (parsed.friendId === user.id) {
      return { success: false, error: "自分自身にフレンドリクエストを送ることはできません", code: "INVALID_REQUEST" };
    }

    // 既存のリクエストをチェック
    const existingRequest = await prisma.userFriend.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: parsed.friendId },
          { userId: parsed.friendId, friendId: user.id },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        return { success: false, error: "既にフレンドです", code: "ALREADY_FRIENDS" };
      }
      return { success: false, error: "既にリクエストが存在します", code: "REQUEST_EXISTS" };
    }

    const friendRequest = await prisma.userFriend.create({
      data: {
        userId: user.id,
        friendId: parsed.friendId,
        status: "pending",
      },
    });

    // 通知を作成
    await prisma.notification.create({
      data: {
        userId: parsed.friendId,
        type: "friend_request",
        title: "フレンドリクエスト",
        content: `${user.name || user.email}さんからフレンドリクエストが届きました`,
      },
    });

    logger.info({ userId: user.id, friendId: parsed.friendId }, "Friend request sent");
    revalidatePath("/friends");
    return { success: true, data: { id: friendRequest.id } };
  } catch (error) {
    const errorResult = handleActionError(error, { action: "sendFriendRequest" });
    if (!errorResult.success) {
      return errorResult;
    }
    // This should never happen, but TypeScript needs it
    return { success: false, error: "予期しないエラーが発生しました", code: "UNKNOWN_ERROR" };
  }
}

export async function respondFriendRequestAction(
  data: unknown
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "認証が必要です", code: "UNAUTHORIZED" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "ユーザーが見つかりません", code: "NOT_FOUND" };
    }

    const parsed = respondFriendRequestSchema.parse(data);

    const friendRequest = await prisma.userFriend.findUnique({
      where: { id: parsed.requestId },
      include: { user: true },
    });

    if (!friendRequest) {
      return { success: false, error: "リクエストが見つかりません", code: "NOT_FOUND" };
    }

    // リクエストの受信者であることを確認
    if (friendRequest.friendId !== user.id) {
      logger.warn({
        userId: user.id,
        requestId: parsed.requestId,
      }, "Unauthorized friend request response");
      return { success: false, error: "権限がありません", code: "UNAUTHORIZED" };
    }

    if (parsed.action === "accept") {
      await prisma.userFriend.update({
        where: { id: parsed.requestId },
        data: { status: "accepted" },
      });

      // 通知を作成
      await prisma.notification.create({
        data: {
          userId: friendRequest.userId,
          type: "friend_request",
          title: "フレンドリクエスト承認",
          content: `${user.name || user.email}さんがフレンドリクエストを承認しました`,
        },
      });

      logger.info({ userId: user.id, requestId: parsed.requestId }, "Friend request accepted");
    } else {
      await prisma.userFriend.delete({
        where: { id: parsed.requestId },
      });

      logger.info({ userId: user.id, requestId: parsed.requestId }, "Friend request rejected");
    }

    revalidatePath("/friends");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "respondFriendRequest" });
  }
}

export async function removeFriendAction(
  friendId: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "認証が必要です", code: "UNAUTHORIZED" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "ユーザーが見つかりません", code: "NOT_FOUND" };
    }

    // フレンド関係を削除
    await prisma.userFriend.deleteMany({
      where: {
        OR: [
          { userId: user.id, friendId, status: "accepted" },
          { userId: friendId, friendId: user.id, status: "accepted" },
        ],
      },
    });

    logger.info({ userId: user.id, friendId }, "Friend removed");
    revalidatePath("/friends");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "removeFriend" });
  }
}
