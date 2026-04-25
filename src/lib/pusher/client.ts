import PusherClient from "pusher-js";

let pusherClientInstance: PusherClient | null = null;

/**
 * クライアントサイドPusherインスタンスを取得
 * 環境変数が未設定の場合はnullを返す
 */
export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") return null;
  if (pusherClientInstance) return pusherClientInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    return null;
  }

  pusherClientInstance = new PusherClient(key, {
    cluster,
  });

  return pusherClientInstance;
}
