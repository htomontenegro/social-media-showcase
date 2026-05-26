import { describe, expect, it } from "vitest";
import { isInstagramUrl, normalizeInstagramUrl } from "./instagram";

describe("isInstagramUrl", () => {
  it("accepts instagram.com and instagr.am hosts", () => {
    expect(isInstagramUrl("https://www.instagram.com/p/ABC123/")).toBe(true);
    expect(isInstagramUrl("https://instagr.am/p/ABC123/")).toBe(true);
  });

  it("rejects other hosts and invalid URLs", () => {
    expect(isInstagramUrl("https://example.com/p/1/")).toBe(false);
    expect(isInstagramUrl("not-a-url")).toBe(false);
  });
});

describe("normalizeInstagramUrl", () => {
  it("canonicalizes protocol, host, path, and strips query/hash", () => {
    expect(
      normalizeInstagramUrl(
        "http://WWW.Instagram.com/p/DWRVGUtElO5/?utm_source=x#frag"
      )
    ).toBe("https://instagram.com/p/DWRVGUtElO5");
  });

  it("removes trailing slashes on path", () => {
    expect(normalizeInstagramUrl("https://instagram.com/p/abc/")).toBe(
      "https://instagram.com/p/abc"
    );
  });
});
