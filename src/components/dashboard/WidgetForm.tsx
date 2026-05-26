"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmbedHost } from "@/components/embed/EmbedHost";
import type { EmbedEntry, EmbedPayload } from "@/lib/embed-types";
import {
  getWidgetConfigDefaults,
  normalizeWidgetConfig,
} from "@/lib/widget-config-defaults";
import { parseWidgetConfig, safeParseWidgetConfig } from "@/lib/validations/widget";

type WidgetType = EmbedPayload["type"];

type Entry = {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  authorHandle: string | null;
  authorName: string | null;
  platform: string;
};

type InitialWidget = {
  id: string;
  name: string;
  type: WidgetType;
  config: Record<string, unknown>;
  publicToken: string;
  entryIds: string[];
};

type Props = {
  baseUrl: string;
  initial?: InitialWidget;
  /** Server-loaded entries so preview works immediately on edit. */
  initialEntries?: Entry[];
};

const TYPE_OPTIONS: { value: WidgetType; label: string; description: string }[] = [
  { value: "CAROUSEL", label: "Carousel", description: "Scrollable card strip" },
  { value: "GRID", label: "Grid", description: "Static grid layout" },
  { value: "WALL", label: "Wall", description: "Animated photo wall" },
  { value: "WALL_CAROUSEL", label: "Wall + Carousel", description: "Wall background with centered carousel" },
];

export function WidgetForm({ baseUrl, initial, initialEntries }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [entries, setEntries] = useState<Entry[]>(initialEntries ?? []);
  const [entriesLoading, setEntriesLoading] = useState(initialEntries === undefined);
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<WidgetType>(initial?.type ?? "CAROUSEL");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initial?.entryIds ?? [])
  );
  const [token, setToken] = useState<string | null>(initial?.publicToken ?? null);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<Record<string, unknown>>(() =>
    normalizeWidgetConfig(initial?.type ?? "CAROUSEL", initial?.config)
  );

  useEffect(() => {
    let cancelled = false;
    if (initialEntries === undefined) setEntriesLoading(true);
    fetch("/api/entries")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list: Entry[] = d.entries ?? [];
        setEntries(list);
        setSelected((prev) => {
          const valid = new Set(list.map((e) => e.id));
          const next = new Set([...prev].filter((id) => valid.has(id)));
          return next.size === prev.size ? prev : next;
        });
      })
      .finally(() => {
        if (!cancelled) setEntriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const embedEntries: EmbedEntry[] = entries
    .filter((e) => selected.has(e.id))
    .map((e) => ({
      title: e.title,
      description: e.description,
      imageUrl: e.imageUrl,
      sourceUrl: e.sourceUrl,
      authorHandle: e.authorHandle,
      authorName: e.authorName,
      platform: e.platform,
    }));

  const previewConfig = (() => {
    const parsed = safeParseWidgetConfig(type, config);
    return parsed.success ? parsed.data : getWidgetConfigDefaults(type);
  })();

  const previewPayload: EmbedPayload | null =
    embedEntries.length > 0
      ? { type, config: previewConfig, entries: embedEntries }
      : null;

  const allSelected = entries.length > 0 && selected.size === entries.length;
  const someSelected = selected.size > 0 && selected.size < entries.length;

  const previewMessage = (() => {
    if (entriesLoading && embedEntries.length === 0) return "Loading preview…";
    if (entries.length === 0) {
      return "Import entries first, then select them below to preview.";
    }
    if (selected.size === 0) return "Select entries to preview.";
    if (embedEntries.length === 0) {
      return "Selected entries are no longer available. Choose entries below.";
    }
    return null;
  })();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(entries.map((e) => e.id)));
    }
  }

  function handleTypeChange(newType: WidgetType) {
    setType(newType);
    setConfig((prev) => normalizeWidgetConfig(newType, prev));
  }

  function setConfigInt(key: string, raw: string, min: number, max: number) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    setConfig((prev) => ({ ...prev, [key]: Math.min(max, Math.max(min, n)) }));
  }

  function setConfigNum(key: string, value: number, min: number, max: number) {
    setConfig((prev) => ({ ...prev, [key]: Math.min(max, Math.max(min, value)) }));
  }

  function carouselConfigFields() {
    return (
      <>
        <div>
          <label className="block text-xs font-medium">
            Card gap ({Number(config.cardGap)}px)
          </label>
          <input
            type="range"
            min={0}
            max={80}
            step={2}
            value={Number(config.cardGap)}
            onChange={(e) => setConfigNum("cardGap", Number(e.target.value), 0, 80)}
            className="mt-1 w-full"
          />
        </div>
        <p className="text-sm font-medium text-zinc-300">3D carousel</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium">
              Perspective ({Number(config.perspective)}px)
            </label>
            <input
              type="range"
              min={400}
              max={3000}
              step={50}
              value={Number(config.perspective)}
              onChange={(e) => setConfigNum("perspective", Number(e.target.value), 400, 3000)}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">
              Side rotation ({Number(config.rotateY)}°)
            </label>
            <input
              type="range"
              min={0}
              max={60}
              step={1}
              value={Number(config.rotateY)}
              onChange={(e) => setConfigNum("rotateY", Number(e.target.value), 0, 60)}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Depth ({Number(config.depth)}px)</label>
            <input
              type="range"
              min={0}
              max={200}
              step={4}
              value={Number(config.depth)}
              onChange={(e) => setConfigNum("depth", Number(e.target.value), 0, 200)}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Tilt ({Number(config.rotateX)}°)</label>
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={Number(config.rotateX)}
              onChange={(e) => setConfigNum("rotateX", Number(e.target.value), 0, 25)}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">
              Center scale ({Number(config.scaleCenter).toFixed(2)})
            </label>
            <input
              type="range"
              min={0.85}
              max={1.35}
              step={0.01}
              value={Number(config.scaleCenter)}
              onChange={(e) => setConfigNum("scaleCenter", Number(e.target.value), 0.85, 1.35)}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">
              Side scale ({Number(config.scaleSide).toFixed(2)})
            </label>
            <input
              type="range"
              min={0.35}
              max={1}
              step={0.01}
              value={Number(config.scaleSide)}
              onChange={(e) => setConfigNum("scaleSide", Number(e.target.value), 0.35, 1)}
              className="mt-1 w-full"
            />
          </div>
        </div>
      </>
    );
  }

  async function save() {
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (selected.size === 0) {
      setError("Select at least one entry");
      return;
    }
    const payload = {
      name,
      config: parseWidgetConfig(type, config),
      entryIds: Array.from(selected),
    };
    const res = await fetch(isEdit ? `/api/widgets/${initial!.id}` : "/api/widgets", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isEdit ? payload : { ...payload, type }
      ),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? (isEdit ? "Failed to update widget" : "Failed to create widget"));
      return;
    }
    setToken(data.widget.publicToken);
    if (isEdit) {
      router.push("/dashboard/widgets");
    }
    router.refresh();
  }

  const snippet = token
    ? `<div id="smp-widget-${token}" style="height:100vh"></div>
<script async src="${baseUrl}/embed/v1/embed.js" data-widget="${token}" data-target="smp-widget-${token}"></script>`
    : "";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Widget name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        {isEdit ? (
          <p className="text-sm text-zinc-400">
            Type: <span className="font-medium text-zinc-200">{type}</span>
          </p>
        ) : (
          <div>
            <p className="text-sm font-medium">Type</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTypeChange(opt.value)}
                  className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                    type === opt.value
                      ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className={`mt-0.5 block text-xs ${type === opt.value ? "text-zinc-600" : "text-zinc-500"}`}>
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {type === "CAROUSEL" || type === "WALL_CAROUSEL" ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(config.loop)}
              onChange={(e) => setConfig({ ...config, loop: e.target.checked })}
            />
            Infinite loop
          </label>
        ) : null}
        {type === "CAROUSEL" ? carouselConfigFields() : null}
        {type === "GRID" ? (
          <>
            <div>
              <label className="block text-sm font-medium">Columns (1–4)</label>
              <input
                type="number"
                min={1}
                max={4}
                value={Number(config.columns)}
                onChange={(e) => setConfigInt("columns", e.target.value, 1, 4)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Gap ({Number(config.gap)}px)</label>
              <input
                type="range"
                min={0}
                max={64}
                step={2}
                value={Number(config.gap)}
                onChange={(e) => setConfigNum("gap", Number(e.target.value), 0, 64)}
                className="mt-1 w-full"
              />
            </div>
          </>
        ) : null}
        {type === "WALL" ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium">Columns</label>
                <input
                  type="number"
                  min={2}
                  max={16}
                  value={Number(config.columns)}
                  onChange={(e) => setConfigInt("columns", e.target.value, 2, 16)}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Rows</label>
                <input
                  type="number"
                  min={2}
                  max={16}
                  value={Number(config.rows)}
                  onChange={(e) => setConfigInt("rows", e.target.value, 2, 16)}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium">Wall gap ({Number(config.gap)}px)</label>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={Number(config.gap)}
                onChange={(e) => setConfigNum("gap", Number(e.target.value), 0, 40)}
                className="mt-1 w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium">Opacity ({Number(config.opacity).toFixed(2)})</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={Number(config.opacity)}
                  onChange={(e) => setConfig({ ...config, opacity: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Blur ({Number(config.blur)}px)</label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={Number(config.blur)}
                  onChange={(e) => setConfig({ ...config, blur: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Overlay HTML (optional)</label>
              <textarea
                value={String(config.overlayHtml ?? "")}
                onChange={(e) => setConfig({ ...config, overlayHtml: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono"
              />
            </div>
          </>
        ) : null}
        {type === "WALL_CAROUSEL" ? (
          <>
            <div>
              <label className="block text-xs font-medium">Wall gap ({Number(config.gap)}px)</label>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={Number(config.gap)}
                onChange={(e) => setConfigNum("gap", Number(e.target.value), 0, 40)}
                className="mt-1 w-full"
              />
            </div>
            {carouselConfigFields()}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium">Wall opacity ({Number(config.opacity).toFixed(2)})</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={Number(config.opacity)}
                  onChange={(e) => setConfig({ ...config, opacity: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Wall blur ({Number(config.blur)}px)</label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={Number(config.blur)}
                  onChange={(e) => setConfig({ ...config, blur: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium">Columns</label>
                <input
                  type="number"
                  min={2}
                  max={16}
                  value={Number(config.columns)}
                  onChange={(e) => setConfigInt("columns", e.target.value, 2, 16)}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Rows</label>
                <input
                  type="number"
                  min={2}
                  max={16}
                  value={Number(config.rows)}
                  onChange={(e) => setConfigInt("rows", e.target.value, 2, 16)}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>
            </div>
          </>
        ) : null}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Entries</p>
            {entries.length > 0 ? (
              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
                Select all
              </label>
            ) : null}
          </div>
          <div className="mt-2 max-h-48 overflow-y-auto rounded border border-zinc-700 divide-y divide-zinc-800">
            {entriesLoading && entries.length === 0 ? (
              <p className="px-3 py-4 text-sm text-zinc-500">Loading entries…</p>
            ) : null}
            {!entriesLoading && entries.length === 0 ? (
              <p className="px-3 py-4 text-sm text-zinc-500">
                No entries yet.{" "}
                <a href="/dashboard/import" className="text-zinc-300 underline hover:text-white">
                  Import some
                </a>{" "}
                to preview and embed.
              </p>
            ) : null}
            {entries.map((e) => (
              <label key={e.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
                <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} />
                <span className="truncate">{(e.description ?? e.title ?? e.sourceUrl).slice(0, 60)}</span>
              </label>
            ))}
          </div>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="button"
          onClick={save}
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          {isEdit ? "Update widget" : "Save widget"}
        </button>
        {snippet ? (
          <div>
            <p className="text-sm font-medium">Embed code</p>
            <textarea readOnly value={snippet} rows={4} className="mt-1 w-full rounded border font-mono text-xs p-2" />
          </div>
        ) : null}
      </div>
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 min-h-[320px] overflow-x-hidden overflow-y-visible">
        <p className="text-sm font-medium text-zinc-400 mb-4">Preview</p>
        {previewPayload ? (
          <div className="smp-embed-preview">
            <EmbedHost payload={previewPayload} />
          </div>
        ) : (
          <p className="text-sm text-zinc-500">{previewMessage}</p>
        )}
      </div>
    </div>
  );
}
