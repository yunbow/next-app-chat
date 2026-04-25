import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上です"),
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, "名前を入力してください")
    .max(50, "名前は50文字以内です"),
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string()
    .min(8, "パスワードは8文字以上です")
    .regex(/[A-Z]/, "パスワードには大文字を含める必要があります")
    .regex(/[a-z]/, "パスワードには小文字を含める必要があります")
    .regex(/[0-9]/, "パスワードには数字を含める必要があります"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
