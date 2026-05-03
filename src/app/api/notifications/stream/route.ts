import { NextRequest } from "next/server";
import { notificationEmitter, NotificationData } from "@/lib/events/notification-emitter";
import { auth } from "@/shared/lib/auth/options";
export const dynamic = 'force-dynamic';

/**
 * SSE (Server-Sent Events) エンドポイント
 * リアルタイム通知をクライアントにストリーミング
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 通知イベントのリスナー
      const onNotification = (notification: NotificationData) => {
        const data = `data: ${JSON.stringify(notification)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // 未読数更新イベントのリスナー
      const onUnreadCount = (count: number) => {
        const data = `data: ${JSON.stringify({ type: "unread-count", count })}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      notificationEmitter.on(`notification:${userId}`, onNotification);
      notificationEmitter.on(`unread-count:${userId}`, onUnreadCount);

      // ハートビート（30秒ごと）
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // 接続確認メッセージ
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

      // クリーンアップ
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        notificationEmitter.off(`notification:${userId}`, onNotification);
        notificationEmitter.off(`unread-count:${userId}`, onUnreadCount);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
