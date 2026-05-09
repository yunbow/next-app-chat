"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button/Button";
import { useTranslations } from "@/shared/lib/i18n";

const COOKIE_CONSENT_KEY = "cookie-consent";

export function CookieConsent() {
  const { t } = useTranslations();
  const [isVisible, setIsVisible] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem(COOKIE_CONSENT_KEY)
  );

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("cookieConsent.message")}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDecline}
              className="flex-1 sm:flex-none"
            >
              {t("cookieConsent.decline")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAccept}
              className="flex-1 sm:flex-none"
            >
              {t("cookieConsent.accept")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
