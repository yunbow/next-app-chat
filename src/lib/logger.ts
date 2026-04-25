import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
    service: "next-app-chat",
  },
});

export function createRequestLogger(requestId: string, traceId?: string) {
  return logger.child({ requestId, traceId: traceId || requestId });
}

export function createUserLogger(userId: string, traceId?: string) {
  return logger.child({ userId, traceId });
}

export function createContextLogger(
  requestId: string,
  userId?: string,
  traceId?: string
) {
  return logger.child({ requestId, userId, traceId: traceId || requestId });
}

export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({
    err: error,
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

export function logSecurityEvent(
  event: string,
  context: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    action?: string;
    details?: Record<string, unknown>;
  }
) {
  logger.warn(
    {
      type: "SECURITY_EVENT",
      event,
      ...context,
    },
    `Security event: ${event}`
  );
}
