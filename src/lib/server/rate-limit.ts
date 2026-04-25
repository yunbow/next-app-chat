import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { rateLimitExceeded, FailureResponse } from "@/lib/errors/api-error";
import { logger } from "@/lib/logger";

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

/**
 * レートリミットチェックを行い、超過時はFailureResponseを返す
 */
export async function checkActionRateLimit(
  actionName: keyof typeof RATE_LIMITS,
  userId: string,
  errorMessage = "操作が多すぎます。しばらくしてからもう一度お試しください。"
): Promise<FailureResponse | null> {
  const config = RATE_LIMITS[actionName] as RateLimitConfig;
  if (!config) {
    logger.error({ actionName }, `Unknown rate limit action: ${actionName}`);
    return null;
  }

  const rateLimitResult = await checkRateLimit(
    `${actionName}:${userId}`,
    config.limit,
    config.windowMs
  );

  if (!rateLimitResult.success) {
    logger.warn(
      {
        userId,
        actionName,
        resetAt: new Date(rateLimitResult.resetAt),
      },
      `Rate limit exceeded for ${actionName}: ${userId}`
    );
    return rateLimitExceeded(errorMessage);
  }

  return null;
}

/**
 * レートリミット結果がエラーかどうかを判定する型ガード
 */
export function isRateLimitError(
  result: FailureResponse | null
): result is FailureResponse {
  return result !== null;
}

export { RATE_LIMITS };
