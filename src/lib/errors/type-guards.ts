/**
 * 型ガード関数の統合
 */

import type { ApiResult } from "./api-error";

/**
 * 汎用的な失敗レスポンスの型ガード
 */
export function isFailure<T>(result: ApiResult<T>): result is ApiResult<T> & { success: false } {
  return result.success === false;
}

/**
 * 成功レスポンスの型ガード
 */
export function isSuccess<T>(result: ApiResult<T>): result is ApiResult<T> & { success: true } {
  return result.success === true;
}

/**
 * 特定のエラーコードかどうかをチェック
 */
export function hasErrorCode<T>(
  result: ApiResult<T>,
  code: string
): result is ApiResult<T> & { success: false } {
  return isFailure(result) && result.error.code === code;
}

/**
 * 複数のエラーコードのいずれかに該当するかチェック
 */
export function hasAnyErrorCode<T>(
  result: ApiResult<T>,
  codes: string[]
): result is ApiResult<T> & { success: false } {
  return isFailure(result) && codes.includes(result.error.code);
}
