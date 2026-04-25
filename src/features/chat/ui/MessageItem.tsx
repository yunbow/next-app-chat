'use client';

import { Avatar } from '@/shared/ui/avatar/Avatar';
import { cn } from '@/shared/lib/utils/cn';
import { getImageUrl } from '@/lib/utils/image-url';
import Image from 'next/image';
import { useState } from 'react';

interface MessageItemProps {
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
  isOwnMessage: boolean;
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

export const MessageItem = ({
  content,
  type,
  sender,
  createdAt,
  isOwnMessage,
  attachments = [],
  reads = [],
}: MessageItemProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const imageAttachment = attachments.find((a) => a.type === 'image');
  const isRead = reads.length > 0;
  const latestRead = isRead
    ? reads.reduce((latest, r) =>
        new Date(r.readAt) > new Date(latest.readAt) ? r : latest
      )
    : null;
  const readTooltip = latestRead
    ? `${latestRead.user.name || 'User'} が ${formatTime(latestRead.readAt)} に既読`
    : undefined;

  return (
    <>
      <div
        className={cn(
          'flex gap-3 mb-4',
          isOwnMessage ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {!isOwnMessage && (
          <Avatar
            src={sender.image || undefined}
            name={sender.name || 'User'}
            size="md"
            status={sender.status as 'online' | 'offline' | 'away'}
          />
        )}

        <div
          className={cn(
            'flex flex-col max-w-[70%]',
            isOwnMessage ? 'items-end' : 'items-start'
          )}
        >
          {!isOwnMessage && (
            <span className="text-xs text-gray-600 mb-1 px-1">
              {sender.name}
            </span>
          )}

          <div
            className={cn(
              'rounded-lg overflow-hidden',
              !imageAttachment && 'px-4 py-2',
              isOwnMessage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            )}
          >
            {/* 画像添付がある場合 */}
            {imageAttachment && (
              <div
                className="cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              >
                <div className="relative w-64 h-64">
                  <Image
                    src={getImageUrl(imageAttachment.url) || imageAttachment.url}
                    alt={imageAttachment.fileName || imageAttachment.filename || 'image'}
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                </div>
                {content && content !== '画像を送信しました' && (
                  <p className="text-sm whitespace-pre-wrap break-words px-4 py-2">
                    {content}
                  </p>
                )}
              </div>
            )}

            {/* テキストのみ */}
            {!imageAttachment && (
              <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 px-1">
            <span className="text-xs text-gray-500">{formatTime(createdAt)}</span>
            {isOwnMessage && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs transition-colors',
                  isRead ? 'text-blue-600' : 'text-gray-400'
                )}
                title={readTooltip ?? '未読'}
                aria-label={isRead ? `既読: ${readTooltip}` : '未読'}
              >
                {/* Double-check glyph — greyed until read, blue when read */}
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <polyline points="7 13 10 16 16 9" />
                  <polyline points="11 13 14 16 20 9" />
                </svg>
                {isRead && <span>既読</span>}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 画像モーダル */}
      {imageAttachment && isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-screen-lg max-h-screen p-4">
            <Image
              src={getImageUrl(imageAttachment.url) || imageAttachment.url}
              alt={imageAttachment.fileName || imageAttachment.filename || 'image'}
              width={1200}
              height={1200}
              className="object-contain max-h-screen"
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
