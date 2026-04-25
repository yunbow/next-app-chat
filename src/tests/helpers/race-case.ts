import { expect } from "vitest";

/**
 * Canonical race-condition / optimistic-lock test helper.
 *
 * Truly concurrent DB behavior can only be validated against a real database
 * — in-memory mocks don't model MVCC locking, unique-constraint races, or
 * transaction isolation. What a mock CAN assert, and what matters most for
 * regression prevention, is that the production code reaches the DB through
 * race-safe primitives:
 *
 *   - Atomic counter operations: `{ increment: N }` / `{ decrement: N }`
 *     (single SQL `UPDATE col = col ± N`, no read-modify-write gap).
 *   - Conditional atomic updates: `updateMany({ where: { col: { gte: N } },
 *     data: { col: { decrement: N } } })` (single SQL statement refuses to
 *     decrement below the guard). This is how shop prevents overselling.
 *   - Transactional boundary: `prisma.$transaction` so multiple atomics
 *     land together or roll back together.
 *   - Idempotent set-insertion: `createMany` against a composite unique
 *     constraint (with `skipDuplicates: true` when concurrent duplicates
 *     are expected — the chat `MessageRead` path).
 *
 * The 4 assertion helpers below each cover one of those primitives. Pair
 * them with `runInParallel` to also exercise the production code under
 * N concurrent invocations, which rules out accidental shared state at
 * the JS layer (module-level mutable state, stale promise caching, etc.).
 *
 * Not covered here, on purpose: **actual** DB-level races (phantom reads,
 * deadlocks, serializable rollbacks). Those belong in a Postgres-backed
 * integration suite. This helper's job is strictly to lock in the
 * code-shape contract so the race-safe primitive is never silently
 * replaced by a naive read-modify-write.
 */

export type MockFn = {
  mock: { calls: unknown[][] };
};

/**
 * Fire `n` concurrent invocations of `factory(i)` and wait for all of them
 * to settle. Returns the array of results in invocation order (0..n-1).
 *
 * Use this instead of a for-loop + await to force the production code into
 * an interleaved schedule — any module-scoped caches, lazy-initialized
 * singletons, or unawaited side-effect promises show up here as flaky
 * test output, which is exactly what we want to catch.
 */
export function runInParallel<T>(
  n: number,
  factory: (i: number) => Promise<T>,
): Promise<PromiseSettledResult<T>[]> {
  return Promise.allSettled(
    Array.from({ length: n }, (_, i) => factory(i)),
  );
}

function flattenCallArgs(fn: MockFn): unknown[] {
  const args: unknown[] = [];
  for (const call of fn.mock.calls) {
    for (const arg of call) args.push(arg);
  }
  return args;
}

function includesAtomicOp(value: unknown, field: string, op: "increment" | "decrement"): boolean {
  if (!value || typeof value !== "object") return false;
  // Flatten Prisma call shapes: { data: { field: { increment: 1 } } }
  // or { data: { field: { decrement: N } } } at any nesting depth.
  const seen = new WeakSet<object>();
  const stack: unknown[] = [value];
  while (stack.length) {
    const v = stack.pop();
    if (!v || typeof v !== "object") continue;
    if (seen.has(v as object)) continue;
    seen.add(v as object);
    const obj = v as Record<string, unknown>;
    if (field in obj) {
      const fv = obj[field];
      if (fv && typeof fv === "object" && op in (fv as Record<string, unknown>)) {
        return true;
      }
    }
    for (const key of Object.keys(obj)) stack.push(obj[key]);
  }
  return false;
}

/**
 * Assert that a prisma mock received at least one call whose arguments
 * contained `{ field: { [op]: N } }` somewhere. Matches at any nesting
 * depth so it works for direct `update({ data: {...} })` shapes AND
 * `$transaction([update({ data: {...} }), ...])` array shapes.
 */
export function expectAtomicFieldOp(
  fn: MockFn,
  field: string,
  op: "increment" | "decrement",
): void {
  const args = flattenCallArgs(fn);
  const matched = args.some((a) => includesAtomicOp(a, field, op));
  if (!matched) {
    expect.fail(
      `expected a mock call with \`{ ${field}: { ${op}: N } }\` atomic op, but none of ${fn.mock.calls.length} calls matched. This test locks in race-safety — a read-modify-write regression (e.g. \`update({ data: { ${field}: prev + 1 } })\`) would silently lose updates under concurrency.`,
    );
  }
}

/**
 * Assert that `$transaction` was invoked. Either callback form
 * (`$transaction(async (tx) => ...)`) or array form (`$transaction([...])`).
 * Rules out "multi-step update without a transactional boundary", which
 * cannot roll back cleanly if the later step fails.
 */
export function expectTransactional(prismaMock: {
  $transaction: MockFn;
}): void {
  if (prismaMock.$transaction.mock.calls.length === 0) {
    expect.fail(
      "expected `prisma.$transaction` to be invoked; multi-step mutations without a transactional boundary can leave the DB in a partial-write state if the later step fails under concurrency",
    );
  }
}

/**
 * Assert that a prisma mock received at least one `createMany` call with
 * the specified `skipDuplicates` value. Concurrent inserts against a
 * composite unique constraint (e.g. the chat `MessageRead` table) fail
 * one of the racers without `skipDuplicates: true` — the flag is the
 * race-safe path.
 */
export function expectCreateManyWithSkipDuplicates(
  createManyMock: MockFn,
): void {
  const matched = createManyMock.mock.calls.some((call) => {
    for (const arg of call) {
      if (
        arg &&
        typeof arg === "object" &&
        (arg as Record<string, unknown>).skipDuplicates === true
      ) {
        return true;
      }
    }
    return false;
  });
  if (!matched) {
    expect.fail(
      "expected `createMany({ skipDuplicates: true })` — concurrent inserts against a unique constraint fail one of the racers with a constraint-violation error otherwise",
    );
  }
}

/**
 * Assert that a prisma mock received a `updateMany` with a gating
 * `where` clause (e.g. `{ stock: { gte: N } }`). This is the
 * conditional-atomic-update pattern that shop uses to prevent
 * overselling: the UPDATE succeeds atomically iff the guard holds
 * right now, otherwise 0 rows change and the caller can retry / reject.
 */
export function expectConditionalUpdateMany(
  updateManyMock: MockFn,
  guardField: string,
): void {
  const matched = updateManyMock.mock.calls.some((call) => {
    for (const arg of call) {
      if (!arg || typeof arg !== "object") continue;
      const where = (arg as { where?: Record<string, unknown> }).where;
      if (!where) continue;
      const guard = where[guardField];
      if (guard && typeof guard === "object") {
        const ops = Object.keys(guard as Record<string, unknown>);
        if (ops.some((k) => k === "gte" || k === "gt" || k === "equals")) {
          return true;
        }
      }
    }
    return false;
  });
  if (!matched) {
    expect.fail(
      `expected \`updateMany({ where: { ${guardField}: { gte|gt|equals: ... } }, data: { [${guardField}]: { decrement: ... } } })\` — the conditional atomic update pattern that prevents overselling under concurrency`,
    );
  }
}
