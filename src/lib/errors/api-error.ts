import { ErrorCode, ErrorCodes, ErrorStatusCodes } from "./error-codes";

/**
 * 構造化エラーレスポンス
 */
export type ErrorResponse = {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

/**
 * 成功レスポンス
 */
export type SuccessResponse<T = void> = {
  success: true;
  data?: T;
};

/**
 * 失敗レスポンス
 */
export type FailureResponse = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

/**
 * 統一APIレスポンス型
 */
export type ApiResult<T = void> = SuccessResponse<T> | FailureResponse;

/**
 * 成功レスポンスを作成
 */
export function success<T>(data?: T): SuccessResponse<T> {
  return { success: true, data };
}

/**
 * 失敗レスポンスを作成
 */
export function failure(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): FailureResponse {
  return {
    success: false,
    error: { code, message, details },
  };
}

/**
 * 認証エラー
 */
export function unauthorized(message = "認証が必要です"): FailureResponse {
  return failure(ErrorCodes.UNAUTHORIZED, message);
}

/**
 * 権限エラー
 */
export function forbidden(message = "この操作を行う権限がありません"): FailureResponse {
  return failure(ErrorCodes.FORBIDDEN, message);
}

/**
 * リソース未検出
 */
export function notFound(resource = "リソース"): FailureResponse {
  return failure(ErrorCodes.NOT_FOUND, `${resource}が見つかりません`);
}

/**
 * レート制限
 */
export function rateLimitExceeded(
  message = "リクエストが多すぎます。しばらくしてからもう一度お試しください"
): FailureResponse {
  return failure(ErrorCodes.RATE_LIMIT_EXCEEDED, message);
}

/**
 * 内部エラー
 */
export function internalError(
  message = "サーバーエラーが発生しました"
): FailureResponse {
  return failure(ErrorCodes.INTERNAL_ERROR, message);
}

/**
 * HTTPレスポンスとしてエラーを返す（Route Handlers用）
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): Response {
  const status = ErrorStatusCodes[code];
  const body: ErrorResponse = {
    error: { code, message, details },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * HTTPレスポンスとして成功を返す（Route Handlers用）
 */
export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
