import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGroupAction,
  updateGroupAction,
  deleteGroupAction,
  addGroupMemberAction,
} from "../server/group-actions";
import type { CreateGroupInput, UpdateGroupInput } from "../schema/message-schema";

/**
 * グループQueryキー
 * ガイドライン準拠: 構造化されたqueryKey管理
 */
export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...groupKeys.lists(), filters || {}] as const,
  details: () => [...groupKeys.all, "detail"] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  members: (id: string) => [...groupKeys.detail(id), "members"] as const,
};

/**
 * グループ一覧取得Query
 * ガイドライン準拠: 標準的なQuery実装
 */
export function useGroups(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: groupKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters as Record<string, string>);
      const res = await fetch(`/api/groups?${params}`);
      if (!res.ok) throw new Error("Failed to fetch groups");
      return res.json();
    },
  });
}

/**
 * グループ詳細取得Query
 * ガイドライン準拠: 標準的なQuery実装
 */
export function useGroup(id: string) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/groups/${id}`);
      if (!res.ok) throw new Error("Failed to fetch group");
      return res.json();
    },
    enabled: !!id,
  });
}

/**
 * グループ作成Mutation
 * ガイドライン準拠: エラーハンドリング、キャッシュ無効化
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateGroupInput) => {
      const result = await createGroupAction(data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
    onError: (error: Error) => {
      console.error("Create group failed:", error.message);
    },
  });
}

/**
 * グループ更新Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGroupInput }) => {
      const result = await updateGroupAction(id, data);
      if (!result.success) throw new Error(result.error);
      return { id, data };
    },
    onMutate: async ({ id, data }) => {
      // 楽観的更新: 即座にグループ情報を更新
      await queryClient.cancelQueries({ queryKey: groupKeys.detail(id) });
      const previousGroup = queryClient.getQueryData(groupKeys.detail(id));
      
      queryClient.setQueryData(groupKeys.detail(id), (old: any) => ({
        ...old,
        ...data,
      }));
      
      return { previousGroup };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousGroup) {
        queryClient.setQueryData(groupKeys.detail(variables.id), context.previousGroup);
      }
      console.error("Update group failed:", error.message);
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: groupKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      }
    },
  });
}

/**
 * グループ削除Mutation
 * ガイドライン準拠: 楽観的更新、エラーハンドリング
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteGroupAction(id);
      if (!result.success) throw new Error(result.error);
      return id;
    },
    onMutate: async (id) => {
      // 楽観的更新: 即座にグループをリストから削除
      await queryClient.cancelQueries({ queryKey: groupKeys.lists() });
      const previousGroups = queryClient.getQueryData(groupKeys.lists());
      
      queryClient.setQueriesData({ queryKey: groupKeys.lists() }, (old: any) => {
        if (Array.isArray(old)) {
          return old.filter((group: any) => group.id !== id);
        }
        return old;
      });
      
      return { previousGroups };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(groupKeys.lists(), context.previousGroups);
      }
      console.error("Delete group failed:", error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

/**
 * グループメンバー追加Mutation
 * ガイドライン準拠: エラーハンドリング、キャッシュ無効化
 */
export function useAddGroupMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const result = await addGroupMemberAction(groupId, userId);
      if (!result.success) throw new Error(result.error);
      return { groupId, userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.members(data.groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(data.groupId) });
    },
    onError: (error: Error) => {
      console.error("Add group member failed:", error.message);
    },
  });
}
