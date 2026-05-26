import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { auth } from "@/lib/auth";
import { APP_NAME } from "@/lib/brand";
import { prisma } from "@/lib/db";

const workflow = [
  {
    step: "1",
    title: "Import posts",
    body: "Paste public Instagram post or reel URLs. We fetch captions, author info, and images via Open Graph and store them in your library.",
    href: "/dashboard/import",
    cta: "Go to import",
  },
  {
    step: "2",
    title: "Review entries",
    body: "Each URL becomes an entry with thumbnail, caption, and link back to Instagram. Fix partial imports manually if enrichment missed a field.",
    href: "/dashboard/entries",
    cta: "View entries",
  },
  {
    step: "3",
    title: "Build a widget",
    body: "Pick entries and a layout—carousel, grid, wall, or wall carousel. Configure colors, spacing, and behavior in the widget editor.",
    href: "/dashboard/widgets/new",
    cta: "Create widget",
  },
  {
    step: "4",
    title: "Embed anywhere",
    body: "Copy a short script snippet or open the public preview. The widget loads on your site without iframes locking you in.",
    href: "/dashboard/widgets",
    cta: "Manage widgets",
  },
];

const outcomes = [
  {
    title: "Carousel",
    description: "Horizontal scroll of posts with optional autoplay—great for hero sections and landing pages.",
  },
  {
    title: "Grid",
    description: "Responsive masonry-style layout for portfolios, press pages, or “as seen on social” blocks.",
  },
  {
    title: "Wall & wall carousel",
    description: "Dense social walls or animated strips when you need maximum posts visible at once.",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [entryCount, widgetCount] = await Promise.all([
    prisma.entry.count({ where: { userId } }),
    prisma.widget.count({ where: { userId } }),
  ]);

  const isNew = entryCount === 0 && widgetCount === 0;

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Welcome to ${APP_NAME}`}
        description="Turn Instagram URLs into a curated library, then publish embeddable widgets on any website. Everything stays in your account—you control which posts appear and how they look."
      >
        <Link
          href="/dashboard/import"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          Import URLs
        </Link>
        <Link
          href="/dashboard/widgets/new"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
        >
          New widget
        </Link>
      </PageHeader>

      {isNew ? (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-4">
          <p className="text-sm font-medium text-violet-200">Getting started</p>
          <p className="mt-1 text-sm text-violet-100/80">
            Start by importing a few Instagram post URLs, then create your first widget and copy the embed code.
          </p>
        </div>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Your library</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Entries"
            value={entryCount}
            hint="Imported Instagram posts"
            href="/dashboard/entries"
          />
          <StatCard
            label="Widgets"
            value={widgetCount}
            hint="Embeddable showcases"
            href="/dashboard/widgets"
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">How it works</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {workflow.map((w) => (
            <li
              key={w.step}
              className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                {w.step}
              </span>
              <h3 className="mt-3 font-semibold text-zinc-50">{w.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{w.body}</p>
              <Link
                href={w.href}
                className="mt-4 text-sm font-medium text-violet-400 hover:text-violet-300"
              >
                {w.cta} →
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">What you can embed</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Widget types share the same entry data—you choose layout and styling when you create or edit a widget.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {outcomes.map((o) => (
            <li
              key={o.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4"
            >
              <p className="font-medium text-zinc-100">{o.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{o.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="font-semibold text-zinc-50">What you can import today</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li className="flex gap-2">
            <span className="text-emerald-500">✓</span>
            <span>
              <strong className="text-zinc-300">Instagram posts & reels</strong> — public URLs like
              instagram.com/p/… or /reel/…
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-600">·</span>
            <span>Captions, descriptions, author handle, and cover image when Open Graph provides them</span>
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-600">·</span>
            <span>Images compressed and hosted so embeds load fast (target max ~500KB per image)</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
