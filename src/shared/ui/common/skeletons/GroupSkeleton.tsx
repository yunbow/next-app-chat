export function GroupSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}

export function GroupListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <GroupSkeleton key={i} />
      ))}
    </div>
  );
}
