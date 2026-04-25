"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/ui/button/Button";
import { Input } from "@/shared/ui/input/Input";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { cn } from "@/shared/lib/utils/cn";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export default function NewGroupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/users?q=${encodeURIComponent(searchQuery)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleMember = (user: User) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m.id === user.id)
        ? prev.filter((m) => m.id !== user.id)
        : [...prev, user]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!groupName.trim()) {
      setError("グループ名を入力してください");
      return;
    }
    if (groupName.length > 100) {
      setError("グループ名は100文字以内で入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName.trim(),
          description: description.trim() || undefined,
          memberIds: selectedMembers.map((m) => m.id),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "グループの作成に失敗しました");
      }
      const data = await res.json();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("chat-groups-updated"));
      }
      const newGroupId = data.group?.id;
      if (newGroupId) {
        router.push(`/chat?group=${newGroupId}`);
      } else {
        router.push("/groups");
      }
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err instanceof Error ? err.message : "グループの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
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
        <Link href="/groups" className="text-sm text-muted-foreground hover:text-foreground">
          ← グループ一覧へ
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">新しいグループを作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="グループ名"
          placeholder="例: プロジェクトA"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
          maxLength={100}
        />

        <div>
          <label className="mb-2 block text-sm font-medium">説明（任意）</label>
          <textarea
            className={cn(
              "flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            )}
            placeholder="グループの説明を入力してください"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="mt-1 text-xs text-muted-foreground">{description.length}/500</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">メンバーを追加（任意）</label>
          <Input
            placeholder="名前またはメールアドレスで検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery.trim().length >= 2 && (
            <div className="mt-2 border border-border rounded-lg max-h-48 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">検索中...</div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-border">
                  {searchResults.map((user) => {
                    const isSelected = selectedMembers.some((m) => m.id === user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleMember(user)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors",
                          isSelected && "bg-accent"
                        )}
                      >
                        <Avatar
                          src={user.image || undefined}
                          name={user.name || user.email || "User"}
                          size="sm"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium truncate">{user.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  ユーザーが見つかりませんでした
                </div>
              )}
            </div>
          )}

          {selectedMembers.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">
                選択されたメンバー ({selectedMembers.length}人)
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-3 py-1"
                  >
                    <Avatar
                      src={member.image || undefined}
                      name={member.name || member.email || "User"}
                      size="xs"
                    />
                    <span className="text-sm font-medium">{member.name || member.email}</span>
                    <button
                      type="button"
                      onClick={() => toggleMember(member)}
                      className="hover:bg-background/50 rounded-full p-0.5"
                      aria-label="メンバーを削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link href="/groups">
            <Button type="button" variant="secondary" disabled={isLoading}>
              キャンセル
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading || !groupName.trim()}>
            {isLoading ? "作成中..." : "グループを作成"}
          </Button>
        </div>
      </form>
    </div>
  );
}
