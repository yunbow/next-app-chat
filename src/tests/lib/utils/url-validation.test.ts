import { describe, it, expect } from "vitest";
import {
  isSafeImageUrl,
  hasDangerousScheme,
} from "@/lib/utils/url-validation";

describe("isSafeImageUrl", () => {
  it("相対パス（/uploads/）を許可する", () => {
    expect(isSafeImageUrl("/uploads/image.jpg")).toBe(true);
    expect(isSafeImageUrl("/uploads/2024/01/photo.png")).toBe(true);
  });

  it("HTTPS URLを許可する", () => {
    expect(isSafeImageUrl("https://example.com/image.jpg")).toBe(true);
  });

  it("HTTP URLを拒否する", () => {
    expect(isSafeImageUrl("http://example.com/image.jpg")).toBe(false);
  });

  it("javascript: URLを拒否する", () => {
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
  });

  it("data: URLを拒否する", () => {
    expect(isSafeImageUrl("data:image/png;base64,abc")).toBe(false);
  });

  it("空文字列を拒否する", () => {
    expect(isSafeImageUrl("")).toBe(false);
  });

  it("nullish値を拒否する", () => {
    expect(isSafeImageUrl(null as unknown as string)).toBe(false);
    expect(isSafeImageUrl(undefined as unknown as string)).toBe(false);
  });
});

describe("hasDangerousScheme", () => {
  it("javascript:を検出する", () => {
    expect(hasDangerousScheme("javascript:alert(1)")).toBe(true);
  });

  it("data:を検出する", () => {
    expect(hasDangerousScheme("data:text/html,<h1>test</h1>")).toBe(true);
  });

  it("vbscript:を検出する", () => {
    expect(hasDangerousScheme("vbscript:msgbox")).toBe(true);
  });

  it("file:を検出する", () => {
    expect(hasDangerousScheme("file:///etc/passwd")).toBe(true);
  });

  it("https:は安全", () => {
    expect(hasDangerousScheme("https://example.com")).toBe(false);
  });

  it("大文字小文字を区別しない", () => {
    expect(hasDangerousScheme("JAVASCRIPT:alert(1)")).toBe(true);
    expect(hasDangerousScheme("Javascript:alert(1)")).toBe(true);
  });
});
