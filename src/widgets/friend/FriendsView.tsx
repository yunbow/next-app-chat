"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button/Button";
import { Input } from "@/shared/ui/input/Input";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { cn } from "@/shared/lib/utils/cn";
import { Pagination } from "@/shared/ui/common/Pagination";

const PAGE_SIZE = 10;

interface User {
  id: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  status: string;
}

interface Friend {
  id: string;
  userId: string;
  friendId: string;
  user: User;
  friend: User;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface FriendsViewProps {
  currentUserId: string;
  onStartDM?: (friendUserId: string) => void | Promise<void>;
}

export const FriendsView = ({ currentUserId, onStartDM }: FriendsViewProps) => {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "search">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [friendsPage, setFriendsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends?status=accepted");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/friends?status=pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.friends || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  useEffect(() => {
    setSearchPage(1);
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
          const allFriendships = [...friends, ...pendingRequests];
          const filtered = (data.users || []).filter(
            (user: User) =>
              user.id !== currentUserId &&
              !allFriendships.some((f) => f.userId === user.id || f.friendId === user.id)
          );
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId, friends, pendingRequests]);

  const handleSendRequest = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: userId }),
      });
      if (res.ok) {
        alert("フレンド申請を送信しました");
        setSearchQuery("");
        setSearchResults([]);
      } else {
        const data = await res.json();
        alert(data.error || "フレンド申請に失敗しました");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("フレンド申請に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      if (res.ok) {
        await fetchFriends();
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (friendId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (res.ok) {
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("このフレンドを削除しますか？")) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/friends/${friendId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchFriends();
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const incomingRequests = pendingRequests.filter((req) => req.friendId === currentUserId);

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab("friends"); setFriendsPage(1); }}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "friends"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          フレンド ({friends.length})
        </button>
        <button
          onClick={() => { setActiveTab("requests"); setRequestsPage(1); }}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "requests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          申請 ({incomingRequests.length})
        </button>
        <button
          onClick={() => { setActiveTab("search"); setSearchPage(1); }}
          className={cn(
            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "search"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          検索
        </button>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {activeTab === "friends" && (
          <div className="space-y-3">
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">フレンドがいません</p>
            ) : (
              <>
              {friends.slice((friendsPage - 1) * PAGE_SIZE, friendsPage * PAGE_SIZE).map((friendship) => {
                const friendUser =
                  friendship.userId === currentUserId ? friendship.friend : friendship.user;
                return (
                  <div
                    key={friendship.id}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={friendUser.image || undefined}
                        name={friendUser.name || friendUser.email || "User"}
                        size="md"
                        status={friendUser.status as "online" | "offline" | "away"}
                      />
                      <div>
                        <p className="font-medium">{friendUser.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          @{friendUser.userId || friendUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {onStartDM && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onStartDM(friendUser.id)}
                          disabled={isLoading}
                        >
                          DM
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveFriend(friendship.id)}
                        disabled={isLoading}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Pagination
                currentPage={friendsPage}
                totalPages={Math.ceil(friends.length / PAGE_SIZE)}
                onPageChange={setFriendsPage}
              />
              </>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-3">
            {incomingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">申請はありません</p>
            ) : (
              <>
              {incomingRequests.slice((requestsPage - 1) * PAGE_SIZE, requestsPage * PAGE_SIZE).map((request) => {
                const requester = request.user;
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={requester.image || undefined}
                        name={requester.name || requester.email || "User"}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">{requester.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          @{requester.userId || requester.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={isLoading}
                      >
                        承認
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={isLoading}
                      >
                        拒否
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Pagination
                currentPage={requestsPage}
                totalPages={Math.ceil(incomingRequests.length / PAGE_SIZE)}
                onPageChange={setRequestsPage}
              />
              </>
            )}
          </div>
        )}

        {activeTab === "search" && (
          <div>
            <Input
              placeholder="名前またはIDで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="mt-4 space-y-3">
              {isSearching ? (
                <p className="text-center text-muted-foreground py-4">検索中...</p>
              ) : searchQuery.trim().length < 2 ? (
                <p className="text-center text-muted-foreground py-4">
                  2文字以上入力して検索してください
                </p>
              ) : searchResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  ユーザーが見つかりませんでした
                </p>
              ) : (
                <>
                {searchResults.slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.image || undefined}
                        name={user.name || user.email || "User"}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">{user.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          @{user.userId || user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendRequest(user.id)}
                      disabled={isLoading}
                    >
                      申請
                    </Button>
                  </div>
                ))}
                <Pagination
                  currentPage={searchPage}
                  totalPages={Math.ceil(searchResults.length / PAGE_SIZE)}
                  onPageChange={setSearchPage}
                />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
