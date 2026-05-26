export type EmbedEntry = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  authorHandle: string | null;
  authorName: string | null;
  platform: string;
};

export type EmbedPayload = {
  type: "CAROUSEL" | "GRID" | "WALL" | "WALL_CAROUSEL";
  config: Record<string, unknown>;
  entries: EmbedEntry[];
};
