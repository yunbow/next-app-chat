/**
 * エラーメッセージの定数定義
 */

export const ERROR_MESSAGES = {
  // 認証関連
  AUTH: {
    REQUIRED: "ログインが必要です",
    INVALID_CREDENTIALS: "メールアドレスまたはパスワードが正しくありません",
    SESSION_EXPIRED: "セッションの有効期限が切れました",
  },

  // 権限関連
  PERMISSION: {
    FORBIDDEN: "この操作を実行する権限がありません",
    SELF_OPERATION: "この操作は実行できません",
    RESOURCE_ACCESS: "このリソースにアクセスする権限がありません",
  },

  // バリデーション関連
  VALIDATION: {
    INVALID_INPUT: "入力が不正です",
    REQUIRED_FIELD: "{field}は必須です",
    INVALID_FORMAT: "{field}の形式が正しくありません",
    TOO_SHORT: "{field}は{min}文字以上で入力してください",
    TOO_LONG: "{field}は{max}文字以下で入力してください",
    INVALID_EMAIL: "有効なメールアドレスを入力してください",
  },

  // リソース関連
  RESOURCE: {
    NOT_FOUND: "リソースが見つかりません",
    GENERIC_NOT_FOUND: "要求されたリソースが見つかりません",
  },

  // レート制限関連
  RATE_LIMIT: {
    EXCEEDED: "リクエストが多すぎます。しばらく待ってから再度お試しください",
    MESSAGE_SENDING: "メッセージの送信が多すぎます。しばらく待ってから再度お試しください",
    FRIEND_ACTION: "フレンド操作が多すぎます。しばらく待ってから再度お試しください",
  },

  // ビジネスロジック関連
  BUSINESS: {
    ALREADY_EXISTS: "{resource}は既に存在します",
    ALREADY_FRIEND: "既にフレンドです",
    NOT_FRIEND: "フレンドではありません",
    ALREADY_BLOCKED: "既にブロックしています",
    NOT_BLOCKED: "ブロックしていません",
    ALREADY_GROUP_MEMBER: "既にグループのメンバーです",
    NOT_GROUP_MEMBER: "グループのメンバーではありません",
  },

  // ファイルアップロード関連
  UPLOAD: {
    FILE_TOO_LARGE: "ファイルサイズが大きすぎます（最大{max}MB）",
    INVALID_FILE_TYPE: "サポートされていないファイル形式です",
    UPLOAD_FAILED: "ファイルのアップロードに失敗しました",
    TOO_MANY_FILES: "ファイル数が多すぎます（最大{max}個）",
  },

  // サーバーエラー
  SERVER: {
    INTERNAL_ERROR: "サーバーエラーが発生しました",
    DATABASE_ERROR: "データベースエラーが発生しました",
    NETWORK_ERROR: "ネットワークエラーが発生しました",
  },
} as const;

/**
 * エラーメッセージのプレースホルダーを置換
 */
export function formatErrorMessage(
  message: string,
  params: Record<string, string | number>
): string {
  let formatted = message;
  for (const [key, value] of Object.entries(params)) {
    formatted = formatted.replace(`{${key}}`, String(value));
  }
  return formatted;
}
