"use client";

import { useState } from "react";
import Link from "next/link";

type LineResult = {
  url: string;
  status: string;
  message: string;
  entryId?: string;
  title?: string;
};

const statusStyles: Record<string, string> = {
  CREATED: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  PARTIAL: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  DUPLICATE: "bg-zinc-700/80 text-zinc-300 ring-zinc-600",
  FAILED: "bg-red-500/15 text-red-300 ring-red-500/30",
};

function StatusBadge({ status }: { status: string }) {
  const key = status.toUpperCase();
  const style = statusStyles[key] ?? "bg-zinc-800 text-zinc-300 ring-zinc-700";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
      {status}
    </span>
  );
}

export function ImportForm() {
  const [urlsText, setUrlsText] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<LineResult[]>([]);
  const [summary, setSummary] = useState("");

  async function startImport() {
    const lines = urlsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setSummary("Paste at least one URL.");
      return;
    }

    setRunning(true);
    setResults([]);
    setSummary("Processing…");

    const counts = { created: 0, partial: 0, duplicate: 0, failed: 0 };
    const out: LineResult[] = [];

    for (const url of lines) {
      try {
        const res = await fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) {
          out.push({ url, status: "FAILED", message: data.error ?? "Failed" });
          counts.failed++;
        } else {
          out.push(data);
          const s = (data.status as string).toLowerCase();
          if (s in counts) counts[s as keyof typeof counts]++;
        }
      } catch {
        out.push({ url, status: "FAILED", message: "Network error" });
        counts.failed++;
      }
      setResults([...out]);
      await new Promise((r) => setTimeout(r, 1200));
    }

    setSummary(
      `Done — created ${counts.created}, partial ${counts.partial}, duplicate ${counts.duplicate}, failed ${counts.failed}`
    );
    setRunning(false);
  }

  const lineCount = urlsText.split("\n").map((l) => l.trim()).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
        <label htmlFor="import-urls" className="text-sm font-medium text-zinc-200">
          Instagram URLs
        </label>
        <p className="mt-1 text-sm text-zinc-500">One public post or reel URL per line.</p>
        <textarea
          id="import-urls"
          rows={12}
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          placeholder={
            "https://www.instagram.com/p/ABC123/\nhttps://www.instagram.com/reel/XYZ789/"
          }
          className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 p-4 font-mono text-sm leading-relaxed"
          disabled={running}
        />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={startImport}
            disabled={running || lineCount === 0}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "Importing…" : lineCount > 0 ? `Import ${lineCount} URL${lineCount === 1 ? "" : "s"}` : "Import URLs"}
          </button>
          {running ? (
            <span className="text-sm text-zinc-400">Processing one URL at a time…</span>
          ) : summary ? (
            <span className="text-sm text-zinc-400">{summary}</span>
          ) : null}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <div className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-200">Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-500">
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {results.map((r) => (
                  <tr key={r.url} className="bg-zinc-900/30 hover:bg-zinc-900/60">
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-zinc-400" title={r.url}>
                      {r.url}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{r.title ?? "—"}</td>
                    <td className="px-4 py-3">
                      {r.entryId ? (
                        <Link
                          href={`/dashboard/entries/${r.entryId}`}
                          className="font-medium text-violet-400 hover:text-violet-300"
                        >
                          View entry
                        </Link>
                      ) : (
                        <span className="text-zinc-500">{r.message}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
