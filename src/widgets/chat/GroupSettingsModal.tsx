'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button/Button';
import { Input } from '@/shared/ui/input/Input';
import { Avatar } from '@/shared/ui/avatar/Avatar';
import { cn } from '@/shared/lib/utils/cn';

interface GroupMember {
  id: string;
  role: string;
  user: {
    id: string;
    userId: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  groupDescription?: string;
  currentUserId: string;
  onUpdated: () => void;
}

export const GroupSettingsModal = ({
  isOpen,
  onClose,
  groupId,
  groupName: initialName,
  groupDescription: initialDescription,
  currentUserId,
  onUpdated,
}: GroupSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'members'>('info');
  const [groupName, setGroupName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription || '');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    userId: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setGroupName(initialName);
    setDescription(initialDescription || '');
  }, [initialName, initialDescription]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.group.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'members') {
      fetchMembers();
    }
  }, [isOpen, activeTab, groupId]);

  // ユーザー検索
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/users?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // 既にメンバーのユーザーを除外
          const filtered = (data.users || []).filter(
            (user: any) => !members.some((m) => m.user.id === user.id)
          );
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, members]);

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('グループ名を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'グループの更新に失敗しました');
      }

      onUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
      setError(error instanceof Error ? error.message : 'グループの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setSearchQuery('');
        setSearchResults([]);
        await fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || 'メンバーの追加に失敗しました');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('メンバーの追加に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('このメンバーを削除しますか？')) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/groups/${groupId}/members?userId=${memberId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || 'メンバーの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('メンバーの削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentMember = members.find((m) => m.user.id === currentUserId);
  const isAdmin = currentMember?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">グループ設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            グループ情報
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            メンバー ({members.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateGroup} className="space-y-6">
              {isAdmin ? (
                <Input
                  label="グループ名"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  maxLength={100}
                />
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    グループ名
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    disabled
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  説明（任意）
                </label>
                <textarea
                  className={cn(
                    'flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
                    'resize-none',
                    isAdmin
                      ? 'bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  )}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                  disabled={!isAdmin}
                />
                {isAdmin && (
                  <p className="mt-1 text-xs text-gray-500">{description.length}/500</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {isAdmin && (
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={onClose}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? '保存中...' : '保存'}
                  </Button>
                </div>
              )}

              {!isAdmin && (
                <p className="text-sm text-gray-500 text-center">
                  管理者のみ編集できます
                </p>
              )}
            </form>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* メンバー追加（管理者のみ） */}
              {isAdmin && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">メンバーを追加</h3>
                  <Input
                    placeholder="名前またはIDで検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {isSearching && (
                    <p className="text-sm text-gray-500 text-center py-2">検索中...</p>
                  )}

                  {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">ユーザーが見つかりませんでした</p>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={user.image || undefined}
                              name={user.name || user.email || 'User'}
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">@{user.userId || user.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddMember(user.id)}
                            disabled={isLoading}
                          >
                            追加
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* メンバー一覧 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">メンバー一覧</h3>
                <div className="space-y-3">
                  {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.user.image || undefined}
                      name={member.user.name || member.user.email || 'User'}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.user.name || 'Unknown'}
                        </p>
                        {member.role === 'admin' && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            管理者
                          </span>
                        )}
                        {member.user.id === currentUserId && (
                          <span className="text-xs text-gray-500">(あなた)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{member.user.userId || member.user.email}</p>
                    </div>
                  </div>

                  {isAdmin && member.user.id !== currentUserId && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={isLoading}
                    >
                      削除
                    </Button>
                  )}
                </div>
              ))}
                </div>
              </div>

              {/* 一般メンバー向けメッセージ */}
              {!isAdmin && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  管理者のみ編集できます
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
