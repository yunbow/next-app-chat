/**
 * トーストメッセージ定数
 */

export const MESSAGES = {
  // 成功メッセージ
  SUCCESS: {
    MESSAGE_SENT: "メッセージを送信しました",
    MESSAGE_DELETED: "メッセージを削除しました",
    GROUP_CREATED: "グループを作成しました",
    GROUP_UPDATED: "グループを更新しました",
    GROUP_DELETED: "グループを削除しました",
    MEMBER_ADDED: "メンバーを追加しました",
    MEMBER_REMOVED: "メンバーを削除しました",
    // ユーザー関連
    PROFILE_UPDATED: "プロフィールを更新しました",
    REGISTRATION_COMPLETE: "登録が完了しました。ログインしてください。",
    LOGGED_IN: "ログインしました",
    // フレンド
    FRIEND_REQUEST_SENT: "フレンドリクエストを送信しました",
    FRIEND_REQUEST_ACCEPTED: "フレンドリクエストを承認しました",
    FRIEND_REMOVED: "フレンドを削除しました",
    FRIEND_BLOCKED: "ユーザーをブロックしました",
    FRIEND_UNBLOCKED: "ブロックを解除しました",
    // 通知
    NOTIFICATIONS_READ: "通知を既読にしました",
  },

  // エラーメッセージ
  ERROR: {
    MESSAGE_SEND_FAILED: "メッセージの送信に失敗しました",
    MESSAGE_DELETE_FAILED: "メッセージの削除に失敗しました",
    GROUP_CREATE_FAILED: "グループの作成に失敗しました",
    GROUP_UPDATE_FAILED: "グループの更新に失敗しました",
    UPLOAD_FAILED: "アップロードに失敗しました",
    LOGIN_FAILED: "ログインに失敗しました",
    LOGIN_REQUIRED: "ログインが必要です",
    // フレンド
    FRIEND_REQUEST_FAILED: "フレンドリクエストの送信に失敗しました",
    CANNOT_FRIEND_SELF: "自分自身にフレンドリクエストを送ることはできません",
    CANNOT_BLOCK_SELF: "自分自身をブロックすることはできません",
  },

  // ファイル制限メッセージ
  maxAttachmentsError: (max: number) => `添付ファイルは最大${max}個までです`,
} as const;
