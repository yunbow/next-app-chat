import { NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth/options";
import { prisma } from "@/shared/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.subscription) {
    return NextResponse.json({
      subscription: {
        plan: "free",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });
  }

  return NextResponse.json({ subscription: user.subscription });
}
