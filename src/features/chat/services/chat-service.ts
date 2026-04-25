import "server-only";

import { prisma } from "@/shared/lib/db/prisma";
import {
  getPusherServer,
  pusherChannels,
  pusherEvents,
} from "@/lib/pusher/server";

/**
 * Unified messaging service. Hides the DB split between
 * `Message` (group) and `DMMessage` (direct) behind a single API.
 *
 * Routing/UI layers should consume this and not touch the
 * underlying tables directly.
 */

export type Channel =
  | { kind: "group"; groupId: string }
  | { kind: "dm"; dmId: string };

export type ChannelKind = Channel["kind"];

export interface UnifiedSender {
  id: string;
  name: string | null;
  email?: string | null;
  image: string | null;
}

export interface UnifiedAttachment {
  id: string;
  type: string;
  url: string;
  fileName: string;
  fileSize: number;
}

export interface UnifiedRead {
  user: { id: string; name: string | null; image: string | null };
  readAt: Date;
}

export interface UnifiedMessage {
  id: string;
  content: string;
  type: string;
  senderId: string;
  sender: UnifiedSender;
  channel: Channel;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  attachments: UnifiedAttachment[];
  reads: UnifiedRead[];
}

class AccessDeniedError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

/**
 * True if either direction of the relationship between `userAId` and
 * `userBId` is `blocked`. Used to prevent message flow through existing
 * DMs after a user blocks the other party.
 */
export async function isBlockedBetween(
  userAId: string,
  userBId: string
): Promise<boolean> {
  const row = await prisma.userFriend.findFirst({
    where: {
      status: "blocked",
      OR: [
        { userId: userAId, friendId: userBId },
        { userId: userBId, friendId: userAId },
      ],
    },
    select: { id: true },
  });
  return !!row;
}

/**
 * Resolve a raw channel id (Group.id or DirectMessage.id) into a
 * typed Channel, after verifying the user can access it.
 *
 * Throws AccessDeniedError on not-found / forbidden.
 */
export async function resolveChannel(
  channelId: string,
  userId: string
): Promise<Channel> {
  // Try as Group first
  const group = await prisma.group.findUnique({
    where: { id: channelId },
    select: {
      id: true,
      members: { where: { userId }, select: { id: true } },
    },
  });

  if (group) {
    if (group.members.length === 0) {
      throw new AccessDeniedError(403, "Not a member of this group");
    }
    return { kind: "group", groupId: group.id };
  }

  // Then DirectMessage
  const dm = await prisma.directMessage.findUnique({
    where: { id: channelId },
    select: { id: true, user1Id: true, user2Id: true },
  });

  if (dm) {
    if (dm.user1Id !== userId && dm.user2Id !== userId) {
      throw new AccessDeniedError(403, "Not a participant of this DM");
    }
    const otherId = dm.user1Id === userId ? dm.user2Id : dm.user1Id;
    if (await isBlockedBetween(userId, otherId)) {
      throw new AccessDeniedError(403, "ブロック関係のためこのDMは利用できません");
    }
    return { kind: "dm", dmId: dm.id };
  }

  throw new AccessDeniedError(404, "Channel not found");
}

const senderSelect = {
  select: { id: true, name: true, email: true, image: true },
} as const;

const readsInclude = {
  include: {
    user: { select: { id: true, name: true, image: true } },
  },
} as const;

export interface ListOptions {
  limit?: number;
  offset?: number;
}

export async function listMessages(
  channel: Channel,
  options: ListOptions = {}
): Promise<UnifiedMessage[]> {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  if (channel.kind === "group") {
    const rows = await prisma.message.findMany({
      where: { groupId: channel.groupId, isDeleted: false },
      include: {
        sender: senderSelect,
        attachments: true,
        reads: readsInclude,
      },
      orderBy: { createdAt: "asc" },
      skip: offset,
      take: limit,
    });
    return rows.map((m) => ({
      id: m.id,
      content: m.content,
      type: m.type,
      senderId: m.senderId,
      sender: m.sender,
      channel,
      isDeleted: m.isDeleted,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      attachments: m.attachments,
      reads: m.reads.map((r) => ({ user: r.user, readAt: r.readAt })),
    }));
  }

  const rows = await prisma.dMMessage.findMany({
    where: { directMessageId: channel.dmId, isDeleted: false },
    include: {
      sender: senderSelect,
      attachments: true,
      reads: readsInclude,
    },
    orderBy: { createdAt: "asc" },
    skip: offset,
    take: limit,
  });
  return rows.map((m) => ({
    id: m.id,
    content: m.content,
    type: m.type,
    senderId: m.senderId,
    sender: m.sender,
    channel,
    isDeleted: m.isDeleted,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    attachments: m.attachments.map((a) => ({
      id: a.id,
      type: a.type,
      url: a.url,
      fileName: a.fileName,
      fileSize: a.fileSize,
    })),
    reads: m.reads.map((r) => ({ user: r.user, readAt: r.readAt })),
  }));
}

export interface SendPayload {
  content: string;
  type?: "text" | "image" | "file";
  imageUrl?: string;
}

export async function sendMessage(
  channel: Channel,
  userId: string,
  payload: SendPayload
): Promise<UnifiedMessage> {
  // Defense-in-depth: even if resolveChannel was bypassed, re-check blocked status
  // on DM sends so the blocked party cannot deliver messages through an existing DM.
  if (channel.kind === "dm") {
    const dm = await prisma.directMessage.findUnique({
      where: { id: channel.dmId },
      select: { user1Id: true, user2Id: true },
    });
    if (!dm) {
      throw new AccessDeniedError(404, "DM not found");
    }
    const otherId = dm.user1Id === userId ? dm.user2Id : dm.user1Id;
    if (await isBlockedBetween(userId, otherId)) {
      throw new AccessDeniedError(403, "ブロック関係のためメッセージを送信できません");
    }
  }

  const type = payload.type ?? "text";
  const attachmentCreate = payload.imageUrl
    ? {
        create: {
          type: "image",
          url: payload.imageUrl,
          fileName: payload.imageUrl.split("/").pop() || "image",
          fileSize: 0,
        },
      }
    : undefined;

  let unified: UnifiedMessage;

  if (channel.kind === "group") {
    const created = await prisma.message.create({
      data: {
        content: payload.content,
        type,
        senderId: userId,
        groupId: channel.groupId,
        attachments: attachmentCreate,
      },
      include: {
        sender: senderSelect,
        attachments: true,
      },
    });
    unified = {
      id: created.id,
      content: created.content,
      type: created.type,
      senderId: created.senderId,
      sender: created.sender,
      channel,
      isDeleted: created.isDeleted,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      attachments: created.attachments,
      reads: [],
    };
  } else {
    const created = await prisma.dMMessage.create({
      data: {
        content: payload.content,
        type,
        senderId: userId,
        directMessageId: channel.dmId,
        attachments: attachmentCreate,
      },
      include: {
        sender: senderSelect,
        attachments: true,
      },
    });
    await prisma.directMessage.update({
      where: { id: channel.dmId },
      data: { updatedAt: new Date() },
    });
    unified = {
      id: created.id,
      content: created.content,
      type: created.type,
      senderId: created.senderId,
      sender: created.sender,
      channel,
      isDeleted: created.isDeleted,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      attachments: created.attachments.map((a) => ({
        id: a.id,
        type: a.type,
        url: a.url,
        fileName: a.fileName,
        fileSize: a.fileSize,
      })),
      reads: [],
    };
  }

  // Unified Pusher notification on the unified channel name
  const pusher = getPusherServer();
  if (pusher) {
    await pusher
      .trigger(
        pusherChannels.chat(channelIdOf(channel)),
        pusherEvents.messageCreated,
        unified
      )
      .catch((err) => {
        console.error("Pusher trigger (message:created) error:", err);
      });
  }

  return unified;
}

export interface MarkAsReadResult {
  messageIds: string[];
  readAt: Date;
}

/**
 * Mark all messages in `channel` not yet read by `userId` (and not sent
 * by `userId`) as read. Emits a Pusher event so the sender can update UI.
 */
export async function markAsRead(
  channel: Channel,
  userId: string,
  userInfo: { name: string | null; image: string | null }
): Promise<MarkAsReadResult> {
  const readAt = new Date();
  let unreadIds: string[] = [];

  if (channel.kind === "group") {
    const unread = await prisma.message.findMany({
      where: {
        groupId: channel.groupId,
        senderId: { not: userId },
        isDeleted: false,
        reads: { none: { userId } },
      },
      select: { id: true },
    });
    unreadIds = unread.map((m) => m.id);

    if (unreadIds.length > 0) {
      await prisma.messageRead.createMany({
        data: unreadIds.map((messageId) => ({
          messageId,
          userId,
          readAt,
        })),
      });
    }
  } else {
    const unread = await prisma.dMMessage.findMany({
      where: {
        directMessageId: channel.dmId,
        senderId: { not: userId },
        isDeleted: false,
        reads: { none: { userId } },
      },
      select: { id: true },
    });
    unreadIds = unread.map((m) => m.id);

    if (unreadIds.length > 0) {
      await prisma.dMMessageRead.createMany({
        data: unreadIds.map((messageId) => ({
          dmMessageId: messageId,
          userId,
          readAt,
        })),
      });
    }
  }

  if (unreadIds.length > 0) {
    const pusher = getPusherServer();
    if (pusher) {
      await pusher
        .trigger(
          pusherChannels.chat(channelIdOf(channel)),
          pusherEvents.messageRead,
          {
            messageIds: unreadIds,
            readerId: userId,
            reader: { id: userId, name: userInfo.name, image: userInfo.image },
            readAt,
          }
        )
        .catch((err) => {
          console.error("Pusher trigger (message:read) error:", err);
        });
    }
  }

  return { messageIds: unreadIds, readAt };
}

export async function getUnreadCount(
  channel: Channel,
  userId: string
): Promise<number> {
  if (channel.kind === "group") {
    return prisma.message.count({
      where: {
        groupId: channel.groupId,
        senderId: { not: userId },
        isDeleted: false,
        reads: { none: { userId } },
      },
    });
  }
  return prisma.dMMessage.count({
    where: {
      directMessageId: channel.dmId,
      senderId: { not: userId },
      isDeleted: false,
      reads: { none: { userId } },
    },
  });
}

export function channelIdOf(channel: Channel): string {
  return channel.kind === "group" ? channel.groupId : channel.dmId;
}

export { AccessDeniedError };
