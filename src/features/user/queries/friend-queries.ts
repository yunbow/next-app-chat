import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFriendRequestAction, respondFriendRequestAction, removeFriendAction } from "../server/friend-actions";
import type { SendFriendRequestInput, RespondFriendRequestInput } from "../schema/user-schema";

/**
 * フレンドリクエスト送信Mutation
 * ガイドライン準拠: エラーハンドリング、キャッシュ無効化
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendFriendRequestInput) => {
      const result = await sendFriendRequestAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
    onError: (error: Error) => {
      console.error("Friend request failed:", error.message);
    },
  });
}

/**
 * フレンドリクエスト応答Mutation
 * ガイドライン準拠: エラーハンドリング、複数キャッシュ無効化
 */
export function useRespondFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RespondFriendRequestInput) => {
      const result = await respondFriendRequestAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      console.error("Friend request response failed:", error.message);
    },
  });
}

/**
 * フレンド削除Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId: string) => {
      const result = await removeFriendAction(friendId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (friendId) => {
      // 楽観的更新: 即座にUIからフレンドを削除
      await queryClient.cancelQueries({ queryKey: ["friends"] });
      const previousFriends = queryClient.getQueryData(["friends"]);
      
      // フレンドリストから削除（実際のデータ構造に応じて調整）
      queryClient.setQueryData(["friends"], (old: any) => {
        if (Array.isArray(old)) {
          return old.filter((friend: any) => friend.id !== friendId);
        }
        return old;
      });
      
      return { previousFriends };
    },
    onError: (error: Error, _variables, context) => {
      // エラー時はロールバック
      if (context?.previousFriends) {
        queryClient.setQueryData(["friends"], context.previousFriends);
      }
      console.error("Friend removal failed:", error.message);
    },
    onSettled: () => {
      // 最終的にサーバーデータで同期
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}
