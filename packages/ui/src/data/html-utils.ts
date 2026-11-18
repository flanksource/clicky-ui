import DOMPurify from "dompurify";

// DOMPurify parses each input into a fresh document (~0.7 ms for a highlighted
// SQL cell); a virtualized table re-renders and remounts the same cells on
// every scroll, so outputs are kept in an LRU keyed by the raw HTML.
export const SANITIZE_CACHE_ENTRIES = 1000;
const sanitizeCache = new Map<string, string>();

export function sanitizeHtml(raw: string): string {
  if (!raw) return "";

  // Fail safe in no-DOM contexts (SSR): never echo unsanitized HTML.
  if (typeof window === "undefined") return "";

  const cached = sanitizeCache.get(raw);
  if (cached !== undefined) {
    sanitizeCache.delete(raw);
    sanitizeCache.set(raw, cached);
    return cached;
  }
  const clean = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  sanitizeCache.set(raw, clean);
  if (sanitizeCache.size > SANITIZE_CACHE_ENTRIES) sanitizeCache.delete(sanitizeCache.keys().next().value!);
  return clean;
}

export function isBlockHtml(html: string): boolean {
  return /<(div|p|pre|table|ul|ol|li|details|blockquote|h[1-6])/i.test(html);
}
