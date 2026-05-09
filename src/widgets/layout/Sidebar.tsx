"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/shared/lib/utils";
import { getImageUrl } from "@/lib/utils/image-url";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { useState, Suspense } from "react";
import { ChatSidebarSection } from "@/widgets/chat/ChatSidebarSection";
import {
  DashboardIcon,
  MessageSquareIcon,
  UsersIcon,
  GroupIcon,
  PlusCircleIcon,
  BellIcon,
  UserIcon,
  SettingsIcon,
} from "@/shared/ui/common/icons";
import { BrandLogo } from "@/shared/ui/common/BrandLogo";
import { useTranslations } from "@/shared/lib/i18n";
import { ChevronLeft, ChevronRight, Crown, Zap, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type Plan = "free" | "basic" | "premium";

const PLAN_BADGE_COLORS: Record<Plan, string> = {
  free: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const PLAN_ICON_COLORS: Record<Plan, string> = {
  free: "text-slate-500",
  basic: "text-blue-500",
  premium: "text-amber-500",
};

function PlanBadge({ plan }: { plan: Plan }) {
  const Icon = plan === "premium" ? Crown : plan === "basic" ? Zap : Star;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${PLAN_BADGE_COLORS[plan]}`}>
      <Icon className={`h-3 w-3 ${PLAN_ICON_COLORS[plan]}`} />
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}

type NavItem = {
  labelKey: "dashboard" | "chats" | "friends" | "groups" | "createGroup" | "notifications" | "profile" | "settings";
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: <DashboardIcon />, authRequired: true },
  { labelKey: "chats", href: "/chat", icon: <MessageSquareIcon />, authRequired: true },
  { labelKey: "friends", href: "/friends", icon: <UsersIcon />, authRequired: true },
  { labelKey: "groups", href: "/groups", icon: <GroupIcon />, authRequired: true },
  { labelKey: "createGroup", href: "/groups/new", icon: <PlusCircleIcon />, authRequired: true },
  { labelKey: "notifications", href: "/notifications", icon: <BellIcon />, authRequired: true },
  { labelKey: "profile", href: "/profile/edit", icon: <UserIcon />, authRequired: true },
  { labelKey: "settings", href: "/settings", icon: <SettingsIcon />, authRequired: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();

  const { data: subData } = useQuery<{ plan: Plan }>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/billing/subscription");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.subscription;
    },
    enabled: !!session,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    setIsDialogOpen(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r h-screen sticky top-0 overflow-hidden transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* ロゴ + 開閉ボタン */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link
          href="/"
          className={cn("text-xl font-bold", isCollapsed && "mx-auto")}
          aria-label={t("accessibility.homeLink")}
        >
          <BrandLogo
            showText={!isCollapsed}
            iconClassName="h-8 w-8"
            text={t("common.appName")}
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const newState = !isCollapsed;
            setIsCollapsed(newState);
            if (typeof window !== 'undefined') {
              localStorage.setItem('sidebar-collapsed', String(newState));
            }
          }}
          className={cn(isCollapsed && "mx-auto")}
          title={isCollapsed ? t("nav.expand") : t("nav.collapse")}
          aria-label={isCollapsed ? t("nav.expand") : t("nav.collapse")}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
      <nav className="flex flex-col gap-2 p-4">
        {filteredNavItems.map((item) => {
          const className = cn(
            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground relative",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
            isCollapsed ? "justify-center px-2" : "gap-3"
          );
          const content = (
            <>
              <span aria-hidden="true" className="transition-transform duration-200">{item.icon}</span>
              {!isCollapsed && (
                <span className="transition-opacity duration-200 whitespace-nowrap">
                  {t(`nav.${item.labelKey}`)}
                </span>
              )}
            </>
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={className}
              title={isCollapsed ? t(`nav.${item.labelKey}`) : undefined}
              aria-label={t(`nav.${item.labelKey}`)}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>
      {pathname.startsWith('/chat') && !isCollapsed && (
        <Suspense>
          <ChatSidebarSection />
        </Suspense>
      )}
      </div>

      {/* ユーザー情報（下部固定） */}
      {session && (
        <div className="border-t p-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isCollapsed ? "justify-center px-2" : "gap-3"
                )}
                aria-label={t("accessibility.userMenu")}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getImageUrl(session.user?.image)} />
                  <AvatarFallback>
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm truncate">
                        {session.user?.name || t("common.nameNotSet")}
                      </p>
                      {subData?.plan && <PlanBadge plan={subData.plan} />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user?.username
                        ? `@${session.user.username}`
                        : session.user?.email || ""}
                    </p>
                  </div>
                )}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("logout.title")}</DialogTitle>
                <DialogDescription>
                  {t("logout.confirm")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                >
                  {t("common.logout")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </aside>
  );
}
