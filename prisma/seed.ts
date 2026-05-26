import { PrismaClient, WidgetType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { normalizeInstagramUrl } from "../src/lib/enrich/instagram";
import { importInstagramUrl } from "../src/lib/import-service";
import {
  SEED_INSTAGRAM_URLS,
  SEED_LOGIN_WIDGET_TOKEN,
  SEED_WALL_CAROUSEL_CONFIG,
} from "../src/lib/seed-demo";

const SEED_URLS = [...new Set(SEED_INSTAGRAM_URLS.map(normalizeInstagramUrl))];

const prisma = new PrismaClient();

const DEFAULT_ADMIN = {
  name: "Humberto",
  email: "hto.montenegro@gmail.com",
  password: "mucSC1993@@",
};

const IMPORT_DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const name = process.env.SEED_ADMIN_NAME ?? DEFAULT_ADMIN.name;
  const email = (process.env.SEED_ADMIN_EMAIL ?? DEFAULT_ADMIN.email).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN.password;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name, passwordHash },
  });

  console.log(`Seeded admin user: ${email}`);

  const removed = await prisma.entry.deleteMany({
    where: {
      userId: user.id,
      sourceUrl: { notIn: [...SEED_URLS] },
    },
  });
  if (removed.count > 0) {
    console.log(`Removed ${removed.count} entries not in the current seed list.`);
  }

  const entryIds: string[] = [];

  for (let i = 0; i < SEED_URLS.length; i++) {
    const url = SEED_URLS[i];
    const result = await importInstagramUrl(user.id, url);
    if (result.entryId) {
      entryIds.push(result.entryId);
    }
    console.log(`[${i + 1}/${SEED_URLS.length}] ${result.status}: ${url}`);
    if (i < SEED_URLS.length - 1) {
      await sleep(IMPORT_DELAY_MS);
    }
  }

  const uniqueEntryIds = [...new Set(entryIds)];
  if (uniqueEntryIds.length === 0) {
    throw new Error("No entries imported — cannot create showcase widget.");
  }

  const widget = await prisma.widget.upsert({
    where: { publicToken: SEED_LOGIN_WIDGET_TOKEN },
    create: {
      userId: user.id,
      name: "wall and carousel",
      type: WidgetType.WALL_CAROUSEL,
      publicToken: SEED_LOGIN_WIDGET_TOKEN,
      config: SEED_WALL_CAROUSEL_CONFIG,
      widgetEntries: {
        create: uniqueEntryIds.map((entryId, sortOrder) => ({ entryId, sortOrder })),
      },
    },
    update: {
      name: "wall and carousel",
      type: WidgetType.WALL_CAROUSEL,
      config: SEED_WALL_CAROUSEL_CONFIG,
      active: true,
    },
  });

  await prisma.widgetEntry.deleteMany({ where: { widgetId: widget.id } });
  await prisma.widgetEntry.createMany({
    data: uniqueEntryIds.map((entryId, sortOrder) => ({
      widgetId: widget.id,
      entryId,
      sortOrder,
    })),
  });

  console.log(
    `Showcase widget "${widget.name}" (${widget.type}) — ${uniqueEntryIds.length} entries, token: ${widget.publicToken}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
