import DOMPurify from "dompurify";

export function sanitizeHtml(raw: string): string {
  if (!raw) return "";

  // Fail safe in no-DOM contexts (SSR): never echo unsanitized HTML.
  if (typeof window === "undefined") return "";

  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}

export function isBlockHtml(html: string): boolean {
  return /<(div|p|pre|table|ul|ol|li|details|blockquote|h[1-6])/i.test(html);
}
