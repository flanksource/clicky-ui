import type { FileFinding } from "./types";

/**
 * The finding's message as read at the value it is about: a schema finding's
 * `<path>: ` prefix repeats where the reader already is, so it is dropped.
 */
export function messageAtValue({ message, path }: Pick<FileFinding, "message" | "path">): string {
  const prefix = path ? `${path}: ` : "";
  return prefix && message.startsWith(prefix) ? message.slice(prefix.length) : message;
}
