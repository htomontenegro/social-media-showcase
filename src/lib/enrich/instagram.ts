import * as cheerio from "cheerio";
import { parsePost, truncateForTitle } from "./post-parser";

const USER_AGENT =
  "Mozilla/5.0 (compatible; SocialMediaPosts/1.0; +https://wordpress.org/)";

export type EnrichedInstagram = {
  platform: string;
  title: string;
  description: string;
  imageUrl: string;
  authorName: string;
  authorHandle: string;
  authorBio: string;
  caption: string;
  rawOg: Record<string, string>;
};

function extractOg(html: string, property: string): string {
  const $ = cheerio.load(html);
  const selectors = [
    `meta[property="og:${property}"]`,
    `meta[name="og:${property}"]`,
    `meta[name="twitter:${property}"]`,
  ];
  for (const sel of selectors) {
    const el = $(sel).first();
    const content = el.attr("content");
    if (content) return content.trim();
  }
  if (property === "title") {
    return $("title").first().text().trim();
  }
  return "";
}

export function isInstagramUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    return host === "instagram.com" || host === "instagr.am";
  } catch {
    return false;
  }
}

/** Canonical form for deduplication (per user). */
export function normalizeInstagramUrl(url: string): string {
  const parsed = new URL(url.trim());
  parsed.protocol = "https:";
  parsed.hostname = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  return parsed.toString();
}

export async function enrichInstagramUrl(url: string): Promise<EnrichedInstagram> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Instagram fetch failed: HTTP ${res.status}`);
  }

  const html = await res.text();
  const headEnd = html.search(/<\/head>/i);
  const headHtml = headEnd >= 0 ? html.slice(0, headEnd) : html;

  const ogTitle = extractOg(headHtml, "title");
  const ogDescription = extractOg(headHtml, "description");
  const ogImage = extractOg(headHtml, "image");

  const parsed = parsePost("instagram", ogTitle, ogDescription);
  const caption = parsed.caption || ogDescription;

  return {
    platform: "instagram",
    title: truncateForTitle(caption) || ogTitle || url,
    description: caption,
    imageUrl: ogImage,
    authorName: parsed.authorName,
    authorHandle: parsed.authorHandle,
    authorBio: parsed.authorBio,
    caption,
    rawOg: { title: ogTitle, description: ogDescription, image: ogImage },
  };
}
