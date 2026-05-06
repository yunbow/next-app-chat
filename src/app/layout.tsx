import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css'
import { Providers } from './providers'
import { getServerTranslations, getServerLocale } from '@/shared/lib/i18n/server'
import { CookieConsent } from '@/shared/ui/common/CookieConsent'
import { AppShell } from '@/widgets/layout/AppShell'
import { env } from '@/lib/config/env'

const APP_URL = env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const SITE_NAME = 'next-app-chat'

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
    metadataBase: new URL(APP_URL),
    title: { default: t('metadata.siteTitle'), template: `%s | ${SITE_NAME}` },
    description: t('metadata.siteDescription'),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: APP_URL,
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: { canonical: '/' },
    robots: process.env.VERCEL_ENV === 'production'
      ? { index: true, follow: true }
      : { index: false, follow: false },
    icons: { icon: '/brand/chat-icon.png', apple: '/brand/chat-icon.png' },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
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
