import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css'
import { Providers } from './providers'
import { getServerTranslations, getServerLocale } from '@/shared/lib/i18n/server'
import { CookieConsent } from '@/shared/ui/common/CookieConsent'
import { AppShell } from '@/widgets/layout/AppShell'

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations()

  return {
    title: t('metadata.siteTitle'),
    description: t('metadata.siteDescription'),
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getServerLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${notoSansJp.variable} antialiased`}
      >
        <Providers>
          <AppShell>
            {children}
          </AppShell>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
