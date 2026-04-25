'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatMessagesWindow } from '@/widgets/chat/ChatMessagesWindow';
import { GroupSettingsModal } from '@/widgets/chat/GroupSettingsModal';
import Link from 'next/link';
import { Button } from '@/shared/ui/button/Button';
import { Avatar } from '@/shared/ui/avatar/Avatar';

interface Group {
  id: string;
  name: string;
  description: string | null;
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

function ChatPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedGroupId = searchParams.get('group');
  const selectedDMId = searchParams.get('dm');

  const [groups, setGroups] = useState<Group[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchDirectMessages = async () => {
    try {
      const res = await fetch('/api/direct-messages');
      const data = await res.json();
      setDirectMessages(data.directMessages || []);
    } catch (error) {
      console.error('Error fetching direct messages:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (session) {
      fetchCurrentUser();
      fetchGroups();
      fetchDirectMessages();
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const selectedDM = directMessages.find((dm) => dm.id === selectedDMId);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat window area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedGroup && currentUser ? (
          <div className="flex-1 flex flex-col h-full bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
              <h2 className="text-lg font-semibold">{selectedGroup.name}</h2>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                title="グループ設定"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <ChatMessagesWindow
              channelId={selectedGroup.id}
              currentUserId={currentUser.id}
              placeholder={`${selectedGroup.name}にメッセージを送信...`}
            />
          </div>
        ) : selectedDM && currentUser ? (
          <div className="flex-1 flex flex-col h-full bg-card">
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-card">
              <Avatar
                src={selectedDM.otherUser.image || undefined}
                name={selectedDM.otherUser.name || selectedDM.otherUser.email || 'User'}
                size="md"
                status={selectedDM.otherUser.status as 'online' | 'offline' | 'away'}
              />
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedDM.otherUser.name || selectedDM.otherUser.email || 'Unknown'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedDM.otherUser.status === 'online' ? 'オンライン' : 'オフライン'}
                </p>
              </div>
            </div>
            <ChatMessagesWindow
              channelId={selectedDM.id}
              currentUserId={currentUser.id}
              placeholder={`${selectedDM.otherUser.name || selectedDM.otherUser.email || 'Unknown'}にメッセージを送信...`}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {groups.length === 0 && directMessages.length === 0
                  ? 'グループまたはDMを開始してください'
                  : 'グループまたはDMを選択してください'}
              </p>
              {groups.length === 0 && (
                <Link href="/groups/new">
                  <Button>グループを作成</Button>
                </Link>
              )}
              {directMessages.length === 0 && (
                <div className="mt-2">
                  <Link href="/friends">
                    <Button variant="secondary">フレンドを探す</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedGroup && (
        <GroupSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          groupDescription={selectedGroup.description || undefined}
          currentUserId={currentUser?.id || ''}
          onUpdated={() => {
            fetchGroups();
          }}
        />
      )}

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
