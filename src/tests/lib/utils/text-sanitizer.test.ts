import { describe, it, expect } from "vitest";
import {
  sanitizeUnicode,
  containsDangerousUnicode,
  hasMixedScripts,
  sanitizeForDisplay,
} from "@/lib/utils/text-sanitizer";

describe("sanitizeUnicode", () => {
  it("通常のテキストはそのまま返す", () => {
    expect(sanitizeUnicode("Hello World")).toBe("Hello World");
    expect(sanitizeUnicode("こんにちは")).toBe("こんにちは");
  });

  it("RTLオーバーライド文字を除去する", () => {
    expect(sanitizeUnicode("test\u202Etext")).toBe("testtext");
  });

  it("ゼロ幅文字を除去する", () => {
    expect(sanitizeUnicode("test\u200Btext")).toBe("testtext");
    expect(sanitizeUnicode("test\u200Ctext")).toBe("testtext");
    expect(sanitizeUnicode("test\u200Dtext")).toBe("testtext");
  });

  it("BOMを除去する", () => {
    expect(sanitizeUnicode("\uFEFFtest")).toBe("test");
  });

  it("制御文字を除去する", () => {
    expect(sanitizeUnicode("test\u0000text")).toBe("testtext");
    expect(sanitizeUnicode("test\u0001text")).toBe("testtext");
  });

  it("タブと改行は維持する", () => {
    expect(sanitizeUnicode("test\ttext")).toBe("test\ttext");
    expect(sanitizeUnicode("test\ntext")).toBe("test\ntext");
    expect(sanitizeUnicode("test\rtext")).toBe("test\rtext");
  });
});

describe("containsDangerousUnicode", () => {
  it("危険な文字がない場合はfalse", () => {
    expect(containsDangerousUnicode("Hello World")).toBe(false);
    expect(containsDangerousUnicode("こんにちは")).toBe(false);
  });

  it("危険な文字がある場合はtrue", () => {
    expect(containsDangerousUnicode("test\u202Etext")).toBe(true);
    expect(containsDangerousUnicode("test\u200Btext")).toBe(true);
  });
});

describe("hasMixedScripts", () => {
  it("単一スクリプトの場合はfalse", () => {
    expect(hasMixedScripts("Hello World")).toBe(false);
    expect(hasMixedScripts("こんにちは")).toBe(false);
  });

  it("ラテン文字とキリル文字が混在する場合はtrue", () => {
    expect(hasMixedScripts("Hello\u0410World")).toBe(true);
  });

  it("ラテン文字とギリシャ文字が混在する場合はtrue", () => {
    expect(hasMixedScripts("Hello\u0391World")).toBe(true);
  });
});

describe("sanitizeForDisplay", () => {
  it("連続する改行を2つに制限する", () => {
    expect(sanitizeForDisplay("a\n\n\nb")).toBe("a\n\nb");
    expect(sanitizeForDisplay("a\n\n\n\n\nb")).toBe("a\n\nb");
  });

  it("危険文字と改行制限を同時に適用する", () => {
    expect(sanitizeForDisplay("a\u200B\n\n\nb")).toBe("a\n\nb");
  });
});
