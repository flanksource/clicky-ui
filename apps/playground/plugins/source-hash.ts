import { createHash } from "node:crypto";

/** First 12 hex chars of the sha256 of the UTF-8 text: the identity of a source file's content. */
export function sourceHash(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 12);
}
