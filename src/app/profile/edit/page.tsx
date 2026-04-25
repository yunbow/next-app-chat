"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/ui/button/Button";
import { Input } from "@/shared/ui/input/Input";
import { Avatar } from "@/shared/ui/avatar/Avatar";

interface CurrentUser {
  id: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  status: string;
}

export default function ProfileEditPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState<"online" | "offline" | "away">("online");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const u: CurrentUser = data.user;
        setCurrentUser(u);
        setName(u.name || "");
        setUserId(u.userId || "");
        setStatus((u.status as "online" | "offline" | "away") || "online");
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (!userId.trim()) {
      setError("IDを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          userId: userId.trim(),
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "プロフィールの更新に失敗しました");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("chat-user-updated"));
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "プロフィールの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (authStatus === "loading" || isFetching || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">プロフィール編集</h1>
        <p className="text-sm text-muted-foreground mt-1">
          名前・ID・オンラインステータスを変更できます
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <Avatar
            src={currentUser.image || undefined}
            name={name || currentUser.email || "User"}
            size="xl"
            status={status}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            value={currentUser.email || ""}
            disabled
            className="flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground">メールアドレスは変更できません</p>
        </div>

        <Input
          label="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
        />

        <Input
          label="ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          maxLength={50}
          placeholder="英数字のみ"
        />

        <div>
          <label className="mb-2 block text-sm font-medium">ステータス</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/40">
              <input
                type="radio"
                name="status"
                value="online"
                checked={status === "online"}
                onChange={() => setStatus("online")}
                className="w-4 h-4 text-primary"
              />
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">オンライン</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/40">
              <input
                type="radio"
                name="status"
                value="away"
                checked={status === "away"}
                onChange={() => setStatus("away")}
                className="w-4 h-4 text-primary"
              />
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm font-medium">離席中</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/40">
              <input
                type="radio"
                name="status"
                value="offline"
                checked={status === "offline"}
                onChange={() => setStatus("offline")}
                className="w-4 h-4 text-primary"
              />
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-400 rounded-full" />
                <span className="text-sm font-medium">オフライン</span>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Link href="/dashboard">
            <Button type="button" variant="secondary" disabled={isLoading}>
              キャンセル
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
