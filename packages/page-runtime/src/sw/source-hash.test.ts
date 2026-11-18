import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { sourceHash } from "./source-hash.ts";

it.each(["", "abc", "a".repeat(55), "a".repeat(56), "a".repeat(64), "a".repeat(128), "a".repeat(10000), "שלום 👋\r\n"])("matches SHA-256 over original UTF-8 bytes (%#)", (source) => {
  expect(sourceHash(source)).toBe(createHash("sha256").update(source, "utf8").digest("hex").slice(0, 12));
});
