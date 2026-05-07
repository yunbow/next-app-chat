"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Crown, Zap, Star, CheckCircle2, AlertCircle, Users, FolderOpen, HardDrive, FileType2 } from "lucide-react";
import { useTranslations } from "@/shared/lib/i18n";
import { PLAN_LIMITS, type Plan } from "@/shared/lib/stripe/plan-limits";

type Subscription = {
  plan: Plan;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

async function fetchSubscription(): Promise<Subscription> {
  const res = await fetch("/api/billing/subscription");
  if (!res.ok) throw new Error("Failed to fetch subscription");
  const data = await res.json();
  return data.subscription;
}

async function startCheckout(plan: "basic" | "premium"): Promise<string> {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error("Checkout failed");
  const data = await res.json();
  return data.url;
}

async function openPortal(): Promise<string> {
  const res = await fetch("/api/billing/portal", { method: "POST" });
  if (!res.ok) throw new Error("Portal failed");
  const data = await res.json();
  return data.url;
}

const PLAN_ORDER: Plan[] = ["free", "basic", "premium"];

const PLAN_COLORS: Record<Plan, string> = {
  free: "text-slate-600 dark:text-slate-400",
  basic: "text-blue-600 dark:text-blue-400",
  premium: "text-amber-600 dark:text-amber-400",
};

const PLAN_BADGE_COLORS: Record<Plan, string> = {
  free: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const PLAN_BORDER_COLORS: Record<Plan, string> = {
  free: "border-border",
  basic: "border-blue-400 dark:border-blue-600",
  premium: "border-amber-400 dark:border-amber-600",
};

const PLAN_BG: Record<Plan, string> = {
  free: "",
  basic: "bg-blue-50/30 dark:bg-blue-950/20",
  premium: "bg-amber-50/30 dark:bg-amber-950/20",
};

function PlanIcon({ plan, className }: { plan: Plan; className?: string }) {
  if (plan === "premium") return <Crown className={className} />;
  if (plan === "basic") return <Zap className={className} />;
  return <Star className={className} />;
}

function formatFileSize(bytes: number) {
  return `${bytes / 1024 / 1024}MB`;
}

function formatCount(n: number) {
  return n === Infinity ? "無制限" : `${n}`;
}

function fileTypesLabel(plan: Plan) {
  if (plan === "premium") return "すべて";
  if (plan === "basic") return "画像・PDF";
  return "画像のみ";
}

// プランごとの表示用制限データ
function getPlanFeatures(plan: Plan) {
  const lim = PLAN_LIMITS[plan];
  return [
    {
      icon: FolderOpen,
      label: "グループ作成数",
      value: formatCount(lim.maxGroups),
    },
    {
      icon: Users,
      label: "メンバー上限 / グループ",
      value: formatCount(lim.maxMembersPerGroup) + (lim.maxMembersPerGroup !== Infinity ? "人" : ""),
    },
    {
      icon: HardDrive,
      label: "ファイルサイズ上限",
      value: formatFileSize(lim.maxFileSizeBytes) + "まで",
    },
    {
      icon: FileType2,
      label: "対応ファイル形式",
      value: fileTypesLabel(plan),
    },
  ];
}

// 比較テーブル用の行定義
const COMPARE_ROWS = [
  { label: "グループ作成数", key: "maxGroups", format: formatCount },
  { label: "メンバー上限 / グループ", key: "maxMembersPerGroup", format: (n: number) => formatCount(n) + (n !== Infinity ? "人" : "") },
  { label: "ファイルサイズ上限", key: "maxFileSizeBytes", format: formatFileSize },
  { label: "ファイル形式", key: "allowedMimeTypes", format: (_: unknown, plan: Plan) => fileTypesLabel(plan) },
  { label: "DM・通知", key: "_dm", format: (_: unknown, _p: Plan) => "無制限" },
  { label: "フレンド機能", key: "_friends", format: (_: unknown, _p: Plan) => "利用可能" },
] as const;

export function BillingContent() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<"basic" | "premium" | "portal" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
  });

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setSuccessMsg(t("billing.successMessage"));
      router.replace("/settings/billing");
    } else if (searchParams.get("canceled") === "true") {
      setErrorMsg(t("billing.canceledMessage"));
      router.replace("/settings/billing");
    }
  }, [searchParams, t, router]);

  const currentPlan = data?.plan ?? "free";

  const handleUpgrade = async (plan: "basic" | "premium") => {
    setLoadingPlan(plan);
    setErrorMsg(null);
    try {
      const url = await startCheckout(plan);
      window.location.href = url;
    } catch {
      setErrorMsg(t("billing.checkoutError"));
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setLoadingPlan("portal");
    setErrorMsg(null);
    try {
      const url = await openPortal();
      window.location.href = url;
    } catch {
      setErrorMsg(t("billing.portalError"));
      setLoadingPlan(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  const PLAN_PRICE: Record<Plan, string> = {
    free: t("billing.freePlanPrice"),
    basic: t("billing.basicPlanPrice"),
    premium: t("billing.premiumPlanPrice"),
  };

  const PLAN_TITLE: Record<Plan, string> = {
    free: t("billing.freePlan"),
    basic: t("billing.basicPlan"),
    premium: t("billing.premiumPlan"),
  };

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">{t("billing.title")}</h1>

      {/* フィードバックバナー */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-green-700 dark:text-green-400 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* 現在のプラン */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{t("billing.currentPlan")}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-32" />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <PlanIcon plan={currentPlan} className={`h-5 w-5 ${PLAN_COLORS[currentPlan]}`} />
              <span className={`text-lg font-semibold ${PLAN_COLORS[currentPlan]}`}>
                {PLAN_TITLE[currentPlan]}
              </span>
            </div>
            {data?.cancelAtPeriodEnd && data.currentPeriodEnd && (
              <span className={`text-xs rounded-full px-2.5 py-0.5 ${PLAN_BADGE_COLORS.free}`}>
                {t("billing.cancelAt", { date: formatDate(data.currentPeriodEnd) })}
              </span>
            )}
            {!data?.cancelAtPeriodEnd && currentPlan !== "free" && data?.currentPeriodEnd && (
              <span className="text-xs text-muted-foreground">
                {t("billing.renewsAt", { date: formatDate(data.currentPeriodEnd) })}
              </span>
            )}
            {currentPlan !== "free" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePortal}
                disabled={loadingPlan !== null}
                className="h-7 text-xs"
              >
                {loadingPlan === "portal" ? t("billing.redirecting") : t("billing.manage")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* プランカード */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const isCurrent = plan === currentPlan;
          const planIndex = PLAN_ORDER.indexOf(plan);
          const currentIndex = PLAN_ORDER.indexOf(currentPlan);
          const isUpgrade = planIndex > currentIndex;
          const features = getPlanFeatures(plan);

          return (
            <Card
              key={plan}
              className={`relative flex flex-col border-2 transition-colors ${
                isCurrent ? PLAN_BORDER_COLORS[plan] : "border-border"
              } ${PLAN_BG[plan]}`}
            >
              {isCurrent && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap ${PLAN_BADGE_COLORS[plan]}`}>
                  {t("billing.currentBadge")}
                </span>
              )}

              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-base ${PLAN_COLORS[plan]}`}>
                  <PlanIcon plan={plan} className="h-4 w-4" />
                  {PLAN_TITLE[plan]}
                </CardTitle>
                <p className={`text-2xl font-bold ${PLAN_COLORS[plan]}`}>
                  {PLAN_PRICE[plan]}
                </p>
                <CardDescription className="text-xs">
                  {plan === "free" && t("billing.freePlanDescription")}
                  {plan === "basic" && t("billing.basicPlanDescription")}
                  {plan === "premium" && t("billing.premiumPlanDescription")}
                </CardDescription>
              </CardHeader>

              {/* 機能一覧 */}
              <div className="px-6 pb-4 flex-1 space-y-2">
                {features.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${PLAN_COLORS[plan]}`} />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                      <p className={`text-xs font-medium ${PLAN_COLORS[plan]}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* アクションボタン */}
              <div className="px-6 pb-6">
                {isCurrent ? (
                  plan === "free" ? (
                    <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">
                      現在利用中
                    </div>
                  ) : null
                ) : plan !== "free" ? (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpgrade(plan as "basic" | "premium")}
                    disabled={loadingPlan !== null}
                    variant={isUpgrade ? "default" : "outline"}
                  >
                    {loadingPlan === plan
                      ? t("billing.redirecting")
                      : isUpgrade
                        ? t("billing.upgrade")
                        : t("billing.downgrade")}
                  </Button>
                ) : (
                  <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">
                    —
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 詳細比較テーブル */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">プラン比較</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-2/5">機能</th>
                {PLAN_ORDER.map((plan) => (
                  <th key={plan} className={`text-center px-3 py-2.5 font-semibold ${PLAN_COLORS[plan]}`}>
                    <span className="flex items-center justify-center gap-1">
                      <PlanIcon plan={plan} className="h-3.5 w-3.5" />
                      {PLAN_TITLE[plan]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 1 ? "bg-muted/20" : ""}>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.label}</td>
                  {PLAN_ORDER.map((plan) => {
                    const lim = PLAN_LIMITS[plan];
                    let val: string;
                    if (row.key === "_dm" || row.key === "_friends") {
                      val = row.format(undefined as never, plan);
                    } else if (row.key === "allowedMimeTypes") {
                      val = fileTypesLabel(plan);
                    } else {
                      const raw = lim[row.key as keyof typeof lim] as number;
                      val = (row as { format: (n: number) => string }).format(raw);
                    }
                    const isCur = plan === currentPlan;
                    return (
                      <td
                        key={plan}
                        className={`text-center px-3 py-2.5 text-xs font-medium ${isCur ? PLAN_COLORS[plan] : "text-foreground"}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
