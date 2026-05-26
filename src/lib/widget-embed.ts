import { prisma } from "@/lib/db";
import { normalizeWidgetConfig } from "@/lib/widget-config-defaults";
import type { EmbedEntry, EmbedPayload } from "@/lib/embed-types";

export function embedSnippet(baseUrl: string, token: string): string {
  return `<div id="smp-widget-${token}" style="height:100vh"></div>
<script async src="${baseUrl}/embed/v1/embed.js" data-widget="${token}" data-target="smp-widget-${token}"></script>`;
}

export async function getEmbedPayload(publicToken: string): Promise<EmbedPayload | null> {
  const widget = await prisma.widget.findUnique({
    where: { publicToken, active: true },
    include: {
      widgetEntries: {
        orderBy: { sortOrder: "asc" },
        include: { entry: true },
      },
    },
  });

  if (!widget) {
    return null;
  }

  const config = normalizeWidgetConfig(
    widget.type,
    widget.config as Record<string, unknown> | null
  );
  let entries: EmbedEntry[] = widget.widgetEntries
    .map((we) => we.entry)
    .filter((e) => e.status !== "FAILED")
    .map((e) => ({
      title: e.title,
      description: e.description,
      imageUrl: e.imageUrl,
      sourceUrl: e.sourceUrl,
      authorHandle: e.authorHandle,
      authorName: e.authorName,
      platform: e.platform,
    }));

  const limit = typeof config.limit === "number" ? config.limit : -1;
  if (limit > 0) {
    entries = entries.slice(0, limit);
  }

  const order = config.order === "ASC" ? "ASC" : "DESC";
  if (order === "ASC") {
    entries = [...entries].reverse();
  }

  return {
    type: widget.type,
    config,
    entries,
  };
}
