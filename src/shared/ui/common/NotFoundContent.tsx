"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";

type NotFoundContentProps = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export function NotFoundContent({
  title = "ページが見つかりません",
  description = "お探しのページは存在しないか、移動した可能性があります。",
  backHref = "/",
  backLabel = "ホームに戻る",
}: NotFoundContentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Link
        href={backHref}
        className="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 text-base"
      >
        {backLabel}
      </Link>
    </div>
  );
}
