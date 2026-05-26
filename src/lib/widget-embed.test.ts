import { describe, expect, it } from "vitest";
import { embedSnippet } from "./widget-embed";

describe("embedSnippet", () => {
  it("builds a script tag with token and target id", () => {
    const snippet = embedSnippet("https://showcase.example.com", "my-token-123");
    expect(snippet).toContain('id="smp-widget-my-token-123"');
    expect(snippet).toContain('data-widget="my-token-123"');
    expect(snippet).toContain(
      'src="https://showcase.example.com/embed/v1/embed.js"'
    );
    expect(snippet).toContain('data-target="smp-widget-my-token-123"');
  });
});
