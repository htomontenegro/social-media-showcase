export type ParsedPost = {
  authorName: string;
  authorBio: string;
  authorHandle: string;
  caption: string;
  likes: number;
  comments: number;
  postedDate: string;
};

export function parsePost(
  platform: string,
  ogTitle: string,
  ogDescription: string
): ParsedPost {
  const result: ParsedPost = {
    authorName: "",
    authorBio: "",
    authorHandle: "",
    caption: "",
    likes: 0,
    comments: 0,
    postedDate: "",
  };

  switch (platform) {
    case "instagram":
    case "facebook":
      parseMetaStyle(platform === "instagram" ? "Instagram" : "Facebook", ogTitle, ogDescription, result);
      break;
    default:
      result.caption = extractCaptionFallback(ogDescription) || ogDescription;
  }

  return result;
}

function parseMetaStyle(
  platformLabel: string,
  title: string,
  description: string,
  result: ParsedPost
): void {
  const label = platformLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const titlePattern = new RegExp(
    `^(?<name>.+?)(?:\\s+[\\-\\|]\\s+(?<bio>.+?))?\\s+on\\s+${label}:\\s*[“"'](?<caption>.+)[”"']\\.?\\s*$`,
    "su"
  );
  const titleMatch = title.trim().match(titlePattern);
  if (titleMatch?.groups) {
    result.authorName = (titleMatch.groups.name ?? "").trim();
    result.authorBio = (titleMatch.groups.bio ?? "").trim();
    result.caption = (titleMatch.groups.caption ?? "").trim();
  }

  const descPattern =
    /^(?<likes>[\d,]+)\s+likes?,\s*(?<comments>[\d,]+)\s+comments?\s+-\s+(?<handle>[^\s]+)\s+on\s+(?<date>[^:]+?):\s*[“"'](?<caption>.+)[”"']\.?\s*$/su;
  const descMatch = description.trim().match(descPattern);
  if (descMatch?.groups) {
    result.likes = parseInt((descMatch.groups.likes ?? "0").replace(/,/g, ""), 10);
    result.comments = parseInt((descMatch.groups.comments ?? "0").replace(/,/g, ""), 10);
    result.authorHandle = (descMatch.groups.handle ?? "").trim().replace(/^@/, "");
    result.postedDate = (descMatch.groups.date ?? "").trim();
    const descCaption = (descMatch.groups.caption ?? "").trim();
    if (descCaption && descCaption.length > result.caption.length) {
      result.caption = descCaption;
    }
  }

  if (!result.caption) {
    result.caption = extractCaptionFallback(description);
  }
}

function extractCaptionFallback(text: string): string {
  const m = text.trim().match(/[“"'](?<caption>.+)[”"']\.?\s*$/su);
  return m?.groups?.caption ? (m.groups.caption as string).trim() : "";
}

export function truncateForTitle(caption: string, maxChars = 120): string {
  const trimmed = caption.trim();
  if (!trimmed) return "";
  if (trimmed.length > maxChars) {
    return trimmed.slice(0, maxChars - 1) + "…";
  }
  return trimmed;
}
