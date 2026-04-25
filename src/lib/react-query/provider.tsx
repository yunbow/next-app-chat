"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { getQueryClient } from "./query-client";

/**
 * React Query Provider
 * ガイドライン準拠: App Router対応のProvider実装
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // クライアントサイドでシングルトンQueryClientを使用
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
