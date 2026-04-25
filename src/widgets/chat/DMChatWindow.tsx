'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageItem } from '@/features/chat/ui/MessageItem';
import { MessageInput } from '@/features/chat/ui/MessageInput';
import { useChannel } from '@/lib/pusher/use-channel';

interface DMMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date | string;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    fileName: string;
  }>;
  reads?: Array<{
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    readAt: Date | string;
  }>;
}

interface DMChatWindowProps {
  dmId: string;
  otherUserName: string;
  currentUserId: string;
}

export const DMChatWindow = ({
  dmId,
  otherUserName,
  currentUserId,
}: DMChatWindowProps) => {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/direct-messages/${dmId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [dmId]);

  useEffect(() => {
    if (dmId) {
      setIsLoading(true);
      fetchMessages().finally(() => setIsLoading(false));
    }
  }, [dmId, fetchMessages]);

  // Pusherリアルタイム受信
  useChannel(`dm-${dmId}`, 'message:created', (data) => {
    const newMessage = data as DMMessage;
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });
  });

  // 相手がメッセージを既読にしたイベント
  useChannel(`dm-${dmId}`, 'message:read', (data) => {
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
      const res = await fetch(`/api/direct-messages/${dmId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type: imageUrl ? 'image' : 'text',
          imageUrl,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      // メッセージ再取得（Pusherがなくてもフォールバック）
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      {/* Messages */}
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
                  status: 'offline',
                }}
                attachments={message.attachments?.map(att => ({
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

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isSending}
        placeholder={`${otherUserName}にメッセージを送信...`}
      />
    </>
  );
};
