/**
 * バックグラウンドジョブ: 古い通知の削除
 */

import { prisma } from "@/shared/lib/db/prisma";
import { logger } from "@/lib/logger";

/**
 * 古い通知を削除するジョブ
 * 30日以上前の既読通知を削除
 */
export async function cleanupNotificationsJob(): Promise<void> {
  try {
    logger.info("Starting notification cleanup job");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        isRead: true,
      },
    });

    logger.info(`Notification cleanup job completed: ${result.count} notifications deleted`);
  } catch (error) {
    logger.error({ err: error }, "Notification cleanup job failed");
    throw error;
  }
}

/**
 * 未読通知の古いものも削除（90日以上前）
 */
export async function cleanupOldUnreadNotifications(): Promise<void> {
  try {
    logger.info("Starting old unread notification cleanup job");

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    logger.info(`Old unread notification cleanup job completed: ${result.count} notifications deleted`);
  } catch (error) {
    logger.error({ err: error }, "Old unread notification cleanup job failed");
    throw error;
  }
}

/**
 * Vercel Cron Jobs用のエンドポイント
 */
export async function handleCronRequest(): Promise<Response> {
  try {
    await cleanupNotificationsJob();
    await cleanupOldUnreadNotifications();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error({ err: error }, "Cron job failed");
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
