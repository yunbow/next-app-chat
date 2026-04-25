import { z } from "zod";

// ユーザープロフィール更新
export const updateProfileSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50, "名前は50文字以内です").optional(),
  image: z.url("有効なURLを入力してください").optional(),
  status: z.enum(["online", "offline", "away"]).optional(),
});

// パスワード変更
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードは必須です"),
  newPassword: z.string().min(8, "新しいパスワードは8文字以上です").max(100, "パスワードは100文字以内です"),
  confirmPassword: z.string().min(1, "確認用パスワードは必須です"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

// フレンドリクエスト
export const sendFriendRequestSchema = z.object({
  friendId: z.string().min(1, "ユーザーIDは必須です"),
});

// フレンドリクエスト応答
export const respondFriendRequestSchema = z.object({
  requestId: z.string().min(1, "リクエストIDは必須です"),
  action: z.enum(["accept", "reject"]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type RespondFriendRequestInput = z.infer<typeof respondFriendRequestSchema>;
