import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Edge Runtimeで動作するため、直接定数を定義
const LOCALE_COOKIE_NAME = "locale";
const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = ["ja", "en"];

/**
 * Accept-Languageヘッダーからロケールを検出
 */
function detectLocaleFromAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.split("-")[0].toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (SUPPORTED_LOCALES.includes(code)) {
      return code;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Next.js Middleware
 * - CSRF 対策（Origin/Referer チェック）
 * - CSP (Content Security Policy) ヘッダーの追加
 * - 認証が必要なルートの保護
 * - ブラウザ言語の自動検出
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Request IDの生成と付与
  const requestId = crypto.randomUUID();
  response.headers.set("x-request-id", requestId);

  // ロケールCookieが未設定の場合、Accept-Languageヘッダーから検出
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME);
  if (!localeCookie) {
    const acceptLanguage = request.headers.get("accept-language");
    const detectedLocale = detectLocaleFromAcceptLanguage(acceptLanguage);
    response.cookies.set(LOCALE_COOKIE_NAME, detectedLocale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  // CSRF 対策: 状態変化を伴うメソッドの Origin/Referer チェック
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    let isValidOrigin = false;
    let isValidReferer = false;

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        isValidOrigin = originHost === host;
      } catch {
        isValidOrigin = false;
      }
    }

    if (referer && host) {
      try {
        const refererHost = new URL(referer).host;
        isValidReferer = refererHost === host;
      } catch {
        isValidReferer = false;
      }
    }

    if (!origin && !referer) {
      console.warn(`[${requestId}] CSRF violation: Missing both origin and referer headers`);
      return NextResponse.json(
        { error: "Invalid request: Missing origin or referer", requestId },
        { status: 403 }
      );
    }

    if (!isValidOrigin && !isValidReferer) {
      console.warn(`[${requestId}] CSRF violation: Invalid origin and referer`, {
        origin,
        referer,
        host,
      });
      return NextResponse.json(
        { error: "Invalid origin or referer", requestId },
        { status: 403 }
      );
    }
  }

  // CSP ヘッダーの追加
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://api.dicebear.com;
    font-src 'self';
    connect-src 'self'${isDev ? " ws://localhost:3000 ws://localhost:3001" : ""};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? "" : "upgrade-insecure-requests;"}
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Nonce", nonce);

  // 追加のセキュリティヘッダー
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // 認証チェック（保護されたルートの場合）
  const protectedPaths = ["/chat", "/groups", "/settings"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
