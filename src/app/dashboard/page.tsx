"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { MessageSquareIcon, UsersIcon, BellIcon } from "@/shared/ui/common/icons";
import { Skeleton } from "@/shared/ui/skeleton";

interface GroupSummary {
  id: string;
  name: string;
  image: string | null;
}

interface DMSummary {
  id: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    status: string;
  };
  lastMessage?: { content: string; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [dms, setDms] = useState<DMSummary[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    (async () => {
      try {
        const [groupsRes, dmsRes, notificationsRes] = await Promise.all([
          fetch("/api/groups"),
          fetch("/api/direct-messages"),
          fetch("/api/notifications/unread-count"),
        ]);

        const [groupsData, dmsData, notificationsData] = await Promise.all([
          groupsRes.ok ? groupsRes.json() : { groups: [] },
          dmsRes.ok ? dmsRes.json() : { directMessages: [] },
          notificationsRes.ok ? notificationsRes.json() : { count: 0 },
        ]);

        if (cancelled) return;
        setGroups(groupsData.groups ?? []);
        setDms(dmsData.directMessages ?? []);
        setUnreadNotifications(notificationsData.count ?? 0);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-5xl space-y-6" role="status">
        <div className="space-y-2" aria-hidden="true">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-hidden="true">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!session) return null;

  const totalUnreadDMs = dms.reduce((sum, dm) => sum + dm.unreadCount, 0);
  const recentDMs = dms.slice(0, 5);
  const recentGroups = groups.slice(0, 5);
  const displayName = session.user?.name || session.user?.email || "ユーザー";

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground mt-1">
          こんにちは、{displayName}さん
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="グループ"
          value={groups.length}
          icon={<UsersIcon className="h-5 w-5" />}
          href="/chat"
        />
        <StatCard
          label="未読DM"
          value={totalUnreadDMs}
          sub={`${dms.length} 件のDM中`}
          icon={<MessageSquareIcon className="h-5 w-5" />}
          href="/chat"
          highlight={totalUnreadDMs > 0}
        />
        <StatCard
          label="未読通知"
          value={unreadNotifications}
          icon={<BellIcon className="h-5 w-5" />}
          href="/notifications"
          highlight={unreadNotifications > 0}
        />
      </div>

      {/* Recent DMs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">最近のDM</h2>
          <Link href="/chat" className="text-xs text-primary hover:underline">
            すべて見る
          </Link>
        </div>
        {recentDMs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border rounded-lg">
            DMはまだありません
          </p>
        ) : (
          <ul className="divide-y border rounded-lg overflow-hidden">
            {recentDMs.map((dm) => (
              <li key={dm.id}>
                <Link
                  href={`/chat?dm=${dm.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors"
                >
                  <Avatar
                    src={dm.otherUser.image || undefined}
                    name={dm.otherUser.name || dm.otherUser.email || "User"}
                    size="md"
                    status={dm.otherUser.status as "online" | "offline" | "away"}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p
                        className={`truncate text-sm ${dm.unreadCount > 0 ? "font-semibold" : "font-medium"}`}
                      >
                        {dm.otherUser.name || dm.otherUser.email || "Unknown"}
                      </p>
                      {dm.unreadCount > 0 && (
                        <span className="shrink-0 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5">
                          {dm.unreadCount > 9 ? "9+" : dm.unreadCount}
                        </span>
                      )}
                    </div>
                    {dm.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {dm.lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Groups */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">グループ</h2>
          <Link href="/chat" className="text-xs text-primary hover:underline">
            すべて見る
          </Link>
        </div>
        {recentGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border rounded-lg">
            参加中のグループはありません
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentGroups.map((group) => (
              <li key={group.id}>
                <Link
                  href={`/chat?group=${group.id}`}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {group.image ? (
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center">
                      {group.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate text-sm font-medium">{group.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  href: string;
  highlight?: boolean;
}

function StatCard({ label, value, sub, icon, href, highlight }: StatCardProps) {
  return (
    <Link
      href={href}
      className={`block border rounded-lg p-4 hover:bg-accent/50 transition-colors ${highlight ? "border-destructive/50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${highlight ? "text-destructive" : ""}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`${highlight ? "text-destructive" : "text-muted-foreground"}`}>
          {icon}
        </div>
      </div>
    </Link>
  );
}
