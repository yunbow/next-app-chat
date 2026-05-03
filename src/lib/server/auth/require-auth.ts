import { unauthorized, forbidden, FailureResponse } from "@/lib/errors/api-error";
import { auth } from "@/shared/lib/auth/options";

/**
 * 認証済みセッションを取得する
 * 未認証の場合はFailureResponseを返す
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.email) {
    return unauthorized();
  }
  // NextAuth v4ではsession.user.idがanyの場合がある
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return unauthorized();
  }
  return { ...session, user: { ...session.user, id: userId } };
}

/**
 * セッション取得結果がエラーかどうかを判定する型ガード
 */
export function isAuthError(
  result: ReturnType<typeof requireAuth> extends Promise<infer T> ? T : never
): result is FailureResponse {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    (result as FailureResponse).success === false
  );
}
