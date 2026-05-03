"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FriendsView } from "@/widgets/friend/FriendsView";

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
        const res = await fetch("/api/users/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCurrentUserId(data.user?.id ?? null);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleStartDM = async (friendUserId: string) => {
    try {
      const res = await fetch("/api/direct-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: friendUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("chat-dms-updated"));
        }
        router.push(`/chat?dm=${data.directMessage.id}`);
      }
    } catch (error) {
      console.error("Error starting DM:", error);
    }
  };

  if (status === "loading" || !currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">フレンド管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          フレンド一覧・申請の管理・ユーザー検索ができます
        </p>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <FriendsView currentUserId={currentUserId} onStartDM={handleStartDM} />
      </div>
    </div>
  );
}
