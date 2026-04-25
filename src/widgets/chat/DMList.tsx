'use client';

import { Avatar } from '@/shared/ui/avatar/Avatar';
import { cn } from '@/shared/lib/utils/cn';

interface DMUser {
  id: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  status: string;
}

interface DirectMessage {
  id: string;
  otherUser: DMUser;
  lastMessage?: {
    content: string;
    createdAt: Date | string;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
  } | null;
  unreadCount: number;
  updatedAt: Date | string;
}

interface DMListProps {
  directMessages: DirectMessage[];
  selectedDMId?: string;
  onSelectDM: (dmId: string) => void;
}

export const DMList = ({
  directMessages,
  selectedDMId,
  onSelectDM,
}: DMListProps) => {
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return '昨日';
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return d.toLocaleDateString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
      });
    }
  };

  return (
    <div className="px-2 py-1">
      <div className="space-y-1">
        {directMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>DMがありません</p>
            <p className="text-xs mt-2">
              フレンド一覧からDMを開始できます
            </p>
          </div>
        ) : (
          directMessages.map((dm) => (
            <button
              key={dm.id}
              onClick={() => onSelectDM(dm.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                selectedDMId === dm.id
                  ? 'bg-blue-50 hover:bg-blue-100'
                  : 'hover:bg-gray-100'
              )}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar
                  src={dm.otherUser.image || undefined}
                  name={dm.otherUser.name || dm.otherUser.email || 'User'}
                  size="md"
                  status={dm.otherUser.status as 'online' | 'offline' | 'away'}
                />
                {dm.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {dm.unreadCount > 99 ? '99+' : dm.unreadCount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'font-medium text-sm truncate',
                      dm.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                    )}
                  >
                    {dm.otherUser.name || dm.otherUser.email || 'Unknown'}
                  </span>
                  {dm.lastMessage && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(dm.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {dm.lastMessage && (
                  <p
                    className={cn(
                      'text-xs truncate',
                      dm.unreadCount > 0
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500'
                    )}
                  >
                    {dm.lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
