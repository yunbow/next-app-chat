"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMessageSchema, type CreateMessageInput } from "../schema/message-schema";
import { useCreateMessage } from "../queries/message-queries";
import { Button } from "@/shared/ui/button";
import { useState } from "react";

interface MessageFormProps {
  groupId?: string;
  receiverId?: string;
  onSuccess?: () => void;
}

export function MessageForm({ groupId, receiverId, onSuccess }: MessageFormProps) {
  const [error, setError] = useState<string | null>(null);
  const createMessage = useCreateMessage();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateMessageInput>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      type: "text",
      groupId,
      receiverId,
    },
  });

  const onSubmit = async (data: CreateMessageInput) => {
    setError(null);
    
    try {
      await createMessage.mutateAsync(data);
      reset({ type: "text", groupId, receiverId, content: "" });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "メッセージの送信に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <textarea
          {...register("content")}
          placeholder="メッセージを入力..."
          className="w-full min-h-[80px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="text"
          {...register("imageUrl")}
          placeholder="画像URL（任意）"
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "送信"}
        </Button>
      </div>
      
      {errors.imageUrl && (
        <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
      )}
      
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
    </form>
  );
}
