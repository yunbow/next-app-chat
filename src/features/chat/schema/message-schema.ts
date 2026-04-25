import { z } from "zod";

export const createMessageSchema = z.object({
  content: z.string().min(1, "メッセージは必須です").max(5000, "メッセージは5000文字以内です"),
  type: z.enum(["text", "image", "file"]).default("text"),
  groupId: z.string().optional(),
  receiverId: z.string().optional(),
  imageUrl: z.url("有効なURLを入力してください").optional(),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, "メッセージは必須です").max(5000, "メッセージは5000文字以内です"),
});

export const createGroupSchema = z.object({
  name: z.string().min(1, "グループ名は必須です").max(100, "グループ名は100文字以内です"),
  description: z.string().max(500, "説明は500文字以内です").optional(),
  image: z.url("有効なURLを入力してください").optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.url().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
