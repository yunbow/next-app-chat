"use client";

import { useLocale } from "@/shared/lib/i18n/context";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === "ja" ? "en" : "ja");
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      title={locale === "ja" ? "Switch to English" : "日本語に切り替え"}
      aria-label={locale === "ja" ? "Switch to English" : "日本語に切り替え"}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{locale === "ja" ? "EN" : "JA"}</span>
    </button>
  );
}
