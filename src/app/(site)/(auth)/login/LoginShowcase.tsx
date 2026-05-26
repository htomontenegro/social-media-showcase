"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";

type Props = {
  widgetToken: string;
  embedBaseUrl: string;
  googleAuthEnabled: boolean;
};

export function LoginShowcase({ widgetToken, embedBaseUrl, googleAuthEnabled }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const targetId = `smp-widget-${widgetToken}`;
  const scriptSrc = `${embedBaseUrl}/embed/v1/embed.js`;

  useEffect(() => {
    const existing = document.querySelector(`script[data-target="${targetId}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.setAttribute("data-widget", widgetToken);
    script.setAttribute("data-target", targetId);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [scriptSrc, targetId, widgetToken]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div id={targetId} className="absolute inset-0" style={{ height: "100vh" }} />

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute inset-x-6 top-6 sm:inset-x-auto sm:top-auto sm:bottom-6 sm:left-6 sm:max-w-md">
          <div className="rounded-2xl border border-white/20 bg-black/60 p-5 shadow-2xl backdrop-blur-md sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
              You&apos;re viewing a live embed
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-white sm:text-2xl">
              Want your Instagram posts to look like this on your website?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Import your feed, pick carousel, grid, or wall and then drop one snippet on any site.
            </p>
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="mt-4 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-zinc-100 sm:w-auto"
            >
              Get started
            </button>
          </div>
        </div>

        <div className="pointer-events-auto absolute bottom-6 right-6 flex flex-col items-end gap-3">
          {!panelOpen ? (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="rounded-full border border-white/25 bg-black/55 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-black/70"
            >
              Sign in
            </button>
          ) : (
            <div className="w-full max-w-sm rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-5 shadow-2xl backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-100">Sign in</p>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label="Close sign in"
                >
                  Close
                </button>
              </div>
              <LoginForm googleAuthEnabled={googleAuthEnabled} compact />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
