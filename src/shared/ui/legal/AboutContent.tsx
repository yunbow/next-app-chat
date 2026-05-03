"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Mail, FileText } from "lucide-react";
import { useLocale } from "@/shared/lib/i18n";

const COPY = {
  ja: {
    title: "作成者",
    authorName: "yunbow",
    serviceTitle: "本サービスについて",
    serviceDescription:
      "Chat は、リアルタイムチャット機能を備えたモダンな Web アプリケーションです。学習目的で個人開発しています。",
    opensInNewTab: (name: string) => `${name}（新しいタブで開きます）`,
  },
  en: {
    title: "About",
    authorName: "yunbow",
    serviceTitle: "About this service",
    serviceDescription:
      "Chat is a modern web application with real-time messaging features, developed individually for learning purposes.",
    opensInNewTab: (name: string) => `${name} (opens in new tab)`,
  },
} as const;

export function AboutContent() {
  const { locale } = useLocale();
  const t = COPY[locale === "ja" ? "ja" : "en"];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">{t.authorName}</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <a
                  href="mailto:yunbow.dev@gmail.com"
                  className="text-primary hover:underline"
                >
                  yunbow.dev@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <a
                  href="https://github.com/yunbow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  aria-label={t.opensInNewTab("GitHub")}
                >
                  GitHub
                </a>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <a
                  href="https://qiita.com/yun_bow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  aria-label={t.opensInNewTab("Qiita")}
                >
                  Qiita
                </a>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <a
                  href="https://zenn.dev/yun_bow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  aria-label={t.opensInNewTab("Zenn")}
                >
                  Zenn
                </a>
              </div>

              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <a
                  href="https://twitter.com/yun_bow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  aria-label={t.opensInNewTab("X (Twitter)")}
                >
                  X (Twitter)
                </a>
              </div>
            </div>
          </section>

          <section className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-3">{t.serviceTitle}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t.serviceDescription}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
