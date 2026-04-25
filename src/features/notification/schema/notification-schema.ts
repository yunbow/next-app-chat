import { z } from "zod";

export const markAsReadSchema = z.object({
  notificationId: z.string().min(1, "通知IDは必須です"),
});

export const markAllAsReadSchema = z.object({
  // 全て既読にする場合は特に入力不要
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type MarkAllAsReadInput = z.infer<typeof markAllAsReadSchema>;
