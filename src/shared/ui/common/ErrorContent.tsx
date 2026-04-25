"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button/Button";

type ErrorContentProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorContent({
  title = "エラーが発生しました",
  description = "予期しないエラーが発生しました。しばらくしてからもう一度お試しください。",
  onRetry,
}: ErrorContentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {onRetry && (
        <Button onClick={onRetry}>再試行</Button>
      )}
    </div>
  );
}
