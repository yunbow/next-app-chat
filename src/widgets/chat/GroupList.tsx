'use client';

import { Avatar } from '@/shared/ui/avatar/Avatar';
import { cn } from '@/shared/lib/utils/cn';

interface Group {
  id: string;
  name: string;
  image: string | null;
  members: Array<{
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  messages?: Array<{
    content: string;
    createdAt: Date | string;
    sender: {
      name: string | null;
    };
  }>;
}

interface GroupListProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup?: () => void;
}

export const GroupList = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
}: GroupListProps) => {
  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨日';
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return d.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">グループ</h2>
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title="新しいグループを作成"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
        <div className="space-y-1">
          {groups.map((group) => {
            const lastMessage = group.messages?.[0];
            const isSelected = selectedGroupId === group.id;

            return (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg transition-colors',
                  'hover:bg-gray-100',
                  isSelected && 'bg-blue-50 hover:bg-blue-100'
                )}
              >
                <Avatar
                  src={group.image || undefined}
                  name={group.name}
                  size="md"
                />

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {group.name}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  {lastMessage ? (
                    <p className="text-xs text-gray-600 truncate">
                      {lastMessage.sender.name}: {lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">メッセージなし</p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    {group.members.length}人のメンバー
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
