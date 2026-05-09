"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/ui/button/Button";
import { getImageUrl } from "@/lib/utils/image-url";
import { Skeleton } from "@/shared/ui/skeleton";
import { Pagination } from "@/shared/ui/common/Pagination";

const PAGE_SIZE = 10;

interface Group {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  members?: Array<{ user: { id: string; name: string | null; image: string | null } }>;
  _count?: { members: number; messages: number };
}

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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
        const res = await fetch("/api/groups");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setGroups(data.groups || []);
      } catch {
        // ignore
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
      <div className="max-w-4xl" role="status">
        <div className="flex items-start justify-between mb-6" aria-hidden="true">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-hidden="true">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">グループ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            参加中のグループ一覧
          </p>
        </div>
        <Link href="/groups/new">
          <Button>+ 新しいグループ</Button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            参加中のグループはまだありません
          </p>
          <Link href="/groups/new">
            <Button variant="secondary">最初のグループを作成</Button>
          </Link>
        </div>
      ) : (
        <>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groups.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((group) => (
            <li key={group.id}>
              <Link
                href={`/chat?group=${group.id}`}
                className="block border rounded-lg p-4 hover:bg-accent/50 transition-colors h-full"
              >
                <div className="flex items-start gap-3">
                  {group.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(group.image) || group.image}
                      alt={group.name}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-primary/20 text-primary font-semibold flex items-center justify-center flex-shrink-0">
                      {group.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{group.name}</p>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {group.description}
                      </p>
                    )}
                    {group._count && (
                      <p className="text-xs text-muted-foreground mt-2">
                        メンバー {group._count.members}人 · メッセージ {group._count.messages}件
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(groups.length / PAGE_SIZE)}
          onPageChange={setCurrentPage}
        />
        </>
      )}
    </div>
  );
}
