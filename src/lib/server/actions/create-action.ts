import { z } from "zod";
import { ApiResult } from "@/lib/errors/api-error";
import { requireAuth, isAuthError } from "../auth/require-auth";
import { validateInput, isValidationError } from "../validation/validate";
import { checkActionRateLimit, RATE_LIMITS } from "../rate-limit";

/**
 * 認証済みアクションのコンテキスト
 */
export type AuthContext = {
  userId: string;
};

/**
 * アクションの設定オプション
 */
export type ActionOptions = {
  rateLimit?: keyof typeof RATE_LIMITS;
  rateLimitMessage?: string;
};

/**
 * 認証済みアクションを作成
 */
export function createAuthAction<TResult>(
  handler: (ctx: AuthContext) => Promise<ApiResult<TResult>>,
  options?: ActionOptions
): () => Promise<ApiResult<TResult>> {
  return async () => {
    const session = await requireAuth();
    if (isAuthError(session)) {
      return session;
    }

    if (options?.rateLimit) {
      const rateLimitError = await checkActionRateLimit(
        options.rateLimit,
        session.user.id,
        options.rateLimitMessage
      );
      if (rateLimitError !== null) {
        return rateLimitError;
      }
    }

    return handler({ userId: session.user.id });
  };
}

/**
 * 認証済み + バリデーション付きアクションを作成
 */
export function createAuthActionWithValidation<TSchema extends z.ZodType, TResult>(
  schema: TSchema,
  handler: (ctx: AuthContext, data: z.infer<TSchema>) => Promise<ApiResult<TResult>>,
  options?: ActionOptions
): (input: z.infer<TSchema>) => Promise<ApiResult<TResult>> {
  return async (input: z.infer<TSchema>) => {
    const session = await requireAuth();
    if (isAuthError(session)) {
      return session;
    }

    if (options?.rateLimit) {
      const rateLimitError = await checkActionRateLimit(
        options.rateLimit,
        session.user.id,
        options.rateLimitMessage
      );
      if (rateLimitError !== null) {
        return rateLimitError;
      }
    }

    const parsed = validateInput(schema, input);
    if (isValidationError(parsed)) {
      return parsed;
    }

    return handler({ userId: session.user.id }, parsed);
  };
}

/**
 * 認証済み + FormDataバリデーション付きアクションを作成
 */
export function createAuthActionWithFormValidation<TSchema extends z.ZodType, TResult>(
  schema: TSchema,
  extractor: (formData: FormData) => Record<string, unknown>,
  handler: (ctx: AuthContext, data: z.infer<TSchema>) => Promise<ApiResult<TResult>>,
  options?: ActionOptions
): (formData: FormData) => Promise<ApiResult<TResult>> {
  return async (formData: FormData) => {
    const session = await requireAuth();
    if (isAuthError(session)) {
      return session;
    }

    if (options?.rateLimit) {
      const rateLimitError = await checkActionRateLimit(
        options.rateLimit,
        session.user.id,
        options.rateLimitMessage
      );
      if (rateLimitError !== null) {
        return rateLimitError;
      }
    }

    const rawData = extractor(formData);
    const parsed = validateInput(schema, rawData);
    if (isValidationError(parsed)) {
      return parsed;
    }

    return handler({ userId: session.user.id }, parsed);
  };
}
