import { Skeleton } from "@/shared/ui/skeleton";

export default function GroupsLoading() {
  return (
    <div className="container max-w-6xl py-8 space-y-6" role="status" aria-label="Loading">
      {/* ヘッダー */}
      <div className="flex items-center justify-between" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* フィルタ */}
      <div className="flex flex-col md:flex-row gap-4" aria-hidden="true">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-[200px]" />
      </div>

      {/* グループ一覧 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
