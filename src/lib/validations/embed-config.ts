import { z } from "zod";

const carousel3dFields = {
  cardGap: z.number().int().min(0).max(80).default(24),
  perspective: z.number().int().min(400).max(3000).default(1200),
  rotateY: z.number().int().min(0).max(60).default(28),
  depth: z.number().int().min(0).max(200).default(72),
  rotateX: z.number().int().min(0).max(25).default(8),
  scaleCenter: z.number().min(0.85).max(1.35).default(1.08),
  scaleSide: z.number().min(0.35).max(1).default(0.58),
};

export const carouselConfigSchema = z.object({
  limit: z.number().int().default(-1),
  loop: z.boolean().default(true),
  visible: z.number().int().min(3).max(5).default(5),
  order: z.enum(["ASC", "DESC"]).default("DESC"),
  ...carousel3dFields,
});

export const gridConfigSchema = z.object({
  limit: z.number().int().default(-1),
  columns: z.number().int().min(1).max(4).default(3),
  gap: z.number().int().min(0).max(64).default(24),
  order: z.enum(["ASC", "DESC"]).default("DESC"),
});

export const wallConfigSchema = z.object({
  limit: z.number().int().default(-1),
  columns: z.number().int().min(2).max(16).default(8),
  rows: z.number().int().min(2).max(16).default(6),
  gap: z.number().int().min(0).max(40).default(4),
  interval: z.number().int().min(600).max(60000).default(7800),
  swaps: z.number().int().min(1).max(30).default(3),
  opacity: z.number().min(0).max(1).default(0.55),
  background: z.string().default("#0b0b0b"),
  blur: z.number().int().min(0).max(50).default(8),
  overlayHtml: z.string().max(2000).optional(),
});

export const wallCarouselConfigSchema = z.object({
  limit: z.number().int().default(-1),
  order: z.enum(["ASC", "DESC"]).default("DESC"),
  columns: z.number().int().min(2).max(16).default(8),
  rows: z.number().int().min(2).max(16).default(6),
  gap: z.number().int().min(0).max(40).default(4),
  interval: z.number().int().min(600).max(60000).default(7800),
  swaps: z.number().int().min(1).max(30).default(3),
  opacity: z.number().min(0).max(1).default(0.45),
  background: z.string().default("#0b0b0b"),
  blur: z.number().int().min(0).max(50).default(10),
  loop: z.boolean().default(true),
  visible: z.number().int().min(3).max(5).default(5),
  ...carousel3dFields,
});

export type CarouselConfig = z.infer<typeof carouselConfigSchema>;
export type GridConfig = z.infer<typeof gridConfigSchema>;
export type WallConfig = z.infer<typeof wallConfigSchema>;
export type WallCarouselConfig = z.infer<typeof wallCarouselConfigSchema>;
