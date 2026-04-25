import "next-auth";

/**
 * NextAuth v4 module augmentation.
 *
 * Extends the default Session + User + JWT shapes with app-specific fields
 * so that consumer code can reference `session.user.id` / `token.id` etc.
 * without `as any` / `@ts-ignore` escape hatches.
 *
 * Why this file exists separately from `src/shared/lib/auth/options.ts`:
 *   - The augmentation must be a `.d.ts` file so that TypeScript picks it
 *     up as ambient types without requiring an explicit `import` in every
 *     consumer (Server Actions, route handlers, UI components).
 *   - Co-locating it with the rest of the app-wide ambient typings in
 *     `src/types/` matches the convention used by the other 20 apps in
 *     this repo.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
