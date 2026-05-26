"use client";

import { useEffect, useRef, useId, useState } from "react";
import type { EmbedEntry } from "@/lib/embed-types";
import type { WallConfig } from "@/lib/validations/embed-config";
import { sanitizeHtml } from "@/lib/sanitize-html";
import "@/styles/embed/wall.css";

type Props = {
  entries: EmbedEntry[];
  config: WallConfig;
  interactive?: boolean;
};

/** Stable tile order for SSR + hydration (no Math.random). */
function buildTilesDeterministic(entries: EmbedEntry[], columns: number, rows: number): EmbedEntry[] {
  if (entries.length === 0) return [];
  const needed = columns * rows;
  const tiles: EmbedEntry[] = [];
  for (let i = 0; i < needed; i++) {
    tiles.push(entries[i % entries.length]);
  }
  return tiles;
}

function shuffleTiles(tiles: EmbedEntry[]): EmbedEntry[] {
  return [...tiles].sort(() => Math.random() - 0.5);
}

export function Wall({ entries, config, interactive = true }: Props) {
  const uid = useId().replace(/:/g, "");
  const wallRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [tiles, setTiles] = useState<EmbedEntry[]>(() =>
    buildTilesDeterministic(entries, config.columns, config.rows)
  );

  useEffect(() => {
    setTiles(shuffleTiles(buildTilesDeterministic(entries, config.columns, config.rows)));
  }, [entries, config.columns, config.rows]);

  const colsLg = config.columns;
  const colsMd = Math.min(config.columns, 8);
  const colsSm = Math.min(config.columns, 6);
  const colsXs = Math.min(config.columns, 4);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const grid = wall.querySelector(".smp-wall__grid");
    if (!grid) return;
    const tileEls = Array.from(grid.querySelectorAll<HTMLElement>(".smp-wall__tile"));
    if (tileEls.length < 4) return;

    const interval = Math.max(600, Math.min(60000, config.interval));
    const swaps = Math.max(1, Math.min(30, config.swaps));
    const FADE = 450;
    const busy: HTMLElement[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;
    let visible = true;

    function jittered() {
      const spread = interval * 0.25;
      return Math.max(500, interval + (Math.random() * 2 - 1) * spread);
    }
    function stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
    function start() {
      if (timer === null && visible && !document.hidden) {
        const run = () => {
          tick();
          timer = setTimeout(run, jittered());
        };
        timer = setTimeout(run, jittered());
      }
    }
    function tick() {
      if (!visible || document.hidden) return;
      for (let i = 0; i < swaps; i++) {
        const pair = pick();
        if (pair) swap(pair[0], pair[1]);
      }
    }
    function pick(): [HTMLElement, HTMLElement] | null {
      let guard = 0;
      let a = tileEls[(Math.random() * tileEls.length) | 0];
      let b = tileEls[(Math.random() * tileEls.length) | 0];
      while ((a === b || busy.includes(a) || busy.includes(b)) && guard++ < 40) {
        a = tileEls[(Math.random() * tileEls.length) | 0];
        b = tileEls[(Math.random() * tileEls.length) | 0];
      }
      if (a === b || busy.includes(a) || busy.includes(b)) return null;
      return [a, b];
    }
    function release(node: HTMLElement) {
      const i = busy.indexOf(node);
      if (i !== -1) busy.splice(i, 1);
    }
    function swap(a: HTMLElement, b: HTMLElement) {
      const ca = a.firstElementChild;
      const cb = b.firstElementChild;
      if (!ca || !cb) return;
      busy.push(a, b);
      if (!ca.animate) {
        a.appendChild(cb);
        b.appendChild(ca);
        release(a);
        release(b);
        return;
      }
      let out = 2;
      const afterOut = () => {
        if (--out > 0) return;
        a.appendChild(cb);
        b.appendChild(ca);
        let inn = 2;
        const afterIn = () => {
          if (--inn === 0) {
            release(a);
            release(b);
          }
        };
        fade(ca as HTMLElement, 0, 1, afterIn);
        fade(cb as HTMLElement, 0, 1, afterIn);
      };
      fade(ca as HTMLElement, 1, 0, afterOut);
      fade(cb as HTMLElement, 1, 0, afterOut);
    }
    function fade(node: HTMLElement, from: number, to: number, done: () => void) {
      const anim = node.animate([{ opacity: from }, { opacity: to }], {
        duration: FADE,
        easing: "ease",
        fill: "forwards",
      });
      anim.addEventListener("finish", () => {
        node.style.opacity = String(to);
        anim.cancel();
        done();
      });
    }

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(
      (ents) => {
        visible = ents[0]?.isIntersecting ?? true;
        if (visible) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 }
    );
    io.observe(wall);
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, [tiles, config.interval, config.swaps]);

  if (entries.length === 0) return null;

  const focusOpacity = 1;
  const focusBlur = 0;

  return (
    <>
      <style>{`
        #${uid} { --smp-wall-cols: ${colsLg}; --smp-wall-rows: ${config.rows}; --smp-wall-gap: ${config.gap}px; --smp-wall-bg: ${config.background}; --smp-wall-opacity: ${config.opacity}; --smp-wall-blur: ${config.blur}px; --smp-wall-focus-opacity: ${focusOpacity}; --smp-wall-focus-blur: ${focusBlur}px; }
        @media (max-width: 1200px) { #${uid} { --smp-wall-cols: ${colsMd}; } }
        @media (max-width: 900px) { #${uid} { --smp-wall-cols: ${colsSm}; } }
        @media (max-width: 600px) { #${uid} { --smp-wall-cols: ${colsXs}; } }
      `}</style>
      <div
        id={uid}
        ref={wallRef}
        className={`smp-wall${focused && interactive ? " is-focused" : ""}${interactive ? " is-interactive" : ""}`}
        data-interval={String(config.interval)}
        data-swaps={String(config.swaps)}
        onMouseEnter={interactive ? () => setFocused(true) : undefined}
        onMouseLeave={interactive ? () => setFocused(false) : undefined}
        onMouseMove={interactive ? () => setFocused(true) : undefined}
      >
        <div className="smp-wall__grid" role="presentation">
          {tiles.map((entry, i) => {
            const inner = entry.imageUrl ? (
              <img src={entry.imageUrl} alt="" className="smp-wall__img" loading="lazy" decoding="async" />
            ) : (
              <div className="smp-wall__img smp-wall__placeholder" aria-hidden="true" />
            );
            if (interactive && entry.sourceUrl) {
              return (
                <a
                  key={`${entry.sourceUrl}-${i}`}
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="smp-wall__tile"
                  aria-label={entry.description ?? entry.title ?? "View post"}
                >
                  {inner}
                </a>
              );
            }
            return (
              <div key={`${entry.sourceUrl}-${i}`} className="smp-wall__tile" aria-hidden={!interactive}>
                {inner}
              </div>
            );
          })}
        </div>
        {config.overlayHtml ? (
          <>
            <div className="smp-wall__scrim" aria-hidden="true" />
            <div
              className="smp-wall__overlay"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.overlayHtml) }}
            />
          </>
        ) : null}
      </div>
    </>
  );
}
