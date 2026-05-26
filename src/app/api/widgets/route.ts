import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { widgetCreateSchema, parseWidgetConfig } from "@/lib/validations/widget";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const widgets = await prisma.widget.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { widgetEntries: true } } },
  });

  return NextResponse.json({ widgets });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = widgetCreateSchema.parse(body);
    const config = parseWidgetConfig(data.type, data.config);

    const entries = await prisma.entry.findMany({
      where: {
        id: { in: data.entryIds },
        userId: session.user.id,
      },
    });

    const ownedIds = new Set(entries.map((e) => e.id));
    const orderedEntryIds = data.entryIds.filter((id) => ownedIds.has(id));

    if (orderedEntryIds.length === 0) {
      return NextResponse.json({ error: "No valid entries selected" }, { status: 400 });
    }
    if (orderedEntryIds.length !== data.entryIds.length) {
      return NextResponse.json(
        { error: "One or more entries are invalid or not owned by you" },
        { status: 400 }
      );
    }

    const widget = await prisma.widget.create({
      data: {
        userId: session.user.id,
        name: data.name,
        type: data.type,
        config: config as Prisma.InputJsonValue,
        widgetEntries: {
          create: orderedEntryIds.map((entryId, i) => ({
            entryId,
            sortOrder: i,
          })),
        },
      },
    });

    return NextResponse.json({ widget });
  } catch {
    return NextResponse.json({ error: "Invalid widget data" }, { status: 400 });
  }
}
