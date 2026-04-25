import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上です"),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, "ユーザー名は3文字以上です")
    .max(30, "ユーザー名は30文字以内です")
    .regex(/^[a-zA-Z0-9_-]+$/, "ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます"),
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string()
    .min(8, "パスワードは8文字以上です")
    .regex(/[a-zA-Z]/, "パスワードには英字を含める必要があります")
    .regex(/[0-9]/, "パスワードには数字を含める必要があります"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
