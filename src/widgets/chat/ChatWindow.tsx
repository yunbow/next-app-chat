'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageItem } from '@/features/chat/ui/MessageItem';
import { MessageInput } from '@/features/chat/ui/MessageInput';
import { useChannel } from '@/lib/pusher/use-channel';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    status: string;
  };
  createdAt: Date | string;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    fileName?: string;
    filename?: string;
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

interface ChatWindowProps {
  groupId: string;
  groupName: string;
  currentUserId: string;
  onSendMessage: (content: string, imageUrl?: string) => Promise<void>;
}

export const ChatWindow = ({
  groupId,
  groupName,
  currentUserId,
  onSendMessage,
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?groupId=${groupId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [groupId]);

  useEffect(() => {
    setIsLoading(true);
    fetchMessages().finally(() => setIsLoading(false));
  }, [fetchMessages]);

  // Pusherリアルタイム受信
  useChannel(`group-${groupId}`, 'message:created', (data) => {
    const newMessage = data as Message;
    // 自分が送信したメッセージは既にfetch済みなので重複防止
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    try {
      setIsSending(true);
      await onSendMessage(content, imageUrl);

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
        placeholder={`${groupName}にメッセージを送信...`}
      />
    </>
  );
};
