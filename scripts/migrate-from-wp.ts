/**
 * Optional migration from WordPress social-media-posts export JSON.
 *
 * Usage:
 *   npx tsx scripts/migrate-from-wp.ts --input export.json --user-id <cuid>
 *
 * export.json shape:
 * [{ "sourceUrl", "title", "description", "authorName", "authorHandle", "authorBio", "imageUrl", "platform" }]
 */

import { readFile } from "fs/promises";
import { PrismaClient, ImportStatus, EntryStatus } from "@prisma/client";

const prisma = new PrismaClient();

type WpExportRow = {
  sourceUrl: string;
  title?: string;
  description?: string;
  authorName?: string;
  authorHandle?: string;
  authorBio?: string;
  imageUrl?: string;
  platform?: string;
};

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf("--input");
  const userIdx = args.indexOf("--user-id");
  if (inputIdx === -1 || userIdx === -1) {
    console.error("Required: --input export.json --user-id <userId>");
    process.exit(1);
  }
  const inputPath = args[inputIdx + 1];
  const userId = args[userIdx + 1];
  const raw = await readFile(inputPath, "utf8");
  const rows = JSON.parse(raw) as WpExportRow[];

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.sourceUrl) continue;
    const exists = await prisma.entry.findUnique({
      where: { userId_sourceUrl: { userId, sourceUrl: row.sourceUrl } },
    });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.entry.create({
      data: {
        userId,
        sourceUrl: row.sourceUrl,
        platform: row.platform ?? "instagram",
        status: EntryStatus.IMPORTED,
        title: row.title ?? null,
        description: row.description ?? null,
        authorName: row.authorName ?? null,
        authorHandle: row.authorHandle ?? null,
        authorBio: row.authorBio ?? null,
        imageUrl: row.imageUrl ?? null,
        importStatus: ImportStatus.CREATED,
        importMessage: "Migrated from WordPress",
      },
    });
    created++;
  }

  console.log(`Migration complete. Created: ${created}, skipped (duplicate): ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
