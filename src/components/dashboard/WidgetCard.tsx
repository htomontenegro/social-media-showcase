"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { embedSnippet } from "@/lib/widget-embed";

type Props = {
  id: string;
  name: string;
  type: string;
  entryCount: number;
  publicToken: string;
  baseUrl: string;
};

export function WidgetCard({ id, name, type, entryCount, publicToken, baseUrl }: Props) {
  const router = useRouter();
  const snippet = embedSnippet(baseUrl, publicToken);
  const [copied, setCopied] = useState(false);

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Could not copy to clipboard.");
    }
  }

  async function remove() {
    if (!confirm(`Delete widget "${name}"?`)) return;
    const res = await fetch(`/api/widgets/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete widget. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="font-medium text-zinc-50">{name}</p>
        <p className="text-sm text-zinc-400">
          {type} · {entryCount} entries
        </p>
        <p className="mt-2 font-mono text-xs text-zinc-500">Token: {publicToken}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          <Link
            href={`/embed/${publicToken}`}
            target="_blank"
            className="text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            Preview
          </Link>
          <Link
            href={`/dashboard/widgets/${id}`}
            className="text-sm text-zinc-300 underline hover:text-zinc-50"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={remove}
            className="text-sm text-red-400 underline hover:text-red-300"
          >
            Remove
          </button>
        </div>
        <div className="flex max-w-xs flex-col items-end gap-1">
          <button
            type="button"
            onClick={copyEmbed}
            className="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500 hover:text-zinc-50"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <code className="whitespace-pre-wrap break-all rounded bg-zinc-800 p-2 text-xs text-zinc-300">
            {snippet}
          </code>
        </div>
      </div>
    </div>
  );
}
