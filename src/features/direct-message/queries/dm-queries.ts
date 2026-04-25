import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendDirectMessageAction, updateDirectMessageAction, deleteDirectMessageAction, markDMAsReadAction } from "../server/dm-actions";
import type { SendDMInput, UpdateDMInput } from "../schema/dm-schema";

/**
 * DM送信Mutation
 * ガイドライン準拠: エラーハンドリング、キャッシュ無効化
 */
export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendDMInput) => {
      const result = await sendDirectMessageAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-messages"] });
      queryClient.invalidateQueries({ queryKey: ["dm-list"] });
    },
    onError: (error: Error) => {
      console.error("Send DM failed:", error.message);
    },
  });
}

/**
 * DM更新Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useUpdateDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDMInput }) => {
      const result = await updateDirectMessageAction(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async ({ id, data }) => {
      // 楽観的更新: 即座にメッセージ内容を更新
      await queryClient.cancelQueries({ queryKey: ["direct-messages"] });
      const previousMessages = queryClient.getQueryData(["direct-messages"]);
      
      queryClient.setQueryData(["direct-messages"], (old: any) => {
        if (Array.isArray(old)) {
          return old.map((message: any) =>
            message.id === id ? { ...message, ...data } : message
          );
        }
        return old;
      });
      
      return { previousMessages };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["direct-messages"], context.previousMessages);
      }
      console.error("Update DM failed:", error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-messages"] });
    },
  });
}

/**
 * DM削除Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useDeleteDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDirectMessageAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (id) => {
      // 楽観的更新: 即座にメッセージを削除（論理削除）
      await queryClient.cancelQueries({ queryKey: ["direct-messages"] });
      const previousMessages = queryClient.getQueryData(["direct-messages"]);
      
      queryClient.setQueryData(["direct-messages"], (old: any) => {
        if (Array.isArray(old)) {
          return old.map((message: any) =>
            message.id === id ? { ...message, isDeleted: true } : message
          );
        }
        return old;
      });
      
      return { previousMessages };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["direct-messages"], context.previousMessages);
      }
      console.error("Delete DM failed:", error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-messages"] });
    },
  });
}

/**
 * DM既読Mutation
 * ガイドライン準拠: エラーハンドリング、複数キャッシュ無効化
 */
export function useMarkDMAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (directMessageId: string) => {
      const result = await markDMAsReadAction(directMessageId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-messages"] });
      queryClient.invalidateQueries({ queryKey: ["dm-list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      console.error("Mark DM as read failed:", error.message);
    },
  });
}
