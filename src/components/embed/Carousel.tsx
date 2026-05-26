"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import type { EmbedEntry } from "@/lib/embed-types";
import type { CarouselConfig } from "@/lib/validations/embed-config";
import { EntryCard } from "./EntryCard";
import "@/styles/embed/carousel.css";

gsap.registerPlugin(Observer);

type Props = {
  entries: EmbedEntry[];
  config: CarouselConfig;
};

export function Carousel({ entries, config }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapNode = wrapRef.current;
    if (!wrapNode || entries.length === 0) return;
    const wrap: HTMLDivElement = wrapNode;

    const trackNode = wrap.querySelector(".smp-carousel__track");
    if (!(trackNode instanceof HTMLElement)) return;
    const trackEl: HTMLElement = trackNode;

    let cards = gsap.utils.toArray<HTMLElement>(".smp-carousel__card", trackEl);
    const isLoop = config.loop;
    const visibleCount = config.visible;
    let xPos = 0;
    let xTarget = 0;
    let velocity = 0;
    const velSamples: { x: number; t: number }[] = [];
    let isDragging = false;
    let snapTimer: ReturnType<typeof setTimeout> | undefined;

    const FRICTION = 0.94;
    const MIN_VELOCITY = 0.05;
    const MOMENTUM_STEP = 16;
    const MAX_THROW_CARDS = 3;

    function colGap() {
      return parseFloat(getComputedStyle(trackEl).columnGap) || 24;
    }
    function cardStep() {
      return (cards[0]?.offsetWidth ?? 0) + colGap();
    }
    function centerOffset() {
      return (wrap.offsetWidth - (cards[0]?.offsetWidth ?? 0)) / 2;
    }
    function loopBufferCount() {
      if (cards.length < 2) return 0;
      return Math.min(cards.length - 1, Math.max(0, Math.floor(Math.min(visibleCount, cards.length) / 2)));
    }
    function minBound() {
      return Math.min(0, wrap.offsetWidth - trackEl.scrollWidth);
    }
    function clamp(v: number) {
      return isLoop ? v : gsap.utils.clamp(minBound(), 0, v);
    }
    function refreshCards() {
      cards = gsap.utils.toArray<HTMLElement>(".smp-carousel__card", trackEl);
    }
    function loopBaseOffset() {
      return centerOffset() - cardStep() * loopBufferCount();
    }
    function snapBaseOffset() {
      return isLoop ? loopBaseOffset() : centerOffset() - cardStep() * loopBufferCount();
    }
    function snapToNearest() {
      const step = cardStep();
      const base = snapBaseOffset();
      let idx = Math.round((base - xTarget) / step);
      if (!isLoop) idx = Math.max(0, Math.min(cards.length - 1, idx));
      xTarget = clamp(base - idx * step);
    }
    function normalizeLoop() {
      if (!isLoop || cards.length < 2) return;
      const step = cardStep();
      const base = loopBaseOffset();
      while (xPos <= base - step) {
        trackEl.appendChild(cards[0]);
        xPos += step;
        xTarget += step;
        refreshCards();
      }
      while (xPos >= base + step) {
        trackEl.insertBefore(cards[cards.length - 1], cards[0]);
        xPos -= step;
        xTarget -= step;
        refreshCards();
      }
    }
    function updateCards() {
      const wrapLeft = wrap.getBoundingClientRect().left;
      const mid = wrapLeft + wrap.offsetWidth / 2;
      const step = cardStep();
      const maxDist = step * Math.max(1.6, (visibleCount - 1) / 2 + 0.4);
      const { perspective, rotateY, rotateX, depth, scaleCenter, scaleSide } = config;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const cardMid = r.left + r.width / 2;
        const signedDist = cardMid - mid;
        const dist = Math.abs(signedDist);
        const t = gsap.utils.clamp(0, 1, dist / maxDist);
        const side = signedDist >= 0 ? 1 : -1;
        gsap.set(card, {
          scale: gsap.utils.interpolate(scaleCenter, scaleSide, t),
          rotationY: side * gsap.utils.interpolate(0, rotateY, t),
          rotationX: gsap.utils.interpolate(0, rotateX, t),
          z: -gsap.utils.interpolate(0, depth, t),
          transformPerspective: perspective,
          opacity: 1,
          zIndex: Math.max(1, Math.round((1 - t) * 100)),
        });
      });
    }
    function setInitialPosition() {
      if (!cards.length) return;
      const buffer = loopBufferCount();
      if (isLoop && buffer) {
        for (let i = 0; i < buffer; i++) {
          trackEl.insertBefore(cards[cards.length - 1], cards[0]);
          refreshCards();
        }
      }
      xPos = isLoop ? loopBaseOffset() : centerOffset() - cardStep() * buffer;
      xTarget = xPos;
      if (!isLoop) {
        xPos = clamp(xPos);
        xTarget = xPos;
      }
      gsap.set(trackEl, { x: xPos });
      updateCards();
      wrap.classList.remove("is-loading");
      wrap.setAttribute("aria-busy", "false");
    }

    const tick = () => {
      if (!isDragging && Math.abs(velocity) > MIN_VELOCITY) {
        xTarget = clamp(xTarget + velocity * MOMENTUM_STEP);
        velocity *= FRICTION;
        if (Math.abs(velocity) <= MIN_VELOCITY) {
          velocity = 0;
          snapToNearest();
        }
      }
      const diff = xTarget - xPos;
      if (Math.abs(diff) < 0.05) return;
      xPos += isDragging ? diff : diff * 0.32;
      normalizeLoop();
      gsap.set(trackEl, { x: xPos });
      updateCards();
    };
    gsap.ticker.add(tick);

    const obs = Observer.create({
      target: wrap,
      type: "pointer",
      dragMinimum: 3,
      onPress: () => {
        velocity = 0;
        velSamples.length = 0;
        clearTimeout(snapTimer);
        xTarget = xPos;
      },
      onDragStart: () => {
        isDragging = true;
        wrap.classList.add("is-dragging");
      },
      onDrag: (self) => {
        const now = performance.now();
        const x = self.x ?? 0;
        const deltaX = self.deltaX ?? 0;
        velSamples.push({ x, t: now });
        while (velSamples.length > 2 && now - velSamples[0].t > 100) velSamples.shift();
        const span = now - velSamples[0].t;
        velocity = span > 0 ? (x - velSamples[0].x) / span : 0;
        xTarget = clamp(xTarget + deltaX);
      },
      onDragEnd: () => {
        isDragging = false;
        wrap.classList.remove("is-dragging");
        const maxV = (MAX_THROW_CARDS * cardStep() * (1 - FRICTION)) / MOMENTUM_STEP;
        velocity = gsap.utils.clamp(-maxV, maxV, velocity);
        if (Math.abs(velocity) < MIN_VELOCITY) {
          velocity = 0;
          snapToNearest();
        }
      },
      preventDefault: true,
    });

    const prevBtn = wrap.querySelector(".smp-carousel__arrow--prev");
    const nextBtn = wrap.querySelector(".smp-carousel__arrow--next");
    const onPrev = () => {
      velocity = 0;
      xTarget = clamp(xTarget + cardStep());
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToNearest, 500);
    };
    const onNext = () => {
      velocity = 0;
      xTarget = clamp(xTarget - cardStep());
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToNearest, 500);
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocity = 0;
      clearTimeout(snapTimer);
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      xTarget = clamp(xTarget - delta * 0.6);
      snapTimer = setTimeout(snapToNearest, 400);
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });

    const onResize = () => {
      snapToNearest();
      updateCards();
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(setInitialPosition);

    return () => {
      gsap.ticker.remove(tick);
      obs.kill();
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      wrap.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      clearTimeout(snapTimer);
    };
  }, [
    entries,
    config.loop,
    config.visible,
    config.cardGap,
    config.perspective,
    config.rotateY,
    config.depth,
    config.rotateX,
    config.scaleCenter,
    config.scaleSide,
  ]);

  if (entries.length === 0) return null;

  const carouselStyle = {
    "--smp-gap": `${config.cardGap}px`,
    "--smp-perspective": `${config.perspective}px`,
    "--smp-center-scale": String(config.scaleCenter),
  } as React.CSSProperties;

  return (
    <div
      ref={wrapRef}
      className="smp-carousel is-loading"
      role="region"
      aria-label="Social Media Posts"
      aria-busy="true"
      data-loop={config.loop ? "1" : "0"}
      data-visible={String(config.visible)}
      style={carouselStyle}
    >
      <div className="smp-carousel__viewport">
        <div className="smp-carousel__track">
          {entries.map((entry, i) => (
            <EntryCard key={`${entry.sourceUrl}-${i}`} entry={entry} variant="carousel" />
          ))}
        </div>
      </div>
      <div className="smp-carousel__loader" aria-hidden="true">
        <span className="smp-carousel__spinner" />
      </div>
      <button type="button" className="smp-carousel__arrow smp-carousel__arrow--prev" aria-label="Previous post">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button type="button" className="smp-carousel__arrow smp-carousel__arrow--next" aria-label="Next post">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
