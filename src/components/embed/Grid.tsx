"use client";

import type { EmbedEntry } from "@/lib/embed-types";
import type { GridConfig } from "@/lib/validations/embed-config";
import { EntryCard } from "./EntryCard";
import "@/styles/embed/grid.css";

type Props = {
  entries: EmbedEntry[];
  config: GridConfig;
};

export function Grid({ entries, config }: Props) {
  return (
    <div
      className="smp-grid"
      role="region"
      aria-label="Social Media Posts Grid"
      style={
        {
          "--smp-columns": String(config.columns),
          "--smp-gap": `${config.gap}px`,
        } as React.CSSProperties
      }
    >
      {entries.map((entry, i) => (
        <EntryCard key={`${entry.sourceUrl}-${i}`} entry={entry} variant="grid" />
      ))}
    </div>
  );
}
