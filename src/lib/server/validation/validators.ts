import { prisma } from "@/shared/lib/db/prisma";
import { ApiResult, success, failure, notFound } from "@/lib/errors/api-error";
import { ErrorCodes } from "@/lib/errors/error-codes";
import { User, Group, Message } from "@prisma/client";

/**
 * 自己操作チェック
 * 自分自身に対する操作（フレンドリクエスト等）を防止
 */
export function validateNotSelfOperation(
  currentUserId: string,
  targetUserId: string,
  message = "自分自身を操作することはできません"
): ApiResult | null {
  if (currentUserId === targetUserId) {
    return failure(ErrorCodes.FORBIDDEN, message);
  }
  return null;
}

/**
 * ユーザーの存在確認
 */
export async function findUserOrFail(
  userId: string,
  message = "ユーザー"
): Promise<ApiResult<User>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return notFound(message);
  }

  return success(user);
}

/**
 * グループの存在確認
 */
export async function findGroupOrFail(
  groupId: string,
  message = "グループ"
): Promise<ApiResult<Group>> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    return notFound(message);
  }

  return success(group);
}

/**
 * メッセージの所有者チェック
 * IDOR対策：メッセージの送信者であることを確認
 */
export async function validateMessageOwnership(
  messageId: string,
  userId: string,
  message = "このメッセージを操作する権限がありません"
): Promise<ApiResult<Message>> {
  const msg = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!msg) {
    return notFound("メッセージ");
  }

  if (msg.senderId !== userId) {
    return failure(ErrorCodes.FORBIDDEN, message);
  }

  return success(msg);
}

/**
 * 結果がエラーかどうかを判定する型ガード
 */
export function isError<T>(
  result: ApiResult<T>
): result is ApiResult<T> & { success: false } {
  return !result.success;
}
