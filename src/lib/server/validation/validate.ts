import { z } from "zod";
import { failure, FailureResponse } from "@/lib/errors/api-error";
import { ErrorCodes } from "@/lib/errors/error-codes";

/**
 * Zodスキーマでバリデーションを行い、失敗時はFailureResponseを返す
 */
export function validateInput<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  defaultMessage = "入力が不正です"
): z.infer<T> | FailureResponse {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return failure(
      ErrorCodes.VALIDATION_ERROR,
      parsed.error.issues[0]?.message || defaultMessage
    );
  }
  return parsed.data;
}

/**
 * バリデーション結果がエラーかどうかを判定する型ガード
 */
export function isValidationError<T>(
  result: T | FailureResponse
): result is FailureResponse {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    result.success === false
  );
}
