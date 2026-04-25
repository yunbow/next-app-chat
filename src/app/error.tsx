"use client";

import { ErrorContent } from "@/shared/ui/common/ErrorContent";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent onRetry={reset} />;
}
