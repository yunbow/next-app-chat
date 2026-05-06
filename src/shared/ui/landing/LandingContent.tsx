"use client";

import Link from "next/link";
import {
  Bell,
  Image as ImageIcon,
  LockKeyhole,
  MessageSquare,
  Moon,
  Send,
  Users,
  Zap,
} from "lucide-react";
import { useTranslations } from "@/shared/lib/i18n";

const featureItems = [
  {
    icon: Zap,
    titleKey: "landing.features.realtime.title",
    descriptionKey: "landing.features.realtime.description",
    tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    icon: Users,
    titleKey: "landing.features.group.title",
    descriptionKey: "landing.features.group.description",
    tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
  },
  {
    icon: MessageSquare,
    titleKey: "landing.features.dm.title",
    descriptionKey: "landing.features.dm.description",
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    icon: Bell,
    titleKey: "landing.features.notification.title",
    descriptionKey: "landing.features.notification.description",
    tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  },
] as const;

const workflowItems = [
  {
    titleKey: "landing.workflow.step1Title",
    descriptionKey: "landing.workflow.step1Description",
  },
  {
    titleKey: "landing.workflow.step2Title",
    descriptionKey: "landing.workflow.step2Description",
  },
  {
    titleKey: "landing.workflow.step3Title",
    descriptionKey: "landing.workflow.step3Description",
  },
] as const;

const trustItems = [
  {
    icon: LockKeyhole,
    titleKey: "landing.trust.securityTitle",
    descriptionKey: "landing.trust.securityDescription",
  },
  {
    icon: ImageIcon,
    titleKey: "landing.trust.imageTitle",
    descriptionKey: "landing.trust.imageDescription",
  },
  {
    icon: Moon,
    titleKey: "landing.trust.themeTitle",
    descriptionKey: "landing.trust.themeDescription",
  },
] as const;

export function LandingContent() {
  const { t } = useTranslations();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <section className="relative min-h-[calc(100svh-7rem)] overflow-hidden">
        <img
          src="/brand/landing-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/65 md:bg-[linear-gradient(90deg,rgba(2,6,23,0.90)_0%,rgba(2,6,23,0.72)_42%,rgba(2,6,23,0.22)_100%)]" />

        <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-blue-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              {t("landing.hero.badge")}
            </p>
            <h1 className="text-5xl font-bold leading-[1.02] md:text-7xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-100 md:text-xl">
              {t("landing.hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t("landing.hero.cta")}
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t("landing.hero.secondaryCta")}
              </Link>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-white">
              <div>
                <dt className="text-xl font-bold sm:text-2xl">{t("landing.hero.statRealtime")}</dt>
                <dd className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">
                  {t("landing.hero.statRealtimeLabel")}
                </dd>
              </div>
              <div>
                <dt className="text-xl font-bold sm:text-2xl">{t("landing.hero.statModes")}</dt>
                <dd className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">
                  {t("landing.hero.statModesLabel")}
                </dd>
              </div>
              <div>
                <dt className="text-xl font-bold sm:text-2xl">{t("landing.hero.statSecure")}</dt>
                <dd className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">
                  {t("landing.hero.statSecureLabel")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
              {t("landing.features.title")}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureItems.map(({ icon: Icon, titleKey, descriptionKey, tone }) => (
              <article
                key={titleKey}
                className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm"
              >
                <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold">{t(titleKey)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {t(descriptionKey)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
              {t("landing.workflow.title")}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
              {t("landing.workflow.subtitle")}
            </p>
          </div>

          <div className="grid gap-4">
            {workflowItems.map(({ titleKey, descriptionKey }, index) => (
              <article
                key={titleKey}
                className="grid grid-cols-[2.75rem_1fr] gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-card-foreground">
                    {t(titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(descriptionKey)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
                {t("landing.trust.title")}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
                {t("landing.trust.subtitle")}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {trustItems.map(({ icon: Icon, titleKey, descriptionKey }) => (
                <article
                  key={titleKey}
                  className="rounded-lg border border-border bg-card p-5 shadow-sm"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-5 text-base font-semibold text-card-foreground">
                    {t(titleKey)}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {t(descriptionKey)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              {t("landing.cta.title")}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              {t("landing.cta.description")}
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("landing.hero.cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
