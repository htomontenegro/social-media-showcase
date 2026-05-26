"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/brand";

const links = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/import", label: "Import" },
  { href: "/dashboard/entries", label: "Entries" },
  { href: "/dashboard/widgets", label: "Widgets" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-5">
        <Link href="/dashboard" className="block">
          <p className="text-sm font-semibold leading-snug text-zinc-50">{APP_NAME}</p>
          <p className="mt-1 text-xs text-zinc-500">Import · curate · embed</p>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
