"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageItem } from "@/features/chat/ui/MessageItem";
import { MessageInput } from "@/features/chat/ui/MessageInput";
import { useChannel } from "@/lib/pusher/use-channel";
import { Skeleton } from "@/shared/ui/skeleton";

interface UnifiedMessage {
  id: string;
  content: string;
  type: "text" | "image" | "file";
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    status?: string;
  };
  createdAt: Date | string;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    fileName: string;
    fileSize: number;
  }>;
  reads?: Array<{
    user: { id: string; name: string | null; image: string | null };
    readAt: Date | string;
  }>;
}

interface ChatMessagesWindowProps {
  channelId: string;
  currentUserId: string;
  placeholder?: string;
}

/**
 * Unified chat window. Works for both group and DM channels by routing
 * through `/api/chat/[channelId]` (chat-service handles the kind internally).
 */
export const ChatMessagesWindow = ({
  channelId,
  currentUserId,
  placeholder,
}: ChatMessagesWindowProps) => {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${channelId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [channelId]);

  useEffect(() => {
    setIsLoading(true);
    fetchMessages().finally(() => setIsLoading(false));
  }, [fetchMessages]);

  useChannel(`chat-${channelId}`, "message:created", (data) => {
    const newMessage = data as UnifiedMessage;
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });
  });

  useChannel(`chat-${channelId}`, "message:read", (data) => {
    const payload = data as {
      messageIds: string[];
      readerId: string;
      reader: { id: string; name: string | null; image: string | null };
      readAt: string;
    };
    const idSet = new Set(payload.messageIds);
    setMessages((prev) =>
      prev.map((m) => {
        if (!idSet.has(m.id)) return m;
        const already = m.reads?.some((r) => r.user.id === payload.readerId);
        if (already) return m;
        return {
          ...m,
          reads: [
            ...(m.reads ?? []),
            { user: payload.reader, readAt: payload.readAt },
          ],
        };
      })
    );
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    try {
      setIsSending(true);
      const res = await fetch(`/api/chat/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          type: imageUrl ? "image" : "text",
          imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Pusher fallback: refetch in case the realtime channel is not configured
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-muted/30 space-y-4" role="status">
        <Skeleton className="h-16 w-3/4 rounded-2xl" aria-hidden="true" />
        <Skeleton className="h-12 w-2/3 rounded-2xl ml-auto" aria-hidden="true" />
        <Skeleton className="h-16 w-3/4 rounded-2xl" aria-hidden="true" />
        <Skeleton className="h-20 w-1/2 rounded-2xl ml-auto" aria-hidden="true" />
        <Skeleton className="h-12 w-3/4 rounded-2xl" aria-hidden="true" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">メッセージはまだありません</p>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                {...message}
                sender={{
                  ...message.sender,
                  status: message.sender.status ?? "offline",
                }}
                attachments={message.attachments?.map((att) => ({
                  ...att,
                  filename: att.fileName,
                }))}
                isOwnMessage={message.sender.id === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isSending}
        placeholder={placeholder ?? "メッセージを送信..."}
      />
    </>
  );
};
