export type Plan = "free" | "basic" | "premium";

export const PLAN_LIMITS = {
  free: {
    maxGroups: 3,
    maxMembersPerGroup: 10,
    maxFileSizeBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"] as string[],
  },
  basic: {
    maxGroups: 10,
    maxMembersPerGroup: 50,
    maxFileSizeBytes: 20 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"] as string[],
  },
  premium: {
    maxGroups: Infinity,
    maxMembersPerGroup: Infinity,
    maxFileSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: null as string[] | null, // null = すべて許可
  },
} as const satisfies Record<Plan, {
  maxGroups: number;
  maxMembersPerGroup: number;
  maxFileSizeBytes: number;
  allowedMimeTypes: string[] | null;
}>;

export function getLimits(plan: string) {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}
