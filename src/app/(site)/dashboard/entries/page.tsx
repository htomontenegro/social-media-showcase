import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EntriesPage() {
  const session = await auth();
  const entries = await prisma.entry.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entries"
        description="Every imported Instagram URL lives here. Use these posts when you build widgets—or open an entry to fix a partial import."
      >
        <Link
          href="/dashboard/import"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          Import more
        </Link>
      </PageHeader>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Thumb</th>
              <th className="px-4 py-3 font-medium">Caption</th>
              <th className="px-4 py-3 font-medium">Handle</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Imported</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {entries.map((e) => (
              <tr key={e.id} className="bg-zinc-900/30 hover:bg-zinc-900/60">
                <td className="px-4 py-3">
                  {e.imageUrl ? (
                    <img src={e.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-zinc-700" />
                  ) : (
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500">
                      —
                    </span>
                  )}
                </td>
                <td className="max-w-md px-4 py-3">
                  <Link
                    href={`/dashboard/entries/${e.id}`}
                    className="font-medium text-zinc-100 hover:text-violet-300"
                  >
                    {(e.description ?? e.title ?? "Untitled").slice(0, 80)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">{e.authorHandle ? `@${e.authorHandle}` : "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                    {e.importStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{e.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-zinc-400">No entries yet.</p>
            <Link
              href="/dashboard/import"
              className="mt-3 inline-block text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              Import your first Instagram URLs →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
