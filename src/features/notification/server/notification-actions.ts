"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth/options";
import { prisma } from "@/shared/lib/db/prisma";
import { markAsReadSchema } from "../schema/notification-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/utils/error-handler";

export async function markNotificationAsReadAction(
  data: unknown
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
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
      logger.warn("Unauthorized notification access", {
        userId: user.id,
        notificationId: parsed.notificationId,
      });
      return { success: false, error: "権限がありません", code: "UNAUTHORIZED" };
    }

    await prisma.notification.update({
      where: { id: parsed.notificationId },
      data: { isRead: true },
    });

    logger.info("Notification marked as read", { userId: user.id, notificationId: parsed.notificationId });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "markNotificationAsRead" });
  }
}

export async function markAllNotificationsAsReadAction(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
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

    logger.info("All notifications marked as read", { userId: user.id });
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
    const session = await getServerSession(authOptions);
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
      logger.warn("Unauthorized notification deletion", {
        userId: user.id,
        notificationId,
      });
      return { success: false, error: "権限がありません", code: "UNAUTHORIZED" };
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    logger.info("Notification deleted", { userId: user.id, notificationId });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "deleteNotification" });
  }
}
