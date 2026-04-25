"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Button } from "@/shared/ui/button/Button";
import { cn } from "@/shared/lib/utils/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { Pagination } from "@/shared/ui/common/Pagination";

const PAGE_SIZE = 10;

interface Notification {
  id: string;
  type: "friend_request" | "message" | "group_invite";
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedUser?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchNotifications();
  }, [status]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return d.toLocaleDateString("ja-JP");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        );
      case "message":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      case "group_invite":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-3xl" role="status">
        <div className="flex items-start justify-between mb-6" aria-hidden="true">
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!session) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">通知</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `未読 ${unreadCount} 件` : "新しい通知はありません"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            すべて既読
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-muted-foreground">通知はありません</p>
        </div>
      ) : (
        <>
        <ul className="space-y-3">
          {notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((notification) => (
            <li
              key={notification.id}
              className={cn(
                "p-4 rounded-lg hover:bg-accent/40 transition-colors border",
                !notification.isRead
                  ? "bg-primary/5 border-primary/30"
                  : "bg-card border-border"
              )}
            >
              <div className="flex gap-3">
                {notification.relatedUser ? (
                  <Avatar
                    src={notification.relatedUser.image || undefined}
                    name={notification.relatedUser.name || "User"}
                    size="md"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.isRead && (
                      <span
                        className="ml-2 block w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"
                        aria-label="未読"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(notifications.length / PAGE_SIZE)}
          onPageChange={setCurrentPage}
        />
        </>
      )}
    </div>
  );
}
