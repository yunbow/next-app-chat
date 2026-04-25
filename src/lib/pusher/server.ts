import Pusher from "pusher";

let pusherInstance: Pusher | null = null;

/**
 * サーバーサイドPusherインスタンスを取得
 * 環境変数が未設定の場合はnullを返す
 */
export function getPusherServer(): Pusher | null {
  if (pusherInstance) return pusherInstance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  pusherInstance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherInstance;
}

/**
 * Pusherチャンネル名のヘルパー
 */
export const pusherChannels = {
  group: (groupId: string) => `group-${groupId}`,
  dm: (dmId: string) => `dm-${dmId}`,
  user: (userId: string) => `user-${userId}`,
  /** Unified channel name used by chat-service. Pass Group.id or DirectMessage.id directly. */
  chat: (channelId: string) => `chat-${channelId}`,
} as const;

/**
 * Pusherイベント名
 */
export const pusherEvents = {
  messageCreated: "message:created",
  messageDeleted: "message:deleted",
  messageRead: "message:read",
  typing: "client-typing",
} as const;
