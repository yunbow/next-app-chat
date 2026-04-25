"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupSchema, type CreateGroupInput } from "../schema/message-schema";
import { useCreateGroup } from "../queries/group-queries";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useState } from "react";

interface CreateGroupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateGroupForm({ onSuccess, onCancel }: CreateGroupFormProps) {
  const [error, setError] = useState<string | null>(null);
  const createGroup = useCreateGroup();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
  });

  const onSubmit = async (data: CreateGroupInput) => {
    setError(null);
    
    try {
      await createGroup.mutateAsync(data);
      reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "グループの作成に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          グループ名 <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          {...register("name")}
          placeholder="グループ名を入力"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          説明（任意）
        </label>
        <Input
          id="description"
          {...register("description")}
          placeholder="グループの説明を入力"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="image" className="block text-sm font-medium mb-1">
          画像URL（任意）
        </label>
        <Input
          id="image"
          {...register("image")}
          placeholder="https://example.com/image.jpg"
          disabled={isSubmitting}
        />
        {errors.image && (
          <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "作成中..." : "グループを作成"}
        </Button>
      </div>
    </form>
  );
}
