import { prisma } from "@/shared/lib/db/prisma";

/**
 * 認可チェック関数群
 * IDOR (Insecure Direct Object Reference) 対策
 */

/**
 * グループメンバーかどうかをチェック
 */
export async function isGroupMember(
  userId: string,
  groupId: string
): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  return !!member;
}

/**
 * グループ管理者かどうかをチェック
 */
export async function isGroupAdmin(
  userId: string,
  groupId: string
): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { role: true },
  });
  return member?.role === "admin";
}

/**
 * メッセージの送信者かどうかをチェック
 */
export async function isMessageSender(
  userId: string,
  messageId: string
): Promise<boolean> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true },
  });
  return message?.senderId === userId;
}

/**
 * DMの参加者かどうかをチェック
 */
export async function isDMParticipant(
  userId: string,
  directMessageId: string
): Promise<boolean> {
  const dm = await prisma.directMessage.findUnique({
    where: { id: directMessageId },
    select: { user1Id: true, user2Id: true },
  });

  if (!dm) return false;
  return dm.user1Id === userId || dm.user2Id === userId;
}

/**
 * 通知の受信者かどうかをチェック
 */
export async function canDeleteNotification(
  userId: string,
  notificationId: string
): Promise<boolean> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification) return false;
  return notification.userId === userId;
}
