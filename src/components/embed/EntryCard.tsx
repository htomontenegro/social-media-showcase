import type { EmbedEntry } from "@/lib/embed-types";

type Variant = "carousel" | "grid";

type Props = {
  entry: EmbedEntry;
  variant: Variant;
};

function shortDesc(text: string | null, max = 100): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};

export function EntryCard({ entry, variant }: Props) {
  const prefix = variant === "carousel" ? "smp-carousel" : "smp-grid";
  const Tag = entry.sourceUrl ? "a" : "div";
  const linkProps = entry.sourceUrl
    ? { href: entry.sourceUrl, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  const platformLabel = platformLabels[entry.platform] ?? "";

  const media = (
    <div className={`${prefix}__media`}>
      {entry.imageUrl ? (
        <img
          src={entry.imageUrl}
          alt={entry.authorHandle ? `@${entry.authorHandle}` : entry.title ?? ""}
          className={`${prefix}__image`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={`${prefix}__image-placeholder`} aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
      {platformLabel ? (
        <span className={`${prefix}__platform ${prefix}__platform--${entry.platform}`}>
          {platformLabel}
        </span>
      ) : null}
    </div>
  );

  const body = (
    <div className={`${prefix}__body`}>
      {entry.authorHandle ? (
        <p className={`${prefix}__handle`}>@{entry.authorHandle}</p>
      ) : null}
      {entry.description ? (
        <p className={`${prefix}__description`}>{shortDesc(entry.description)}</p>
      ) : null}
    </div>
  );

  return (
    <Tag className={`${prefix}__card`} {...linkProps}>
      {variant === "carousel" ? (
        <div className={`${prefix}__card-inner`}>
          {media}
          {body}
        </div>
      ) : (
        <>
          {media}
          {body}
        </>
      )}
    </Tag>
  );
}
