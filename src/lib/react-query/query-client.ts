import { QueryClient } from "@tanstack/react-query";

/**
 * React Query v5 標準設定
 * ガイドライン準拠: キャッシュ、リトライ、GC、再フェッチ方針を統一
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 60_000,    // 1分
        gcTime: 5 * 60_000,   // 5分（旧cacheTime）
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0, // Mutationは基本的にリトライしない
      },
    },
  });
}

/**
 * サーバーサイド用QueryClient
 * SSR/RSCでの初期データ注入に使用
 */
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // サーバーサイド: 常に新しいインスタンスを作成
    return createQueryClient();
  } else {
    // クライアントサイド: シングルトンを使用
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }
    return browserQueryClient;
  }
}
