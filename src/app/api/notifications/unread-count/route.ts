import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/db/prisma";
import { auth } from "@/shared/lib/auth/options";
export const dynamic = 'force-dynamic';

/**
 * 未読通知数を取得
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return NextResponse.json({ count });
}
