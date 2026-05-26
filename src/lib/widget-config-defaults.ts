/** Plain defaults for widget config (no zod) — safe for client dashboard forms. */

const carousel3dDefaults = {
  cardGap: 24,
  perspective: 1200,
  rotateY: 28,
  depth: 72,
  rotateX: 8,
  scaleCenter: 1.08,
  scaleSide: 0.58,
} as const;

const WIDGET_CONFIG_DEFAULTS: Record<string, Record<string, unknown>> = {
  CAROUSEL: {
    limit: -1,
    loop: true,
    visible: 5,
    order: "DESC",
    ...carousel3dDefaults,
  },
  GRID: {
    limit: -1,
    columns: 3,
    gap: 24,
    order: "DESC",
  },
  WALL: {
    limit: -1,
    columns: 8,
    rows: 6,
    gap: 4,
    interval: 7800,
    swaps: 3,
    opacity: 0.55,
    background: "#0b0b0b",
    blur: 8,
  },
  WALL_CAROUSEL: {
    limit: -1,
    order: "DESC",
    columns: 8,
    rows: 6,
    gap: 4,
    interval: 7800,
    swaps: 3,
    opacity: 0.45,
    background: "#0b0b0b",
    blur: 10,
    loop: true,
    visible: 5,
    ...carousel3dDefaults,
  },
};

export function getWidgetConfigDefaults(type: string): Record<string, unknown> {
  return {
    ...(WIDGET_CONFIG_DEFAULTS[type] ?? WIDGET_CONFIG_DEFAULTS.CAROUSEL),
  };
}

/** Merge stored config with type defaults so dashboard controls never show NaN. */
export function normalizeWidgetConfig(
  type: string,
  config?: Record<string, unknown> | null
): Record<string, unknown> {
  return { ...getWidgetConfigDefaults(type), ...config };
}
