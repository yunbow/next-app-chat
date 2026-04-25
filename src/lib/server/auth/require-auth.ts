import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth/options";
import { unauthorized, forbidden, FailureResponse } from "@/lib/errors/api-error";

/**
 * 認証済みセッションを取得する
 * 未認証の場合はFailureResponseを返す
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
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
