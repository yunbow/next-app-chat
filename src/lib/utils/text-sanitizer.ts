/**
 * テキストサニタイザー
 * 危険なUnicode文字やビジュアル攻撃を防ぐ
 */

const DANGEROUS_UNICODE_CHAR_CLASS =
  "[\u202A-\u202E\u2066-\u2069\u200B-\u200F\uFEFF\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]";

const DANGEROUS_UNICODE_PATTERN_GLOBAL = new RegExp(DANGEROUS_UNICODE_CHAR_CLASS, "g");
const DANGEROUS_UNICODE_PATTERN_TEST = new RegExp(DANGEROUS_UNICODE_CHAR_CLASS);

/**
 * 危険なUnicode文字を除去する
 */
export function sanitizeUnicode(text: string): string {
  return text.replace(DANGEROUS_UNICODE_PATTERN_GLOBAL, "");
}

/**
 * テキストに危険なUnicode文字が含まれているかチェック
 */
export function containsDangerousUnicode(text: string): boolean {
  return DANGEROUS_UNICODE_PATTERN_TEST.test(text);
}

/**
 * ホモグラフ攻撃を検出するための混合スクリプトチェック
 */
export function hasMixedScripts(text: string): boolean {
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  const hasGreek = /[\u0370-\u03FF]/.test(text);

  const mixCount = [hasLatin, hasCyrillic, hasGreek].filter(Boolean).length;
  return mixCount > 1;
}

/**
 * 表示用にテキストをサニタイズ
 */
export function sanitizeForDisplay(text: string): string {
  let sanitized = sanitizeUnicode(text);
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n");
  return sanitized;
}
