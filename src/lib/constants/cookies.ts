import type { CookieOptions } from "@/lib/utils/cookie-manager";

export const COOKIE_NAMES = {
  LOCALE: "NEXT_LOCALE",
  THEME: "theme",
} as const;

export const DEFAULT_COOKIE_OPTIONS: Required<CookieOptions> = {
  maxAgeDays: 365,
  path: "/",
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
} as const;

export const COOKIE_OPTIONS: Record<string, CookieOptions> = {
  [COOKIE_NAMES.LOCALE]: {
    maxAgeDays: 365,
    path: "/",
    sameSite: "Lax",
  },
  [COOKIE_NAMES.THEME]: {
    maxAgeDays: 365,
    path: "/",
    sameSite: "Lax",
  },
} as const;
