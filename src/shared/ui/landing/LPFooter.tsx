"use client";

import Link from "next/link";
import { useTranslations } from "@/shared/lib/i18n";

export function LPFooter() {
  const { t } = useTranslations();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/cookies" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("footer.cookies")}
            </Link>
            <Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("footer.about")}
            </Link>
          </nav>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
