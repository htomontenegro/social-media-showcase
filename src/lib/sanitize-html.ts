import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      "a",
      "b",
      "br",
      "div",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "i",
      "img",
      "p",
      "span",
      "strong",
      "ul",
      "ol",
      "li",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "src", "alt", "title"],
    ALLOW_DATA_ATTR: false,
  });
}
