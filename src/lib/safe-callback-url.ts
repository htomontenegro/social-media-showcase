const SAFE_CALLBACK = /^\/[a-zA-Z0-9/_\-.]*(\?[a-zA-Z0-9_\-./=&%]*)?$/;

export function safeCallbackUrl(
  url: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://") || trimmed.includes("\\")) return fallback;
  if (!SAFE_CALLBACK.test(trimmed)) return fallback;
  return trimmed;
}
