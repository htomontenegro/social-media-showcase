import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";
import { importBatchSchema, importSingleSchema } from "./import";
import { wallCarouselConfigSchema } from "./embed-config";
import { parseWidgetConfig } from "./widget";
import { SEED_WALL_CAROUSEL_CONFIG } from "@/lib/seed-demo";

const SAMPLE_POST = "https://www.instagram.com/p/DWRVGUtElO5/";

describe("auth schemas", () => {
  it("validates login email and password", () => {
    expect(
      loginSchema.safeParse({ email: "user@example.com", password: "x" }).success
    ).toBe(true);
    expect(loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(
      false
    );
  });

  it("requires register password length >= 8", () => {
    expect(
      registerSchema.safeParse({
        email: "user@example.com",
        password: "short",
      }).success
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        email: "user@example.com",
        password: "longenough",
      }).success
    ).toBe(true);
  });
});

describe("import schemas", () => {
  it("accepts valid Instagram URLs", () => {
    expect(importSingleSchema.safeParse({ url: SAMPLE_POST }).success).toBe(true);
  });

  it("rejects non-Instagram URLs", () => {
    expect(
      importSingleSchema.safeParse({ url: "https://example.com/post" }).success
    ).toBe(false);
  });

  it("limits batch size to 50", () => {
    const urls = Array.from({ length: 51 }, () => SAMPLE_POST);
    expect(importBatchSchema.safeParse({ urls }).success).toBe(false);
    expect(
      importBatchSchema.safeParse({ urls: urls.slice(0, 50) }).success
    ).toBe(true);
  });
});

describe("widget config", () => {
  it("parses seed showcase wall+carousel config", () => {
    const parsed = wallCarouselConfigSchema.safeParse(SEED_WALL_CAROUSEL_CONFIG);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.columns).toBe(12);
      expect(parsed.data.visible).toBe(5);
    }
  });

  it("strips script tags from WALL overlayHtml", () => {
    const config = parseWidgetConfig("WALL", {
      overlayHtml: '<p>Hi</p><script>alert("x")</script>',
    });
    expect(config.overlayHtml).not.toContain("<script");
    expect(config.overlayHtml).toContain("Hi");
  });
});
