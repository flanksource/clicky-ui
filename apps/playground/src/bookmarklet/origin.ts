export function bookmarkletParentOrigin(url: string): string {
  const parsed = new URL(url);
  return parsed.protocol === "file:" ? "null" : parsed.origin;
}

export function matchesBookmarkletParent(options: { expected: string; received: string }): boolean {
  // Chromium with file access serializes file message origins as file://.
  return options.expected === "null" ? options.received === "null" || options.received === "file://" : options.received === options.expected;
}
