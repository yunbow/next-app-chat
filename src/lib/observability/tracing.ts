/**
 * OpenTelemetry分散トレーシング設定
 */

import { trace, SpanStatusCode, Span } from "@opentelemetry/api";

const TRACER_NAME = "next-app-chat";

/**
 * トレーサーを取得
 */
export function getTracer() {
  return trace.getTracer(TRACER_NAME);
}

/**
 * スパンを作成して関数を実行
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = getTracer();

  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Server Componentの実行時間を計測
 */
export async function traceServerComponent<T>(
  componentName: string,
  fn: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== "production") {
    return fn();
  }

  return withSpan(
    `ServerComponent.${componentName}`,
    async (span) => {
      span.setAttribute("component.type", "server");
      span.setAttribute("component.name", componentName);
      return fn();
    }
  );
}

/**
 * API Routeの実行時間を計測
 */
export async function traceApiRoute<T>(
  method: string,
  path: string,
  fn: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== "production") {
    return fn();
  }

  return withSpan(
    `API.${method} ${path}`,
    async (span) => {
      span.setAttribute("http.method", method);
      span.setAttribute("http.route", path);
      return fn();
    }
  );
}

/**
 * Server Actionの実行時間を計測
 */
export async function traceServerAction<T>(
  actionName: string,
  fn: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== "production") {
    return fn();
  }

  return withSpan(
    `ServerAction.${actionName}`,
    async (span) => {
      span.setAttribute("action.name", actionName);
      return fn();
    }
  );
}

/**
 * データベースクエリの実行時間を計測
 */
export async function traceDatabase<T>(
  operation: string,
  model: string,
  fn: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== "production") {
    return fn();
  }

  return withSpan(
    `DB.${model}.${operation}`,
    async (span) => {
      span.setAttribute("db.system", "postgresql");
      span.setAttribute("db.operation", operation);
      span.setAttribute("db.model", model);
      return fn();
    }
  );
}

/**
 * カスタムイベントを記録
 */
export function recordEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>
) {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * 現在のトレースIDを取得
 */
export function getTraceId(): string | undefined {
  const span = trace.getActiveSpan();
  if (span) {
    return span.spanContext().traceId;
  }
  return undefined;
}

/**
 * トレースコンテキストをHTTPヘッダーに追加
 */
export function getTraceHeaders(): Record<string, string> {
  const traceId = getTraceId();
  const span = trace.getActiveSpan();
  const spanId = span?.spanContext().spanId;

  if (traceId && spanId) {
    return {
      "x-trace-id": traceId,
      "x-span-id": spanId,
    };
  }

  return {};
}
