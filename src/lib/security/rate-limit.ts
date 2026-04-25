import "server-only";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger";

/**
 * Rate Limit 実装
 *
 * dev / test: インメモリ
 * production: Upstash Redis（env.ts superRefine で URL/TOKEN pair 強制）
 */

const memoryStore = new Map<string, { count: number; resetAt: number }>();

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function checkMemory(
  identifier: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    memoryStore.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  memoryStore.set(identifier, entry);
  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

async function checkUpstash(
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  if (!redis) return checkMemory(identifier, limit, windowMs);
  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const resetAt = now + windowMs;

    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.pexpire(key, windowMs);
    const results = await pipeline.exec();
    const count = typeof results[0] === "number" ? results[0] : 0;

    if (count > limit) {
      return { success: false, remaining: 0, resetAt };
    }
    return { success: true, remaining: limit - count, resetAt };
  } catch (error) {
    logger.error({ err: error }, "Redis rate limit error, falling back to memory");
    return checkMemory(identifier, limit, windowMs);
  }
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60_000,
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  if (env.NODE_ENV === "production") {
    if (!redis) {
      throw new Error(
        "Redis required for production rate limiting but UPSTASH_* env is not configured",
      );
    }
    return checkUpstash(identifier, limit, windowMs);
  }
  return checkMemory(identifier, limit, windowMs);
}

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60_000 },
  register: { limit: 3, windowMs: 60 * 60_000 },
  passwordReset: { limit: 3, windowMs: 60 * 60_000 },
  sendMessage: { limit: 30, windowMs: 60_000 },
  sendDM: { limit: 20, windowMs: 60_000 },
  createGroup: { limit: 5, windowMs: 60_000 },
  friendRequest: { limit: 20, windowMs: 60_000 },
  search: { limit: 30, windowMs: 60_000 },
  getUser: { limit: 60, windowMs: 60_000 },
  default: { limit: 60, windowMs: 60_000 },
} as const;

export function getClientIp(request: Request): string {
  const headers = request.headers;
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();
  return "unknown";
}
