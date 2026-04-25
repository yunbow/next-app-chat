'use client';

import { ImgHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils/cn';
import { getImageUrl } from '@/lib/utils/image-url';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  status?: 'online' | 'offline' | 'away';
}

const FALLBACK_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
];

function getInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return Array.from(trimmed)[0].toUpperCase();
}

function getColorClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export const Avatar = ({
  className,
  size = 'md',
  name,
  status,
  src,
  alt,
  children: _children,
  ...props
}: AvatarProps & { children?: React.ReactNode }) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };

  const imageUrl = getImageUrl(typeof src === 'string' ? src : undefined);
  const displayName = name || 'User';

  return (
    <div className={cn('relative inline-block', className)}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={alt || name || 'Avatar'}
          className={cn('rounded-full object-cover', sizeClasses[size])}
          {...props}
        />
      ) : (
        <div
          role="img"
          aria-label={alt || displayName}
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white select-none',
            sizeClasses[size],
            textSizeClasses[size],
            getColorClass(displayName)
          )}
        >
          {getInitial(displayName)}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-white',
            statusColors[status],
            size === 'xs' && 'h-1.5 w-1.5',
            size === 'sm' && 'h-2 w-2',
            size === 'md' && 'h-2.5 w-2.5',
            size === 'lg' && 'h-3 w-3',
            size === 'xl' && 'h-4 w-4'
          )}
        />
      )}
    </div>
  );
};
