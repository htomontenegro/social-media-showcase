import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, hint, href, icon }: Props) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-400">{label}</p>
        {icon ? <span className="text-zinc-500">{icon}</span> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </>
  );

  const className =
    "rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900";

  if (href) {
    return (
      <Link href={href} className={`block ${className}`}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
