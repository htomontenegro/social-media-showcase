import { describe, expect, it } from "vitest";
import { isEmbedReadyMessage } from "./embed-ready";

describe("isEmbedReadyMessage", () => {
  it("accepts a valid ready message", () => {
    expect(isEmbedReadyMessage({ type: "smp-embed-ready", token: "abc" })).toBe(true);
  });

  it("rejects unknown shapes", () => {
    expect(isEmbedReadyMessage(null)).toBe(false);
    expect(isEmbedReadyMessage({ type: "other", token: "abc" })).toBe(false);
    expect(isEmbedReadyMessage({ type: "smp-embed-ready" })).toBe(false);
  });
});
