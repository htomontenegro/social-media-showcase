import Link from "next/link";
import { ImportForm } from "@/components/dashboard/ImportForm";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function ImportPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Import Instagram URLs"
        description="Add posts and reels to your library. Paste one URL per line—we process them one at a time so Instagram rate limits are less likely to block you."
      >
        <Link
          href="/dashboard/entries"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          View entries
        </Link>
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <ImportForm />

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-sm font-semibold text-zinc-200">Supported URLs</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">
                  instagram.com/p/…
                </code>{" "}
                — photo posts
              </li>
              <li>
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">
                  instagram.com/reel/…
                </code>{" "}
                — reels
              </li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500">Profiles, stories, and private posts are not supported.</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-sm font-semibold text-zinc-200">After import</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <strong className="text-zinc-300">Created</strong> — caption and image stored; ready for widgets.
              </li>
              <li>
                <strong className="text-zinc-300">Partial</strong> — saved but missing caption or image; edit the entry
                to finish.
              </li>
              <li>
                <strong className="text-zinc-300">Duplicate</strong> — already in your library; opens existing entry.
              </li>
              <li>
                <strong className="text-zinc-300">Failed</strong> — URL invalid or enrichment blocked; try again later.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h2 className="text-sm font-semibold text-amber-200/90">Tips</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>Import a handful of URLs at a time for best results.</li>
              <li>Wait about a second between URLs—we throttle automatically.</li>
              <li>Use the same post URL you would share publicly from Instagram.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
