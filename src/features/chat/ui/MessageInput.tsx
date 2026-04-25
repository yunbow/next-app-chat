'use client';

import { useState, KeyboardEvent, useRef } from 'react';
import { Button } from '@/shared/ui/button/Button';
import { cn } from '@/shared/lib/utils/cn';
import Image from 'next/image';

interface MessageInputProps {
  onSendMessage: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = 'メッセージを入力...',
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // ファイルサイズチェック (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !imageFile) || disabled || isUploading) return;

    setIsUploading(true);
    try {
      let uploadedImageUrl: string | undefined;

      // 画像がある場合はアップロード
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('画像のアップロードに失敗しました');
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
        console.log('Image uploaded successfully:', uploadData);
        console.log('Uploaded image URL:', uploadedImageUrl);
      }

      console.log('Calling onSendMessage with:', {
        content: message || '画像を送信しました',
        imageUrl: uploadedImageUrl
      });
      onSendMessage(message || '画像を送信しました', uploadedImageUrl);
      setMessage('');
      handleRemoveImage();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'メッセージの送信に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* 画像プレビュー */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        {/* 画像選択ボタン */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg',
            'border border-gray-300 hover:bg-gray-100',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          type="button"
          title="画像を添付"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isUploading}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2',
            'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'max-h-32 min-h-[42px]'
          )}
          style={{
            height: 'auto',
            minHeight: '42px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !imageFile) || disabled || isUploading}
          variant="primary"
          size="md"
        >
          {isUploading ? '送信中...' : '送信'}
        </Button>
      </div>
    </div>
  );
};
