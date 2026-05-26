import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "./sanitize-html";

describe("sanitizeHtml", () => {
  it("keeps allowed tags and attributes", () => {
    const html = '<p class="note">Hello <strong>world</strong></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("removes script and event handlers", () => {
    const dirty =
      '<div onclick="alert(1)">x</div><script>alert("x")</script><img src=x onerror=alert(1)>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("onerror");
  });
});
