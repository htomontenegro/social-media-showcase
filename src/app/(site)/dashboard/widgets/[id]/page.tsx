import Link from "next/link";
import { notFound } from "next/navigation";
import { WidgetForm } from "@/components/dashboard/WidgetForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditWidgetPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;
  const widget = await prisma.widget.findFirst({
    where: { id, userId: session.user.id },
    include: {
      widgetEntries: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!widget) notFound();

  const entries = await prisma.entry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      sourceUrl: true,
      authorHandle: true,
      authorName: true,
      platform: true,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return (
    <div>
      <Link href="/dashboard/widgets" className="text-sm text-zinc-400 hover:text-zinc-200">
        ← Back to widgets
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-zinc-50">Edit widget</h1>
      <div className="mt-6">
        <WidgetForm
          baseUrl={baseUrl}
          initialEntries={entries}
          initial={{
            id: widget.id,
            name: widget.name,
            type: widget.type,
            config: widget.config as Record<string, unknown>,
            publicToken: widget.publicToken,
            entryIds: widget.widgetEntries.map((we) => we.entryId),
          }}
        />
      </div>
    </div>
  );
}
