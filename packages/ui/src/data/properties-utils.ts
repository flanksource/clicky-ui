export function formatPropertyLabel(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\.+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
