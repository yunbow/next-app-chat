"use server";

import { prisma } from "@/shared/lib/db/prisma";
import { markAsReadSchema } from "../schema/notification-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/utils/error-handler";
import { auth } from "@/shared/lib/auth/options";

export async function markNotificationAsReadAction(
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

    const parsed = markAsReadSchema.parse(data);

    // 通知の所有者確認
    const notification = await prisma.notification.findUnique({
      where: { id: parsed.notificationId },
    });

    if (!notification) {
      return { success: false, error: "通知が見つかりません", code: "NOT_FOUND" };
    }

    if (notification.userId !== user.id) {
      logger.warn({
        userId: user.id,
        notificationId: parsed.notificationId,
      }, "Unauthorized notification access");
      return { success: false, error: "権限がありません", code: "UNAUTHORIZED" };
    }

    await prisma.notification.update({
      where: { id: parsed.notificationId },
      data: { isRead: true },
    });

    logger.info({ userId: user.id, notificationId: parsed.notificationId }, "Notification marked as read");
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "markNotificationAsRead" });
  }
}

export async function markAllNotificationsAsReadAction(): Promise<ActionResult> {
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

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    logger.info({ userId: user.id }, "All notifications marked as read");
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "markAllNotificationsAsRead" });
  }
}

export async function deleteNotificationAction(
  notificationId: string
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

    // 通知の所有者確認
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: "通知が見つかりません", code: "NOT_FOUND" };
    }

    if (notification.userId !== user.id) {
      logger.warn({
        userId: user.id,
        notificationId,
      }, "Unauthorized notification deletion");
      return { success: false, error: "権限がありません", code: "UNAUTHORIZED" };
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    logger.info({ userId: user.id, notificationId }, "Notification deleted");
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "deleteNotification" });
  }
}
