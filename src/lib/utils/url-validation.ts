/**
 * URL検証ユーティリティ
 * XSS攻撃（javascript:, data: URI等）を防止するための安全なURL検証
 */

/**
 * 安全な画像URLかどうかを検証
 */
export function isSafeImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.startsWith("/uploads/")) {
    return true;
  }

  try {
    const parsed = new URL(trimmedUrl);

    if (parsed.protocol !== "https:") {
      return false;
    }

    if (!parsed.hostname) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 安全なプロフィール画像URLかどうかを検証
 */
export function isSafeProfileImageUrl(url: string): boolean {
  return isSafeImageUrl(url);
}

/**
 * 危険なURLスキームのリスト
 */
const DANGEROUS_SCHEMES = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
];

/**
 * URLが危険なスキームを含んでいないかチェック
 */
export function hasDangerousScheme(url: string): boolean {
  const lowerUrl = url.toLowerCase().trim();
  return DANGEROUS_SCHEMES.some((scheme) => lowerUrl.startsWith(scheme));
}
