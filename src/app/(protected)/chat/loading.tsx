import { Skeleton } from "@/shared/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* サイドバー */}
      <div className="w-80 border-r p-4 space-y-4" aria-hidden="true">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col" aria-hidden="true">
        {/* ヘッダー */}
        <div className="border-b p-4">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-20 w-3/4 rounded-lg" />
          <Skeleton className="h-20 w-2/3 rounded-lg ml-auto" />
          <Skeleton className="h-20 w-3/4 rounded-lg" />
          <Skeleton className="h-20 w-2/3 rounded-lg ml-auto" />
        </div>

        {/* 入力エリア */}
        <div className="border-t p-4">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}
