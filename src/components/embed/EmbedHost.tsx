"use client";

import { useEffect } from "react";
import type { EmbedPayload } from "@/lib/embed-types";
import { postEmbedReady, waitForEmbedImages } from "@/lib/embed-ready";
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
  /** When set, notifies the parent frame (login showcase) after images load. */
  widgetToken?: string;
};

export function EmbedHost({ payload, widgetToken }: Props) {
  useEffect(() => {
    if (!widgetToken) return;

    let cancelled = false;
    const root = document.querySelector(".smp-embed-root");
    const done = () => {
      if (!cancelled) postEmbedReady(widgetToken);
    };

    if (!root) {
      done();
      return;
    }

    void waitForEmbedImages(root).then(done);
    return () => {
      cancelled = true;
    };
  }, [widgetToken, payload.entries.length]);
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
