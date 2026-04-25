// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMessageAction, updateMessageAction, deleteMessageAction } from "@/features/chat/server/message-actions";
import { auth } from "@/shared/lib/auth/options";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/shared/lib/auth/options", () => ({
  auth: vi.fn(),
}));

vi.mock("@/shared/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    message: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    groupMember: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { prisma } from "@/shared/lib/db/prisma";

describe("createMessageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await createMessageAction({
      content: "Test message",
      type: "text",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("認証");
    }
  });

  it("should return error if user not found", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await createMessageAction({
      content: "Test message",
      type: "text",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("ユーザー");
    }
  });

  it("should return error for invalid data", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    } as any);

    const result = await createMessageAction({
      content: "", // Invalid: empty content
      type: "text",
    });

    expect(result.success).toBe(false);
  });

  it("should create message successfully", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    } as any);
    vi.mocked(prisma.message.create).mockResolvedValue({
      id: "message-1",
      content: "Test message",
      type: "text",
      senderId: "user-1",
      groupId: null,
    } as any);

    const result = await createMessageAction({
      content: "Test message",
      type: "text",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("message-1");
    }
  });

  it("should check group membership for group messages", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    } as any);
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null);

    const result = await createMessageAction({
      content: "Test message",
      type: "text",
      groupId: "group-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("メンバー");
    }
  });
});

describe("updateMessageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await updateMessageAction("message-1", {
      content: "Updated message",
    });

    expect(result.success).toBe(false);
  });

  it("should return error if message not found", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    } as any);
    vi.mocked(prisma.message.findUnique).mockResolvedValue(null);

    const result = await updateMessageAction("message-1", {
      content: "Updated message",
    });

    expect(result.success).toBe(false);
  });

  it("should return error if not owner (IDOR protection)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    } as any);
    vi.mocked(prisma.message.findUnique).mockResolvedValue({
      id: "message-1",
      senderId: "user-2", // Different user
    } as any);

    const result = await updateMessageAction("message-1", {
      content: "Updated message",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("権限");
    }
  });

  it("should update message successfully", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    } as any);
    vi.mocked(prisma.message.findUnique).mockResolvedValue({
      id: "message-1",
      senderId: "user-1",
    } as any);
    vi.mocked(prisma.message.update).mockResolvedValue({
      id: "message-1",
      content: "Updated message",
    } as any);

    const result = await updateMessageAction("message-1", {
      content: "Updated message",
    });

    expect(result.success).toBe(true);
  });
});

describe("deleteMessageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if not owner (IDOR protection)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    } as any);
    vi.mocked(prisma.message.findUnique).mockResolvedValue({
      id: "message-1",
      senderId: "user-2", // Different user
    } as any);

    const result = await deleteMessageAction("message-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("権限");
    }
  });

  it("should delete message successfully (soft delete)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
    } as any);
    vi.mocked(prisma.message.findUnique).mockResolvedValue({
      id: "message-1",
      senderId: "user-1",
    } as any);
    vi.mocked(prisma.message.update).mockResolvedValue({
      id: "message-1",
      isDeleted: true,
    } as any);

    const result = await deleteMessageAction("message-1");

    expect(result.success).toBe(true);
    expect(prisma.message.update).toHaveBeenCalledWith({
      where: { id: "message-1" },
      data: { isDeleted: true },
    });
  });
});
