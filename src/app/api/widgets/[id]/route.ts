import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseWidgetConfig, widgetUpdateSchema } from "@/lib/validations/widget";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedWidget(userId: string, id: string) {
  return prisma.widget.findFirst({
    where: { id, userId },
    include: {
      widgetEntries: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function GET(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const widget = await getOwnedWidget(session.user.id, id);
  if (!widget) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    widget: {
      id: widget.id,
      name: widget.name,
      type: widget.type,
      config: widget.config,
      publicToken: widget.publicToken,
      entryIds: widget.widgetEntries.map((we) => we.entryId),
    },
  });
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getOwnedWidget(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = widgetUpdateSchema.parse(body);
    const config = parseWidgetConfig(existing.type, data.config);

    const entries = await prisma.entry.findMany({
      where: {
        id: { in: data.entryIds },
        userId: session.user.id,
      },
    });

    const ownedIds = new Set(entries.map((e) => e.id));
    const orderedEntryIds = data.entryIds.filter((entryId) => ownedIds.has(entryId));

    if (orderedEntryIds.length === 0) {
      return NextResponse.json({ error: "No valid entries selected" }, { status: 400 });
    }
    if (orderedEntryIds.length !== data.entryIds.length) {
      return NextResponse.json(
        { error: "One or more entries are invalid or not owned by you" },
        { status: 400 }
      );
    }

    const widget = await prisma.$transaction(async (tx) => {
      await tx.widgetEntry.deleteMany({ where: { widgetId: id } });
      return tx.widget.update({
        where: { id },
        data: {
          name: data.name,
          config: config as Prisma.InputJsonValue,
          widgetEntries: {
            create: orderedEntryIds.map((entryId, i) => ({
              entryId,
              sortOrder: i,
            })),
          },
        },
      });
    });

    return NextResponse.json({ widget });
  } catch {
    return NextResponse.json({ error: "Invalid widget data" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.widget.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.widget.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
