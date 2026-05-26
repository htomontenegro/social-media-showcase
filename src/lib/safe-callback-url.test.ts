import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./safe-callback-url";

describe("safeCallbackUrl", () => {
  it("returns fallback for empty or missing values", () => {
    expect(safeCallbackUrl(null)).toBe("/dashboard");
    expect(safeCallbackUrl(undefined, "/login")).toBe("/login");
    expect(safeCallbackUrl("")).toBe("/dashboard");
  });

  it("allows safe relative dashboard paths", () => {
    expect(safeCallbackUrl("/dashboard")).toBe("/dashboard");
    expect(safeCallbackUrl("/dashboard/widgets/new")).toBe("/dashboard/widgets/new");
    expect(safeCallbackUrl("/dashboard/entries?id=1")).toBe("/dashboard/entries?id=1");
  });

  it("rejects open redirects", () => {
    expect(safeCallbackUrl("//evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("https://evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("/\\evil")).toBe("/dashboard");
    expect(safeCallbackUrl("javascript:alert(1)")).toBe("/dashboard");
    expect(safeCallbackUrl("/dashboard\n/evil")).toBe("/dashboard");
  });
});
