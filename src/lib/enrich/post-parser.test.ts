import { describe, expect, it } from "vitest";
import { parsePost, truncateForTitle } from "./post-parser";

describe("parsePost (instagram)", () => {
  it("parses typical OG title and description", () => {
    const title =
      'Jane Doe on Instagram: “Sunset over the city tonight.”';
    const description =
      '1,234 likes, 56 comments - janedoe on January 1, 2025: “Sunset over the city tonight.”';

    const parsed = parsePost("instagram", title, description);

    expect(parsed.authorName).toBe("Jane Doe");
    expect(parsed.authorHandle).toBe("janedoe");
    expect(parsed.likes).toBe(1234);
    expect(parsed.comments).toBe(56);
    expect(parsed.caption).toContain("Sunset over the city");
  });

  it("leaves caption empty when OG patterns do not match", () => {
    const parsed = parsePost("instagram", "Plain title", "Plain description");
    expect(parsed.authorName).toBe("");
    expect(parsed.caption).toBe("");
    expect(parsed.likes).toBe(0);
  });
});

describe("truncateForTitle", () => {
  it("truncates long captions with ellipsis", () => {
    const long = "a".repeat(150);
    const out = truncateForTitle(long, 120);
    expect(out.length).toBe(120);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns short captions unchanged", () => {
    expect(truncateForTitle("Hello")).toBe("Hello");
    expect(truncateForTitle("  ")).toBe("");
  });
});
