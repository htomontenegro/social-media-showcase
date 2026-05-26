"use client";

import type { EmbedPayload } from "@/lib/embed-types";
import {
  carouselConfigSchema,
  gridConfigSchema,
  wallConfigSchema,
  wallCarouselConfigSchema,
} from "@/lib/validations/embed-config";
import { Carousel } from "./Carousel";
import { Grid } from "./Grid";
import { Wall } from "./Wall";
import { WallCarousel } from "./WallCarousel";

type Props = {
  payload: EmbedPayload;
};

export function EmbedHost({ payload }: Props) {
  if (payload.entries.length === 0) {
    return <p className="text-sm text-zinc-400 p-4">No entries to display.</p>;
  }

  switch (payload.type) {
    case "GRID": {
      const config = gridConfigSchema.parse(payload.config);
      return <Grid entries={payload.entries} config={config} />;
    }
    case "WALL": {
      const config = wallConfigSchema.parse(payload.config);
      return <Wall entries={payload.entries} config={config} />;
    }
    case "WALL_CAROUSEL": {
      const config = wallCarouselConfigSchema.parse(payload.config);
      return <WallCarousel entries={payload.entries} config={config} />;
    }
    case "CAROUSEL":
    default: {
      const config = carouselConfigSchema.parse(payload.config);
      return <Carousel entries={payload.entries} config={config} />;
    }
  }
}
