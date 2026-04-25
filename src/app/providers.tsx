'use client';

import { SessionProvider } from 'next-auth/react';
import { LocaleProvider } from '@/shared/lib/i18n/context';
import type { Locale } from '@/shared/lib/i18n/types';
import { FontSizeProvider } from '@/shared/lib/font-size';
import { ColorVisionProvider } from '@/shared/lib/color-vision';
import { ThemeProvider } from 'next-themes';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <FontSizeProvider>
          <ColorVisionProvider>
            <LocaleProvider>
              {children}
            </LocaleProvider>
          </ColorVisionProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
