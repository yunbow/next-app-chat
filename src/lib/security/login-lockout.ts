/**
 * ログイン失敗のロックアウト機能
 * Redisを使用してログイン失敗回数を追跡し、一定回数失敗したらアカウントをロック
 */

let redis: any = null;

if (process.env.NODE_ENV === "production") {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for production"
    );
  }

  import("@upstash/redis")
    .then((module) => {
      redis = new module.Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    })
    .catch((error) => {
      console.error("Failed to initialize Redis for login lockout:", error);
    });
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15分
const ATTEMPT_WINDOW_SECONDS = 60 * 60; // 1時間

/**
 * ログイン失敗回数をインクリメント
 */
export async function incrementLoginAttempts(email: string): Promise<number> {
  const key = `login:attempts:${email}`;

  if (process.env.NODE_ENV === "production" && redis) {
    const attempts = await redis.incr(key);
    if (attempts === 1) {
      await redis.expire(key, ATTEMPT_WINDOW_SECONDS);
    }
    return attempts;
  } else {
    console.warn(
      "[SECURITY WARNING] Using in-memory login lockout in development. Use Redis in production."
    );
    return 1;
  }
}

/**
 * アカウントがロックされているか確認
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const lockKey = `login:locked:${email}`;

  if (process.env.NODE_ENV === "production" && redis) {
    const locked = await redis.get(lockKey);
    return locked === "1";
  } else {
    return false;
  }
}

/**
 * アカウントをロック
 */
export async function lockAccount(email: string): Promise<void> {
  const lockKey = `login:locked:${email}`;

  if (process.env.NODE_ENV === "production" && redis) {
    await redis.setex(lockKey, LOCKOUT_DURATION_SECONDS, "1");
  } else {
    console.warn(
      `[SECURITY WARNING] Account would be locked in production: ${email}`
    );
  }
}

/**
 * ログイン成功時に失敗回数をリセット
 */
export async function resetLoginAttempts(email: string): Promise<void> {
  const attemptsKey = `login:attempts:${email}`;
  const lockKey = `login:locked:${email}`;

  if (process.env.NODE_ENV === "production" && redis) {
    await Promise.all([
      redis.del(attemptsKey),
      redis.del(lockKey),
    ]);
  }
}

/**
 * ログイン試行をチェックし、必要に応じてロック
 */
export async function checkLoginAttempts(
  email: string
): Promise<{ locked: boolean; remainingAttempts: number }> {
  const locked = await isAccountLocked(email);
  if (locked) {
    return { locked: true, remainingAttempts: 0 };
  }

  const attempts = await incrementLoginAttempts(email);

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    await lockAccount(email);
    return { locked: true, remainingAttempts: 0 };
  }

  return {
    locked: false,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts,
  };
}

/**
 * ロックアウト期間を取得（分単位）
 */
export function getLockoutDurationMinutes(): number {
  return LOCKOUT_DURATION_SECONDS / 60;
}
