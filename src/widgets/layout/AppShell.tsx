"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/shared/lib/utils";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { LPHeader } from "@/shared/ui/landing/LPHeader";
import { LPFooter } from "@/shared/ui/landing/LPFooter";
import { useTranslations } from "@/shared/lib/i18n";
import { Skeleton } from "@/shared/ui/skeleton";

function SkipLink() {
  const { t } = useTranslations();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
    >
      {t("accessibility.skipToContent")}
    </a>
  );
}

// 自前レイアウトを持つページ（AppShellはchildrenをそのまま返す）
const SELF_LAYOUT_PATHS = ["/", "/login", "/register"];

// LP風ヘッダーを使うページ
const LP_HEADER_PATHS = ["/terms", "/privacy", "/cookies", "/about"];

// 認証不要ページ（ログイン前でも表示）
const PUBLIC_PATHS = ["/terms", "/privacy", "/cookies", "/about", "/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  const isSelfLayout = SELF_LAYOUT_PATHS.includes(pathname);
  const useLPHeader = LP_HEADER_PATHS.some(path => pathname.startsWith(path));
  const isPublicPage = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // 自前レイアウトページ: ローディング中または未ログイン時はそのまま返す
  // ログイン済みの場合はサイドバー付きレイアウトに遷移
  if (isSelfLayout) {
    if (isLoading || !isAuthenticated) {
      return <>{children}</>;
    }
    // isAuthenticated の場合は下のサイドバー付きレイアウトへ
  }

  // LPヘッダーを使う public docs (terms / privacy / cookies / about):
  // 認証状態に関わらず常に LPHeader + LPFooter を表示する。
  if (useLPHeader) {
    return (
      <>
        <SkipLink />
        <LPHeader />
        <main id="main-content">{children}</main>
        <LPFooter />
      </>
    );
  }

  // セッション確認中（保護されたページ）: ローディング表示でフラッシュを防止
  if (isLoading && !isPublicPage) {
    return (
      <div className="flex min-h-screen" role="status">
        <div className="hidden md:flex w-64 shrink-0 border-r flex-col p-4 gap-4" aria-hidden="true">
          <Skeleton className="h-8 w-36" />
          <div className="mt-2 space-y-1">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex-1 p-6 space-y-6" aria-hidden="true">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // ログイン済み: サイドバー（デスクトップ）+ ボトムナビ（モバイル）
  if (isAuthenticated) {
    const isChatPage = pathname.startsWith('/chat');
    return (
      <>
        <SkipLink />
        <div className={cn("flex", isChatPage ? "h-screen overflow-hidden" : "min-h-screen")}>
          <Sidebar />
          <main
            id="main-content"
            className={cn(
              "flex-1",
              isChatPage
                ? "overflow-hidden flex flex-col"
                : "p-4 pb-20 md:pb-4"
            )}
          >
            {children}
          </main>
          <MobileNav />
        </div>
      </>
    );
  }

  // 未ログイン（その他 public pages: login / register など）: LPヘッダーのみ
  // (login/register ページは自前で LPFooter を描画している)
  if (isPublicPage) {
    return (
      <>
        <SkipLink />
        <LPHeader />
        <main id="main-content">{children}</main>
      </>
    );
  }

  // その他: コンテンツのみ
  return (
    <>
      <SkipLink />
      <main id="main-content">{children}</main>
    </>
  );
}
