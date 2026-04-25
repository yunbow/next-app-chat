'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/shared/lib/utils/cn';
import { Avatar } from '@/shared/ui/avatar/Avatar';

interface DMUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  status: string;
}

interface DirectMessage {
  id: string;
  otherUser: DMUser;
  unreadCount: number;
  lastMessage?: { content: string; createdAt: string | Date } | null;
  updatedAt?: string | Date;
}

type DMSort = "recent" | "unread" | "name";

const SORT_OPTIONS: Array<{ value: DMSort; label: string }> = [
  { value: "recent", label: "更新順" },
  { value: "unread", label: "未読優先" },
  { value: "name", label: "名前順" },
];

export function ChatSidebarSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const selectedDMId = searchParams.get('dm');

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string | null; image: string | null; status?: string } | null>(null);
  const [dmSearch, setDmSearch] = useState("");
  const [dmSort, setDmSort] = useState<DMSort>("recent");

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {
      // ignore
    }
  };

  const fetchDMs = async () => {
    try {
      const res = await fetch('/api/direct-messages');
      const data = await res.json();
      setDirectMessages(data.directMessages || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDMs();
    fetchCurrentUser();

    const handleDMsUpdate = () => fetchDMs();
    const handleUserUpdate = () => fetchCurrentUser();
    window.addEventListener('chat-dms-updated', handleDMsUpdate);
    window.addEventListener('chat-user-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('chat-dms-updated', handleDMsUpdate);
      window.removeEventListener('chat-user-updated', handleUserUpdate);
    };
  }, []);

  return (
    <div className="border-t">
      {/* Direct Messages */}
      <div>
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            ダイレクトメッセージ
          </span>
          <select
            aria-label="DMの並び替え"
            value={dmSort}
            onChange={(e) => setDmSort(e.target.value as DMSort)}
            className="text-[10px] text-muted-foreground bg-transparent border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {directMessages.length > 0 && (
          <div className="px-3 pb-2">
            <input
              type="search"
              value={dmSearch}
              onChange={(e) => setDmSearch(e.target.value)}
              placeholder="DMを検索..."
              aria-label="DMを検索"
              className="w-full text-xs px-2 py-1.5 border rounded-md bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        <div className="px-2 pb-2 space-y-0.5 max-h-44 overflow-y-auto">
          {directMessages.length === 0 ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">DMなし</p>
          ) : (
            (() => {
              const q = dmSearch.trim().toLowerCase();
              const filtered = directMessages.filter((dm) => {
                if (!q) return true;
                const name = (dm.otherUser.name || dm.otherUser.email || "").toLowerCase();
                const lastMsg = (dm.lastMessage?.content || "").toLowerCase();
                return name.includes(q) || lastMsg.includes(q);
              });

              const sorted = [...filtered].sort((a, b) => {
                if (dmSort === "name") {
                  return (a.otherUser.name || a.otherUser.email || "").localeCompare(
                    b.otherUser.name || b.otherUser.email || ""
                  );
                }
                if (dmSort === "unread") {
                  if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
                }
                const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                return tb - ta;
              });

              const unread = sorted.filter((d) => d.unreadCount > 0);
              const read = sorted.filter((d) => d.unreadCount === 0);

              if (sorted.length === 0) {
                return (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    {q ? "一致するDMがありません" : "DMなし"}
                  </p>
                );
              }

              const renderRow = (dm: DirectMessage) => {
                const isUnread = dm.unreadCount > 0;
                const isSelected = selectedDMId === dm.id;
                return (
                  <button
                    key={dm.id}
                    onClick={() => router.push(`/chat?dm=${dm.id}`)}
                    aria-label={
                      isUnread
                        ? `${dm.otherUser.name || "DM"} (未読 ${dm.unreadCount} 件)`
                        : dm.otherUser.name || "DM"
                    }
                    className={cn(
                      "w-full flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-md transition-colors text-left border-l-2",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50",
                      isUnread
                        ? "border-l-destructive bg-destructive/5"
                        : "border-l-transparent"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={dm.otherUser.image || undefined}
                        name={dm.otherUser.name || dm.otherUser.email || "User"}
                        size="sm"
                        status={dm.otherUser.status as "online" | "offline" | "away"}
                      />
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                          {dm.unreadCount > 9 ? "9+" : dm.unreadCount}
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "truncate text-sm flex-1",
                        isUnread
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {dm.otherUser.name || dm.otherUser.email || "Unknown"}
                    </span>
                    {isUnread && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              };

              return (
                <>
                  {unread.length > 0 && (
                    <>
                      <div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold text-destructive uppercase tracking-wider">
                        未読 {unread.length}
                      </div>
                      {unread.map(renderRow)}
                    </>
                  )}
                  {read.length > 0 && (
                    <>
                      {unread.length > 0 && (
                        <div className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          その他
                        </div>
                      )}
                      {read.map(renderRow)}
                    </>
                  )}
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
