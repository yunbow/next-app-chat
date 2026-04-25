/**
 * FormData から文字列値を取得する
 */
export function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
}

/**
 * FormData から文字列値を取得する（デフォルト値付き）
 */
export function getStringOrDefault(
  formData: FormData,
  key: string,
  defaultValue: string
): string {
  const value = getString(formData, key);
  return value || defaultValue;
}

/**
 * FormData からJSON配列を取得する
 */
export function getJsonArray<T>(formData: FormData, key: string): T[] {
  const value = getString(formData, key);
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * FormData から複数のファイルを取得する
 */
export function getFiles(formData: FormData, key: string): File[] {
  const values = formData.getAll(key);
  return values.filter((value): value is File => value instanceof File);
}
