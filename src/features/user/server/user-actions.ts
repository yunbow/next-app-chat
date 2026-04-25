"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth/options";
import { prisma } from "@/shared/lib/db/prisma";
import { updateProfileSchema, changePasswordSchema } from "../schema/user-schema";
import type { ActionResult } from "@/lib/types/action-result";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { handleActionError } from "@/lib/utils/error-handler";

export async function updateProfileAction(
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

    const parsed = updateProfileSchema.parse(data);

    await prisma.user.update({
      where: { id: user.id },
      data: parsed,
    });

    logger.info("Profile updated", { userId: user.id });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "updateProfile" });
  }
}

export async function changePasswordAction(
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

    if (!user || !user.password) {
      return { success: false, error: "パスワード認証のユーザーではありません", code: "INVALID_AUTH_METHOD" };
    }

    const parsed = changePasswordSchema.parse(data);

    // 現在のパスワードを確認
    const isPasswordValid = await bcrypt.compare(parsed.currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "現在のパスワードが正しくありません", code: "INVALID_PASSWORD" };
    }

    // 新しいパスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(parsed.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logger.info("Password changed", { userId: user.id });
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "changePassword" });
  }
}

export async function updateUserStatusAction(
  status: "online" | "offline" | "away"
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status,
        lastSeenAt: new Date(),
      },
    });

    logger.info("User status updated", { userId: user.id, status });
    return { success: true };
  } catch (error) {
    return handleActionError(error, { action: "updateUserStatus" });
  }
}
