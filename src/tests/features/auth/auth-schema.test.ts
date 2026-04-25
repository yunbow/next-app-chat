import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schema/auth-schema";

describe("loginSchema", () => {
  it("should validate valid login data", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidData = {
      email: "not-an-email",
      password: "password123",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("メールアドレス");
    }
  });

  it("should reject short password", () => {
    const invalidData = {
      email: "test@example.com",
      password: "short",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("8文字");
    }
  });
});

describe("registerSchema", () => {
  it("should validate valid registration data", () => {
    const validData = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const invalidData = {
      name: "",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject name exceeding 50 characters", () => {
    const invalidData = {
      name: "a".repeat(51),
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject password without uppercase", () => {
    const invalidData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("大文字");
    }
  });

  it("should reject password without lowercase", () => {
    const invalidData = {
      name: "Test User",
      email: "test@example.com",
      password: "PASSWORD123",
      confirmPassword: "PASSWORD123",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("小文字");
    }
  });

  it("should reject password without number", () => {
    const invalidData = {
      name: "Test User",
      email: "test@example.com",
      password: "PasswordABC",
      confirmPassword: "PasswordABC",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("数字");
    }
  });

  it("should reject mismatched passwords", () => {
    const invalidData = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password456",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("一致");
    }
  });
});
