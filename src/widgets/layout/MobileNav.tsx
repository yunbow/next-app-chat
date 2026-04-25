"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "@/shared/lib/i18n";
import {
  DashboardIcon,
  MessageSquareIcon,
  UsersIcon,
  BellIcon,
  UserIcon,
} from "@/shared/ui/common/icons";

type MobileNavItem = {
  labelKey: "dashboard" | "chats" | "friends" | "notifications" | "profile";
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
};

const mobileNavItems: MobileNavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: <DashboardIcon className="h-6 w-6" />, authRequired: true },
  { labelKey: "chats", href: "/chat", icon: <MessageSquareIcon className="h-6 w-6" />, authRequired: true },
  { labelKey: "friends", href: "/friends", icon: <UsersIcon className="h-6 w-6" />, authRequired: true },
  { labelKey: "notifications", href: "/notifications", icon: <BellIcon className="h-6 w-6" />, authRequired: true },
  { labelKey: "profile", href: "/profile/edit", icon: <UserIcon className="h-6 w-6" />, authRequired: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();

  const filteredNavItems = mobileNavItems.filter((item) => {
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-bottom" aria-label={t("accessibility.mobileNavigation")}>
      <div className="flex justify-around items-center h-16">
        {filteredNavItems.map((item) => {
          const href = item.href;
          const isActive = pathname === item.href;

          const label = t(`nav.${item.labelKey}`);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-[10px] mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
