import { prisma } from "@/shared/lib/db/prisma";
import type { Plan } from "./plan-limits";

export async function getUserPlan(userId: string): Promise<Plan> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });
  const plan = subscription?.plan ?? "free";
  return (["free", "basic", "premium"].includes(plan) ? plan : "free") as Plan;
}
