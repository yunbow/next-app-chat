import { prisma } from "@/shared/lib/db/prisma";
import { notFound, forbidden, FailureResponse } from "@/lib/errors/api-error";

/**
 * IDOR（Insecure Direct Object Reference）対策用のバリデーション関数
 */

/**
 * グループメンバーシップの所有者チェック
 */
export async function validateGroupMembership(
  groupId: string,
  userId: string
): Promise<{ groupId: string; userId: string } | FailureResponse> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true },
  });

  if (!group) {
    return notFound("グループ");
  }

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });

  if (!member) {
    return forbidden("このグループのメンバーではありません");
  }

  return { groupId, userId };
}

/**
 * メッセージの送信者チェック
 */
export async function validateMessageOwnership(
  messageId: string,
  userId: string
): Promise<{ id: string; senderId: string } | FailureResponse> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true },
  });

  if (!message) {
    return notFound("メッセージ");
  }

  if (message.senderId !== userId) {
    return forbidden("このメッセージを操作する権限がありません");
  }

  return message;
}

/**
 * DMの参加者チェック
 */
export async function validateDMAccess(
  directMessageId: string,
  userId: string
): Promise<{ id: string; user1Id: string; user2Id: string } | FailureResponse> {
  const dm = await prisma.directMessage.findUnique({
    where: { id: directMessageId },
    select: { id: true, user1Id: true, user2Id: true },
  });

  if (!dm) {
    return notFound("ダイレクトメッセージ");
  }

  if (dm.user1Id !== userId && dm.user2Id !== userId) {
    return forbidden("このダイレクトメッセージにアクセスする権限がありません");
  }

  return dm;
}

/**
 * 通知の所有者チェック
 */
export async function validateNotificationOwnership(
  notificationId: string,
  userId: string
): Promise<{ id: string; userId: string } | FailureResponse> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true },
  });

  if (!notification) {
    return notFound("通知");
  }

  if (notification.userId !== userId) {
    return forbidden("この通知にアクセスする権限がありません");
  }

  return notification;
}

/**
 * フレンドリクエストのチェック
 */
export async function validateFriendRequestAccess(
  friendRequestId: string,
  userId: string
): Promise<{ id: string; userId: string; friendId: string } | FailureResponse> {
  const request = await prisma.userFriend.findUnique({
    where: { id: friendRequestId },
    select: { id: true, userId: true, friendId: true },
  });

  if (!request) {
    return notFound("フレンドリクエスト");
  }

  if (request.userId !== userId && request.friendId !== userId) {
    return forbidden("このフレンドリクエストにアクセスする権限がありません");
  }

  return request;
}

/**
 * 型ガード: バリデーション結果がエラーかどうかを判定
 */
export function isValidationError<T>(
  result: T | FailureResponse
): result is FailureResponse {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    result.success === false
  );
}
