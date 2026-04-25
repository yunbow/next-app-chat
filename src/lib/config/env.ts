import "server-only";
import { z } from "zod";

// See next-app-post/src/lib/config/env.ts for canonical template rationale.
// NOTE: GitHub OAuth は Auth.js v5 命名 (GITHUB_ID / GITHUB_SECRET) を使用し、
// Google は v4 命名 (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) のまま。混在は実コード準拠。
const optionalString = <T extends z.ZodTypeAny>(inner: T) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    inner.optional(),
  );
const optionalUrl = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.url().optional(),
  );
const optionalEmail = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    z.email().optional(),
  );

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LOG_LEVEL: optionalString(
      z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
    ),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    NEXTAUTH_SECRET: z
      .string()
      .min(32, "NEXTAUTH_SECRET must be at least 32 chars"),
    NEXTAUTH_URL: z.url("NEXTAUTH_URL must be a valid URL"),

    GOOGLE_CLIENT_ID: optionalString(z.string().min(1)),
    GOOGLE_CLIENT_SECRET: optionalString(z.string().min(1)),
    GITHUB_ID: optionalString(z.string().min(1)),
    GITHUB_SECRET: optionalString(z.string().min(1)),

    SMTP_HOST: optionalString(z.string().min(1)),
    SMTP_PORT: optionalString(z.string().min(1)),
    SMTP_USER: optionalString(z.string().min(1)),
    SMTP_PASSWORD: optionalString(z.string().min(1)),
    SMTP_FROM_EMAIL: optionalEmail(),
    SMTP_FROM_NAME: optionalString(z.string().min(1)),

    ENCRYPTION_KEY: optionalString(
      z
        .string()
        .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY must be 64 hex chars"),
    ),

    UPSTASH_REDIS_REST_URL: optionalUrl(),
    UPSTASH_REDIS_REST_TOKEN: optionalString(z.string().min(1)),

    // Pusher server-side + client-side keys
    PUSHER_APP_ID: optionalString(z.string().min(1)),
    PUSHER_KEY: optionalString(z.string().min(1)),
    PUSHER_SECRET: optionalString(z.string().min(1)),
    PUSHER_CLUSTER: optionalString(z.string().min(1)),
    NEXT_PUBLIC_PUSHER_KEY: optionalString(z.string().min(1)),
    NEXT_PUBLIC_PUSHER_CLUSTER: optionalString(z.string().min(1)),

    CRON_SECRET: optionalString(z.string().min(32)),

    NEXT_PUBLIC_APP_URL: optionalUrl(),

    // Cloudflare R2 / MinIO (S3 互換) — 4 つすべてセットするか、すべて未設定にすること
    R2_ACCESS_KEY_ID: optionalString(z.string().min(1)),
    R2_SECRET_ACCESS_KEY: optionalString(z.string().min(1)),
    R2_BUCKET_NAME: optionalString(z.string().min(1)),
    R2_ENDPOINT: optionalString(z.string().min(1)),
    R2_PUBLIC_URL: optionalString(z.string().min(1)),
  })
  .superRefine((v, ctx) => {
    const pairs: Array<[string, Array<string | undefined>]> = [
      ["Google OAuth", [v.GOOGLE_CLIENT_ID, v.GOOGLE_CLIENT_SECRET]],
      ["GitHub OAuth", [v.GITHUB_ID, v.GITHUB_SECRET]],
      ["Upstash Redis", [v.UPSTASH_REDIS_REST_URL, v.UPSTASH_REDIS_REST_TOKEN]],
      ["R2 Storage", [v.R2_ACCESS_KEY_ID, v.R2_SECRET_ACCESS_KEY, v.R2_BUCKET_NAME, v.R2_ENDPOINT]],
      [
        "Pusher (server)",
        [v.PUSHER_APP_ID, v.PUSHER_KEY, v.PUSHER_SECRET, v.PUSHER_CLUSTER],
      ],
      [
        "Pusher (public)",
        [v.NEXT_PUBLIC_PUSHER_KEY, v.NEXT_PUBLIC_PUSHER_CLUSTER],
      ],
    ];
    for (const [name, keys] of pairs) {
      const setCount = keys.filter(
        (k) => k !== undefined && k.length > 0,
      ).length;
      if (setCount !== 0 && setCount !== keys.length) {
        ctx.addIssue({
          code: "custom",
          message: `${name} keys must be all-set or all-unset`,
        });
      }
    }
    const smtpCore = [v.SMTP_HOST, v.SMTP_USER, v.SMTP_PASSWORD];
    const smtpSet = smtpCore.filter(
      (k) => k !== undefined && k.length > 0,
    ).length;
    if (smtpSet !== 0 && smtpSet !== smtpCore.length) {
      ctx.addIssue({
        code: "custom",
        message:
          "SMTP_HOST / SMTP_USER / SMTP_PASSWORD must be all-set or all-unset",
      });
    }
  });

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = JSON.stringify(
    z.flattenError(parsed.error).fieldErrors,
    null,
    2,
  );
  throw new Error(`Invalid environment variables:\n${formatted}`);
}

export const env = parsed.data;
