import { describe, it, expect } from "vitest";
import {
  createMessageSchema,
  updateMessageSchema,
  createGroupSchema,
  updateGroupSchema,
} from "@/features/chat/schema/message-schema";

describe("createMessageSchema", () => {
  it("should validate valid message data", () => {
    const validData = {
      content: "Hello, World!",
      type: "text" as const,
      groupId: "group-123",
    };

    const result = createMessageSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty content", () => {
    const invalidData = {
      content: "",
      type: "text" as const,
    };

    const result = createMessageSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("必須");
    }
  });

  it("should reject content exceeding 5000 characters", () => {
    const invalidData = {
      content: "a".repeat(5001),
      type: "text" as const,
    };

    const result = createMessageSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("5000");
    }
  });

  it("should accept valid image URL", () => {
    const validData = {
      content: "Check this out!",
      type: "image" as const,
      imageUrl: "https://example.com/image.jpg",
    };

    const result = createMessageSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid image URL", () => {
    const invalidData = {
      content: "Check this out!",
      type: "image" as const,
      imageUrl: "not-a-url",
    };

    const result = createMessageSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should default type to text", () => {
    const data = {
      content: "Hello",
    };

    const result = createMessageSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("text");
    }
  });
});

describe("updateMessageSchema", () => {
  it("should validate valid update data", () => {
    const validData = {
      content: "Updated message",
    };

    const result = updateMessageSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty content", () => {
    const invalidData = {
      content: "",
    };

    const result = updateMessageSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("createGroupSchema", () => {
  it("should validate valid group data", () => {
    const validData = {
      name: "My Group",
      description: "A test group",
    };

    const result = createGroupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const invalidData = {
      name: "",
    };

    const result = createGroupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("必須");
    }
  });

  it("should reject name exceeding 100 characters", () => {
    const invalidData = {
      name: "a".repeat(101),
    };

    const result = createGroupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("100");
    }
  });

  it("should accept optional description", () => {
    const validData = {
      name: "My Group",
    };

    const result = createGroupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject description exceeding 500 characters", () => {
    const invalidData = {
      name: "My Group",
      description: "a".repeat(501),
    };

    const result = createGroupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept valid image URL", () => {
    const validData = {
      name: "My Group",
      image: "https://example.com/group.jpg",
    };

    const result = createGroupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid image URL", () => {
    const invalidData = {
      name: "My Group",
      image: "not-a-url",
    };

    const result = createGroupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("updateGroupSchema", () => {
  it("should validate valid update data", () => {
    const validData = {
      name: "Updated Group",
      description: "Updated description",
    };

    const result = updateGroupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept partial updates", () => {
    const validData = {
      name: "Updated Group",
    };

    const result = updateGroupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const validData = {};

    const result = updateGroupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
