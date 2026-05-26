import { z } from "zod";
import { sanitizeHtml } from "@/lib/sanitize-html";
import {
  carouselConfigSchema,
  gridConfigSchema,
  wallConfigSchema,
  wallCarouselConfigSchema,
  type CarouselConfig,
  type GridConfig,
  type WallConfig,
  type WallCarouselConfig,
} from "@/lib/validations/embed-config";

export {
  carouselConfigSchema,
  gridConfigSchema,
  wallConfigSchema,
  wallCarouselConfigSchema,
  type CarouselConfig,
  type GridConfig,
  type WallConfig,
  type WallCarouselConfig,
};

export const widgetCreateSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["CAROUSEL", "GRID", "WALL", "WALL_CAROUSEL"]),
  config: z.record(z.string(), z.unknown()),
  entryIds: z.array(z.string().cuid()).min(1),
});

export const widgetUpdateSchema = z.object({
  name: z.string().min(1).max(120),
  config: z.record(z.string(), z.unknown()),
  entryIds: z.array(z.string().cuid()).min(1),
});

function sanitizeWallOverlay<T extends { overlayHtml?: string }>(config: T): T {
  if (!config.overlayHtml?.trim()) return config;
  return { ...config, overlayHtml: sanitizeHtml(config.overlayHtml.trim()) };
}

export function parseWidgetConfig(type: string, config: unknown) {
  switch (type) {
    case "CAROUSEL":
      return carouselConfigSchema.parse(config);
    case "GRID":
      return gridConfigSchema.parse(config);
    case "WALL":
      return sanitizeWallOverlay(wallConfigSchema.parse(config));
    case "WALL_CAROUSEL":
      return wallCarouselConfigSchema.parse(config);
    default:
      return carouselConfigSchema.parse(config);
  }
}

export { getWidgetConfigDefaults } from "@/lib/widget-config-defaults";

export function safeParseWidgetConfig(type: string, config: unknown) {
  switch (type) {
    case "CAROUSEL":
      return carouselConfigSchema.safeParse(config);
    case "GRID":
      return gridConfigSchema.safeParse(config);
    case "WALL":
      return wallConfigSchema.safeParse(config);
    case "WALL_CAROUSEL":
      return wallCarouselConfigSchema.safeParse(config);
    default:
      return carouselConfigSchema.safeParse(config);
  }
}
