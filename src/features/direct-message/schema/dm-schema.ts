import { z } from "zod";

export const sendDMSchema = z.object({
  receiverId: z.string().min(1, "受信者IDは必須です"),
  content: z.string().min(1, "メッセージは必須です").max(5000, "メッセージは5000文字以内です"),
  type: z.enum(["text", "image", "file"]).default("text"),
  imageUrl: z.url("有効なURLを入力してください").optional(),
});

export const updateDMSchema = z.object({
  content: z.string().min(1, "メッセージは必須です").max(5000, "メッセージは5000文字以内です"),
});

export type SendDMInput = z.infer<typeof sendDMSchema>;
export type UpdateDMInput = z.infer<typeof updateDMSchema>;
