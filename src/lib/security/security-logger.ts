import "server-only";

import { logger } from "@/lib/logger";

/**
 * セキュリティイベントの種類
 */
export type SecurityEventType =
  | "AUTH_SUCCESS"
  | "AUTH_FAILURE"
  | "CSRF_VIOLATION"
  | "RATE_LIMIT_EXCEEDED"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "PERMISSION_DENIED"
  | "SUSPICIOUS_INPUT"
  | "FILE_UPLOAD_BLOCKED"
  | "ACCOUNT_SUSPENDED"
  | "PASSWORD_CHANGED"
  | "EMAIL_CHANGED";

/**
 * セキュリティイベントのコンテキスト
 */
type SecurityEventContext = {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
};

/**
 * セキュリティイベントをログに記録
 */
export function logSecurityEventStructured(
  event: SecurityEventType,
  context: SecurityEventContext
): void {
  const logData = {
    msg: `Security event: ${event}`,
    securityEvent: event,
    ...context,
    timestamp: new Date().toISOString(),
  };

  switch (event) {
    case "AUTH_FAILURE":
    case "CSRF_VIOLATION":
    case "TOKEN_INVALID":
    case "PERMISSION_DENIED":
    case "SUSPICIOUS_INPUT":
    case "FILE_UPLOAD_BLOCKED":
      logger.warn(logData);
      break;

    case "RATE_LIMIT_EXCEEDED":
    case "TOKEN_EXPIRED":
      logger.info(logData);
      break;

    case "ACCOUNT_SUSPENDED":
      logger.error(logData);
      break;

    case "AUTH_SUCCESS":
    case "PASSWORD_CHANGED":
    case "EMAIL_CHANGED":
      logger.info(logData);
      break;

    default:
      logger.info(logData);
  }
}

/**
 * リクエストからセキュリティコンテキストを抽出
 */
export function extractSecurityContext(
  request: Request
): Pick<SecurityEventContext, "ip" | "userAgent" | "path" | "method"> {
  const headers = request.headers;
  return {
    ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        "unknown",
    userAgent: headers.get("user-agent") || "unknown",
    path: new URL(request.url).pathname,
    method: request.method,
  };
}
