import { NextRequest } from "next/server";
import { handleCronRequest } from "@/lib/jobs/cleanup-notifications";
import { assertCronAuth } from "@/lib/security/cron-auth";

/**
 * Cron Job: 古い通知を削除
 * CRON_SECRET Bearer 認証。未設定時は fail-closed で 500 を返す。
 */
export async function GET(request: NextRequest) {
  const authError = assertCronAuth(request);
  if (authError) return authError;

  return handleCronRequest();
}
