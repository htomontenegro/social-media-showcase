import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DeleteEntryButton } from "@/components/dashboard/DeleteEntryButton";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const entry = await prisma.entry.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!entry) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/entries" className="text-sm text-zinc-400 hover:text-zinc-200 hover:underline">
        ← Back to entries
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-50">{entry.title ?? "Entry"}</h1>
      {entry.imageUrl ? (
        <img src={entry.imageUrl} alt="" className="mt-4 max-h-80 rounded-lg object-cover" />
      ) : null}
      <dl className="mt-6 space-y-3 text-sm text-zinc-200">
        <div>
          <dt className="font-medium text-zinc-400">URL</dt>
          <dd>
            <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 break-all hover:text-blue-300">
              {entry.sourceUrl}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-400">Description</dt>
          <dd>{entry.description ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-400">Author</dt>
          <dd>
            {entry.authorName ?? "—"}
            {entry.authorHandle ? ` (@${entry.authorHandle})` : ""}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-400">Import status</dt>
          <dd>{entry.importStatus} — {entry.importMessage}</dd>
        </div>
        {entry.imageBytes ? (
          <div>
            <dt className="font-medium text-zinc-400">Image size</dt>
            <dd>{Math.round(entry.imageBytes / 1024)} KB</dd>
          </div>
        ) : null}
      </dl>
      <DeleteEntryButton entryId={entry.id} />
    </div>
  );
}
