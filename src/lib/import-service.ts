import { EntryStatus, ImportStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { enrichInstagramUrl, normalizeInstagramUrl } from "@/lib/enrich/instagram";
import { compressImageFromUrl } from "@/lib/image/compress";
import { uploadBuffer } from "@/lib/storage";

export type ImportLineResult = {
  url: string;
  status: ImportStatus;
  message: string;
  entryId?: string;
  title?: string;
};

export async function importInstagramUrl(
  userId: string,
  url: string
): Promise<ImportLineResult> {
  const normalized = normalizeInstagramUrl(url);

  const existing = await prisma.entry.findUnique({
    where: { userId_sourceUrl: { userId, sourceUrl: normalized } },
  });
  if (existing) {
    return {
      url: normalized,
      status: ImportStatus.DUPLICATE,
      message: "Already imported.",
      entryId: existing.id,
      title: existing.title ?? undefined,
    };
  }

  try {
    const enriched = await enrichInstagramUrl(normalized);
    let imageUrl: string | null = null;
    let imageKey: string | null = null;
    let imageBytes: number | null = null;
    let entryStatus: EntryStatus = EntryStatus.IMPORTED;
    let importStatus: ImportStatus = ImportStatus.CREATED;
    let importMessage = "Created with caption and media.";

    if (enriched.imageUrl) {
      const compressed = await compressImageFromUrl(enriched.imageUrl);
      if (compressed.ok) {
        const uploaded = await uploadBuffer(
          compressed.buffer,
          compressed.mime,
          compressed.ext
        );
        imageUrl = uploaded.url;
        imageKey = uploaded.key;
        imageBytes = uploaded.bytes;
      } else {
        entryStatus = EntryStatus.PARTIAL;
        importStatus = ImportStatus.PARTIAL;
        importMessage = `Created — ${compressed.reason}`;
      }
    } else {
      entryStatus = EntryStatus.PARTIAL;
      importStatus = ImportStatus.PARTIAL;
      importMessage = "Created — needs manual completion (no image).";
    }

    const hasCaption = Boolean(enriched.caption || enriched.description);
    if (!hasCaption && importStatus === ImportStatus.CREATED) {
      entryStatus = EntryStatus.PARTIAL;
      importStatus = ImportStatus.PARTIAL;
      importMessage = "Created — caption missing.";
    }
    if (!imageUrl && importStatus === ImportStatus.CREATED) {
      entryStatus = EntryStatus.PARTIAL;
      importStatus = ImportStatus.PARTIAL;
      importMessage = "Created — image missing.";
    }

    const entry = await prisma.entry.create({
      data: {
        userId,
        sourceUrl: normalized,
        platform: "instagram",
        status: entryStatus,
        title: enriched.title,
        description: enriched.description,
        authorName: enriched.authorName || null,
        authorHandle: enriched.authorHandle || null,
        authorBio: enriched.authorBio || null,
        imageUrl,
        imageKey,
        imageBytes,
        rawOgJson: enriched.rawOg,
        importStatus,
        importMessage,
      },
    });

    return {
      url: normalized,
      status: importStatus,
      message: importMessage,
      entryId: entry.id,
      title: entry.title ?? undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    await prisma.entry.create({
      data: {
        userId,
        sourceUrl: normalized,
        platform: "instagram",
        status: EntryStatus.FAILED,
        importStatus: ImportStatus.FAILED,
        importMessage: message,
      },
    }).catch(() => null);

    return {
      url: normalized,
      status: ImportStatus.FAILED,
      message,
    };
  }
}
