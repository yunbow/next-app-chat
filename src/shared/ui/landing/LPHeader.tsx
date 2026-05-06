"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "@/shared/lib/i18n";
import type { Locale } from "@/shared/lib/i18n/types";
import { BrandLogo } from "@/shared/ui/common/BrandLogo";

export function LPHeader() {
  const { t } = useTranslations();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { value: Locale; label: string }[] = [
    { value: "ja", label: t("language.ja") },
    { value: "en", label: t("language.en") },
  ];

  const themes = [
    { value: "light", label: t("theme.light"), icon: "☀️" },
    { value: "dark", label: t("theme.dark"), icon: "🌙" },
    { value: "system", label: t("theme.system"), icon: "💻" },
  ];

  const currentTheme = themes.find((th) => th.value === theme) || themes[2];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center space-x-2">
          <BrandLogo
            className="text-2xl font-bold text-gray-900 dark:text-white"
            textClassName="hidden sm:inline"
            text={t("common.appName")}
          />
        </Link>

        <nav className="flex min-w-0 items-center gap-1 sm:gap-2">
          {/* Language Dropdown */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => {
                setIsLangOpen(!isLangOpen);
                setIsThemeOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 sm:px-3"
              aria-label={t("accessibility.selectLanguage")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="hidden sm:inline">{locale === "ja" ? "日本語" : "English"}</span>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      setLocale(lang.value);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      locale === lang.value
                        ? "text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Dropdown */}
          <div ref={themeRef} className="relative">
            <button
              onClick={() => {
                setIsThemeOpen(!isThemeOpen);
                setIsLangOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 sm:px-3"
              aria-label={t("accessibility.selectTheme")}
            >
              {mounted && (
                <>
                  <span className="text-base leading-none">{currentTheme.icon}</span>
                  <span className="hidden sm:inline">{currentTheme.label}</span>
                </>
              )}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isThemeOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                {themes.map((th) => (
                  <button
                    key={th.value}
                    onClick={() => {
                      setTheme(th.value);
                      setIsThemeOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                      theme === th.value
                        ? "text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{th.icon}</span>
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/login"
            className="px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white sm:px-4"
          >
            {t("common.login")}
          </Link>

          <Link
            href="/register"
            className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:inline-flex"
          >
            {t("common.register")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
