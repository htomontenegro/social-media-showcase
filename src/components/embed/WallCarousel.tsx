"use client";

import type { EmbedEntry } from "@/lib/embed-types";
import type { WallCarouselConfig } from "@/lib/validations/embed-config";
import { Wall } from "./Wall";
import { Carousel } from "./Carousel";
import "@/styles/embed/wall-carousel.css";

type Props = {
  entries: EmbedEntry[];
  config: WallCarouselConfig;
};

export function WallCarousel({ entries, config }: Props) {
  const wallConfig = {
    limit: config.limit,
    columns: config.columns,
    rows: config.rows,
    gap: config.gap,
    interval: config.interval,
    swaps: config.swaps,
    opacity: config.opacity,
    background: config.background,
    blur: config.blur,
  };
  const carouselConfig = {
    limit: config.limit,
    loop: config.loop,
    visible: config.visible,
    order: config.order,
    cardGap: config.cardGap,
    perspective: config.perspective,
    rotateY: config.rotateY,
    depth: config.depth,
    rotateX: config.rotateX,
    scaleCenter: config.scaleCenter,
    scaleSide: config.scaleSide,
  };

  if (entries.length === 0) return null;

  const rootStyle = {
    "--smp-wall-carousel-bg": config.background,
  } as React.CSSProperties;

  return (
    <div className="smp-wall-carousel" style={rootStyle}>
      <Wall entries={entries} config={wallConfig} interactive={false} />
      <div className="smp-wall-carousel__center">
        <Carousel entries={entries} config={carouselConfig} />
      </div>
    </div>
  );
}
