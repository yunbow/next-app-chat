import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileAction, changePasswordAction, updateUserStatusAction } from "../server/user-actions";
import type { UpdateProfileInput, ChangePasswordInput } from "../schema/user-schema";

/**
 * プロフィール更新Mutation
 * ガイドライン準拠: エラーハンドリング、キャッシュ無効化
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const result = await updateProfileAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error: Error) => {
      console.error("Profile update failed:", error.message);
    },
  });
}

/**
 * パスワード変更Mutation
 * ガイドライン準拠: エラーハンドリング
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const result = await changePasswordAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onError: (error: Error) => {
      console.error("Password change failed:", error.message);
    },
  });
}

/**
 * ユーザーステータス更新Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: "online" | "offline" | "away") => {
      const result = await updateUserStatusAction(status);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (newStatus) => {
      // 楽観的更新: 即座にUIを更新
      await queryClient.cancelQueries({ queryKey: ["user", "status"] });
      const previousStatus = queryClient.getQueryData(["user", "status"]);
      queryClient.setQueryData(["user", "status"], newStatus);
      return { previousStatus };
    },
    onError: (error: Error, _variables, context) => {
      // エラー時はロールバック
      if (context?.previousStatus) {
        queryClient.setQueryData(["user", "status"], context.previousStatus);
      }
      console.error("Status update failed:", error.message);
    },
    onSettled: () => {
      // 最終的にサーバーデータで同期
      queryClient.invalidateQueries({ queryKey: ["user", "status"] });
    },
  });
}
