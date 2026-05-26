import { describe, expect, it } from "vitest";
import {
  getWidgetConfigDefaults,
  normalizeWidgetConfig,
} from "./widget-config-defaults";

describe("normalizeWidgetConfig", () => {
  it("merges stored values over type defaults", () => {
    const merged = normalizeWidgetConfig("WALL_CAROUSEL", { columns: 12, opacity: 0.25 });
    expect(merged.columns).toBe(12);
    expect(merged.opacity).toBe(0.25);
    expect(merged.loop).toBe(true);
    expect(merged.visible).toBe(5);
  });

  it("returns full defaults when config is null", () => {
    const defaults = getWidgetConfigDefaults("GRID");
    const merged = normalizeWidgetConfig("GRID", null);
    expect(merged).toEqual(defaults);
  });
});
