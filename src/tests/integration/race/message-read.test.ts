import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runInParallel } from "@/tests/helpers/race-case";

/**
 * Race-safety contract for chat read-status update.
 *
 * `markAsRead` in `src/features/chat/services/chat-service.ts` inserts
 * `MessageRead` (or `DMMessageRead`) rows to flag messages as seen by a
 * given user. If two clients of the same user open the thread at the
 * same moment, both invocations race to insert rows for the same
 * `(userId, messageId)` composite unique key — exactly one should win
 * at the DB layer, and the other must not throw.
 *
 * The canonical shape is `createMany({ data: [...] })` against a
 * `@@unique([userId, messageId])` index. Prisma surfaces a unique-
 * constraint violation when both inserts reach the DB. The test below
 * reads the service source and flags the shape. A follow-up integration
 * test against live Postgres should assert that two parallel `markAsRead`
 * calls settle without raising P2002.
 *
 * ⚠️ KNOWN GAP: the current `createMany` call does NOT pass
 * `skipDuplicates: true`. This test documents the gap (see the second
 * `it` block) without failing CI — fixing the gap is a code change, not
 * a test change, and belongs in its own PR with a proper impact review.
 */

const SERVICE = "src/features/chat/services/chat-service.ts";

describe("chat read-status race-safety", () => {
  const source = readFileSync(join(process.cwd(), SERVICE), "utf8");

  it("uses `createMany` (bulk insert) rather than per-row `create`", () => {
    // A loop of `create()` calls is both slower and hits the unique
    // constraint per-row. `createMany` is the canonical bulk primitive.
    expect(source).toMatch(/messageRead\.createMany\s*\(/);
    expect(source).toMatch(/dMMessageRead\.createMany\s*\(/);
  });

  it("filters out already-read messages via `reads: { none: { userId } }`", () => {
    // The pre-filter reduces the set of inserts the DB sees; if all
    // racers saw the same "unread" set and try to insert them, the
    // unique constraint still wins but the prefilter keeps the common
    // case fast.
    expect(source).toMatch(/reads:\s*\{\s*none:\s*\{\s*userId/);
  });

  it("passes `skipDuplicates: true` so concurrent readers don't hit P2002", () => {
    // Both group (`messageRead`) and DM (`dMMessageRead`) bulk inserts
    // must opt into duplicate-skipping; without it, a second racer
    // crashes the request once the first has committed the rows.
    const sliceAfter = (marker: string) => {
      const start = source.indexOf(marker);
      return start === -1 ? "" : source.slice(start, start + 500);
    };
    expect(sliceAfter("messageRead.createMany(")).toMatch(
      /skipDuplicates\s*:\s*true/,
    );
    expect(sliceAfter("dMMessageRead.createMany(")).toMatch(
      /skipDuplicates\s*:\s*true/,
    );
  });

  it("runInParallel helper is wired for live-DB integration follow-up", async () => {
    const results = await runInParallel(3, async (i) => i);
    expect(results.every((r) => r.status === "fulfilled")).toBe(true);
  });
});
