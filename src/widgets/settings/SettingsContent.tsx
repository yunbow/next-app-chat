"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Sun, Moon, Monitor, Globe, ChevronDown, Type, Eye, User, History, KeyRound, Crown, Zap, Star } from "lucide-react";
import { useLocale, useTranslations } from "@/shared/lib/i18n";
import { useFontSize, type FontSize } from "@/shared/lib/font-size";
import { useColorVision, type ColorVisionMode } from "@/shared/lib/color-vision";

type Plan = "free" | "basic" | "premium";

type Subscription = {
  plan: Plan;
  status: string;
};

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
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE_COLORS[plan]}`}>
      <Icon className={`h-3 w-3 ${PLAN_ICON_COLORS[plan]}`} />
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}

// useSyncExternalStore用のマウント状態管理
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function SettingsContent() {
  const { t } = useTranslations();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { colorVisionMode, setColorVisionMode } = useColorVision();

  const { data: subData, isLoading: subLoading } = useQuery<Subscription>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/billing/subscription");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.subscription;
    },
  });

  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  // 現在の言語表示
  const currentLanguageLabel = mounted
    ? locale === "ja"
      ? `🇯🇵 ${t("language.ja")}`
      : `🇺🇸 ${t("language.en")}`
    : "...";

  // 現在のテーマ表示
  const currentThemeLabel = mounted
    ? theme === "light"
      ? t("theme.light")
      : theme === "dark"
        ? t("theme.dark")
        : t("theme.system")
    : "...";

  const currentThemeIcon = mounted
    ? theme === "light"
      ? <Sun className="h-4 w-4" />
      : theme === "dark"
        ? <Moon className="h-4 w-4" />
        : <Monitor className="h-4 w-4" />
    : <Monitor className="h-4 w-4" />;

  // 現在のフォントサイズ表示
  const fontSizeLabels: Record<FontSize, string> = {
    small: t("settings.fontSizeSmall"),
    medium: t("settings.fontSizeMedium"),
    large: t("settings.fontSizeLarge"),
  };
  const currentFontSizeLabel = mounted ? fontSizeLabels[fontSize] : "...";

  // 現在の色覚モード表示
  const colorVisionLabels: Record<ColorVisionMode, string> = {
    normal: t("settings.colorVisionNormal"),
    protanopia: t("settings.colorVisionProtanopia"),
    deuteranopia: t("settings.colorVisionDeuteranopia"),
    tritanopia: t("settings.colorVisionTritanopia"),
  };
  const currentColorVisionLabel = mounted ? colorVisionLabels[colorVisionMode] : "...";

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      <div className="space-y-4">
        {/* サブスクリプション */}
        <Link href="/settings/billing" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  {t("settings.subscription")}
                </span>
                {subLoading ? (
                  <Skeleton className="h-5 w-16 rounded-full" />
                ) : (
                  <PlanBadge plan={subData?.plan ?? "free"} />
                )}
              </CardTitle>
              <CardDescription>{t("settings.subscriptionDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* 外観設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("settings.appearance")}
            </CardTitle>
            <CardDescription>{t("settings.appearanceDescription")}</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-4">
            {/* 言語設定 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("settings.language")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.languageDescription")}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px] justify-between" aria-label={t("accessibility.selectLanguage")}>
                    {currentLanguageLabel}
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLocale("ja")}>
                    <span className="mr-2" aria-hidden="true">🇯🇵</span>
                    {t("language.ja")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocale("en")}>
                    <span className="mr-2" aria-hidden="true">🇺🇸</span>
                    {t("language.en")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* テーマ設定 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("settings.theme")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.themeDescription")}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px] justify-between" aria-label={t("accessibility.selectTheme")}>
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{currentThemeIcon}</span>
                      {currentThemeLabel}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("theme.light")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("theme.dark")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("theme.system")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* フォントサイズ設定 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("settings.fontSize")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.fontSizeDescription")}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px] justify-between" aria-label={t("accessibility.selectFontSize")}>
                    <span className="flex items-center gap-2">
                      <Type className="h-4 w-4" aria-hidden="true" />
                      {currentFontSizeLabel}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFontSize("small")}>
                    <span className="mr-2 text-sm" aria-hidden="true">A</span>
                    {t("settings.fontSizeSmall")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontSize("medium")}>
                    <span className="mr-2 text-base" aria-hidden="true">A</span>
                    {t("settings.fontSizeMedium")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontSize("large")}>
                    <span className="mr-2 text-lg" aria-hidden="true">A</span>
                    {t("settings.fontSizeLarge")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 色覚サポート設定 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("settings.colorVision")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.colorVisionDescription")}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[180px] justify-between" aria-label={t("accessibility.selectColorVision")}>
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      {currentColorVisionLabel}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setColorVisionMode("normal")}>
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("settings.colorVisionNormal")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setColorVisionMode("protanopia")}>
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("settings.colorVisionProtanopia")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setColorVisionMode("deuteranopia")}>
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("settings.colorVisionDeuteranopia")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setColorVisionMode("tritanopia")}>
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("settings.colorVisionTritanopia")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>

        {/* アカウント情報リンク */}
        <Link href="/settings/account" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("settings.account")}
              </CardTitle>
              <CardDescription>{t("settings.accountDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* ログイン履歴リンク */}
        <Link href="/settings/login-history" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                {t("settings.loginHistory")}
              </CardTitle>
              <CardDescription>{t("settings.loginHistoryDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* パスワード変更リンク */}
        <Link href="/settings/password" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                {t("settings.changePassword")}
              </CardTitle>
              <CardDescription>{t("settings.changePasswordDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
