import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMessageAction,
  updateMessageAction,
  deleteMessageAction,
} from "../server/message-actions";
import type { CreateMessageInput, UpdateMessageInput } from "../schema/message-schema";

/**
 * メッセージQueryキー
 * ガイドライン準拠: 構造化されたqueryKey管理
 */
export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (groupId?: string) => [...messageKeys.lists(), { groupId }] as const,
  details: () => [...messageKeys.all, "detail"] as const,
  detail: (id: string) => [...messageKeys.details(), id] as const,
};

/**
 * メッセージ一覧取得Query
 * ガイドライン準拠: 標準的なQuery実装
 */
export function useMessages(groupId?: string) {
  return useQuery({
    queryKey: messageKeys.list(groupId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (groupId) params.set("groupId", groupId);
      
      const res = await fetch(`/api/messages?${params}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });
}

/**
 * メッセージ作成Mutation
 * ガイドライン準拠: エラーハンドリング、キャッシュ無効化
 */
export function useCreateMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateMessageInput) => {
      const result = await createMessageAction(data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: messageKeys.list(variables.groupId) 
      });
    },
    onError: (error: Error) => {
      console.error("Create message failed:", error.message);
    },
  });
}

/**
 * メッセージ更新Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMessageInput }) => {
      const result = await updateMessageAction(id, data);
      if (!result.success) throw new Error(result.error);
      return { id, data };
    },
    onMutate: async ({ id, data }) => {
      // 楽観的更新: 即座にメッセージ内容を更新
      await queryClient.cancelQueries({ queryKey: messageKeys.lists() });
      const previousMessages = queryClient.getQueryData(messageKeys.lists());
      
      // 全てのメッセージリストを更新
      queryClient.setQueriesData({ queryKey: messageKeys.lists() }, (old: any) => {
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
        queryClient.setQueryData(messageKeys.lists(), context.previousMessages);
      }
      console.error("Update message failed:", error.message);
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: messageKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      }
    },
  });
}

/**
 * メッセージ削除Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteMessageAction(id);
      if (!result.success) throw new Error(result.error);
      return id;
    },
    onMutate: async (id) => {
      // 楽観的更新: 即座にメッセージを削除（論理削除）
      await queryClient.cancelQueries({ queryKey: messageKeys.lists() });
      const previousMessages = queryClient.getQueryData(messageKeys.lists());
      
      queryClient.setQueriesData({ queryKey: messageKeys.lists() }, (old: any) => {
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
        queryClient.setQueryData(messageKeys.lists(), context.previousMessages);
      }
      console.error("Delete message failed:", error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
    },
  });
}
