/**
 * アプリケーション全体で使用する定数
 */

/**
 * 文字数制限
 */
export const CHAR_LIMITS = {
  // ユーザー名
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  // パスワード
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 100,
  // 表示名
  DISPLAY_NAME_MAX: 50,
  // メッセージ
  MESSAGE_MAX: 5000,
  // グループ名
  GROUP_NAME_MAX: 100,
  // グループ説明
  GROUP_DESCRIPTION_MAX: 500,
} as const;

/**
 * ファイルアップロード制限
 */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_ATTACHMENTS_PER_MESSAGE: 4,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;

/**
 * ページネーション
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MESSAGES_LIMIT: 50,
  MIN_SEARCH_LENGTH: 2,
} as const;

/**
 * 時間設定（ミリ秒）
 */
export const TIMING = {
  SEARCH_DEBOUNCE_MS: 300,
  NOTIFICATION_RECONNECT_MS: 5000,
  POLL_INTERVAL_MS: 30000,
  HEARTBEAT_INTERVAL_MS: 30000,
  // React Query キャッシュ設定
  STALE_TIME_MS: 60000,
  STALE_TIME_LONG_MS: 5 * 60000,
  STALE_TIME_SHORT_MS: 30000,
  GC_TIME_MS: 5 * 60000,
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
} as const;

/**
 * セキュリティ設定
 */
export const SECURITY = {
  BCRYPT_SALT_ROUNDS: 10,
  AUTH_TOKEN_BYTES: 32,
  RANDOM_USERNAME_BYTES: 10,
  FILE_NAME_RANDOM_BYTES: 8,
  MAX_USERNAME_GENERATION_ATTEMPTS: 10,
} as const;

/**
 * APIエンドポイント
 */
export const API_ENDPOINTS = {
  UPLOAD: "/api/upload",
  NOTIFICATIONS: "/api/notifications",
  USERS_SEARCH: "/api/users",
  MESSAGES: "/api/messages",
  DIRECT_MESSAGES: "/api/direct-messages",
  FRIENDS: "/api/friends",
  GROUPS: "/api/groups",
} as const;

export { MESSAGES } from "./messages";
