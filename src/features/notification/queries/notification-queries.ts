import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction, deleteNotificationAction } from "../server/notification-actions";
import type { MarkAsReadInput } from "../schema/notification-schema";

/**
 * 通知既読Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MarkAsReadInput) => {
      const result = await markNotificationAsReadAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (data) => {
      // 楽観的更新: 即座に既読状態を更新
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (Array.isArray(old)) {
          return old.map((notification: any) =>
            notification.id === data.notificationId
              ? { ...notification, isRead: true }
              : notification
          );
        }
        return old;
      });
      
      return { previousNotifications };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
      console.error("Mark notification as read failed:", error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * 全通知既読Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await markAllNotificationsAsReadAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async () => {
      // 楽観的更新: 全通知を既読に
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (Array.isArray(old)) {
          return old.map((notification: any) => ({ ...notification, isRead: true }));
        }
        return old;
      });
      
      return { previousNotifications };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
      console.error("Mark all notifications as read failed:", error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * 通知削除Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await deleteNotificationAction(notificationId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (notificationId) => {
      // 楽観的更新: 即座に通知を削除
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (Array.isArray(old)) {
          return old.filter((notification: any) => notification.id !== notificationId);
        }
        return old;
      });
      
      return { previousNotifications };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
      console.error("Delete notification failed:", error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
