import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function WidgetsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const widgets = await prisma.widget.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { widgetEntries: true } } },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Widgets"
        description="Each widget is a public embed you can drop on any site. Preview it, copy the snippet, or edit layout and entries."
      >
        <Link
          href="/dashboard/widgets/new"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          New widget
        </Link>
      </PageHeader>

      <div className="space-y-3">
        {widgets.map((w) => (
          <WidgetCard
            key={w.id}
            id={w.id}
            name={w.name}
            type={w.type}
            entryCount={w._count.widgetEntries}
            publicToken={w.publicToken}
            baseUrl={baseUrl}
          />
        ))}
        {widgets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 px-6 py-12 text-center">
            <p className="text-zinc-400">No widgets yet.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Import a few entries first, then create a carousel, grid, or wall widget.
            </p>
            <Link
              href="/dashboard/widgets/new"
              className="mt-4 inline-block text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              Create your first widget →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
