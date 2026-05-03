import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";

/**
 * Server Actionsで発生したエラーを統一的に処理する
 */
export function handleActionError(
  error: unknown,
  context?: Record<string, unknown>
): ActionResult {
  // Zodバリデーションエラー
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    logger.warn({
      issues: error.issues,
      ...context,
    }, "Validation error");
    return {
      success: false,
      error: firstIssue.message,
      code: "VALIDATION_ERROR",
      field: firstIssue.path.join("."),
    };
  }

  // Prismaエラー
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error({
      code: error.code,
      meta: error.meta,
      ...context,
    }, "Prisma error");

    // 一意制約違反
    if (error.code === "P2002") {
      return {
        success: false,
        error: "このデータは既に存在します",
        code: "UNIQUE_CONSTRAINT",
      };
    }

    // 外部キー制約違反
    if (error.code === "P2003") {
      return {
        success: false,
        error: "関連するデータが見つかりません",
        code: "FOREIGN_KEY_CONSTRAINT",
      };
    }

    // レコードが見つからない
    if (error.code === "P2025") {
      return {
        success: false,
        error: "データが見つかりません",
        code: "NOT_FOUND",
      };
    }

    return {
      success: false,
      error: "データベースエラーが発生しました",
      code: "DATABASE_ERROR",
    };
  }

  // 一般的なエラー
  if (error instanceof Error) {
    logger.error({
      message: error.message,
      stack: error.stack,
      ...context,
    }, "Action error");
    return {
      success: false,
      error: error.message || "エラーが発生しました",
      code: "INTERNAL_ERROR",
    };
  }

  // 不明なエラー
  logger.error({ error, ...context }, "Unknown error");
  return {
    success: false,
    error: "予期しないエラーが発生しました",
    code: "UNKNOWN_ERROR",
  };
}
