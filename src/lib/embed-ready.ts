export const EMBED_READY_MESSAGE_TYPE = "smp-embed-ready" as const;

export type EmbedReadyMessage = {
  type: typeof EMBED_READY_MESSAGE_TYPE;
  token: string;
};

export function isEmbedReadyMessage(data: unknown): data is EmbedReadyMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as EmbedReadyMessage).type === EMBED_READY_MESSAGE_TYPE &&
    typeof (data as EmbedReadyMessage).token === "string"
  );
}

export function postEmbedReady(token: string) {
  if (window.parent === window) return;
  const message: EmbedReadyMessage = { type: EMBED_READY_MESSAGE_TYPE, token };
  window.parent.postMessage(message, window.location.origin);
}

/** Resolves when images under `root` have loaded or errored, or after `timeoutMs`. */
export function waitForEmbedImages(
  root: ParentNode,
  options?: { timeoutMs?: number }
): Promise<void> {
  const timeoutMs = options?.timeoutMs ?? 8000;
  const imgs = Array.from(root.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();

  for (const img of imgs) {
    if (!img.complete && img.loading === "lazy") {
      img.loading = "eager";
    }
  }

  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timer = setTimeout(finish, timeoutMs);
    let remaining = pending.length;

    for (const img of pending) {
      const onDone = () => {
        remaining -= 1;
        if (remaining <= 0) {
          clearTimeout(timer);
          finish();
        }
      };
      img.addEventListener("load", onDone, { once: true });
      img.addEventListener("error", onDone, { once: true });
    }
  });
}
