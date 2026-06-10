import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CacheNodeRow } from "./CacheTree";
import { createCacheRegistry } from "./adapter";
import type { CacheClient } from "./api";
import type { CacheTreeNode } from "./types";

const registry = createCacheRegistry([]);
const client = {} as CacheClient;

const row = (node: CacheTreeNode) =>
  render(
    <CacheNodeRow node={node} selected={false} registry={registry} client={client} />,
  ).container.textContent ?? "";

describe("CacheNodeRow", () => {
  it("shows a leaf's own size but never its TTL", () => {
    const text = row({
      name: "marker",
      key: "marker",
      keys: 1,
      type: "string",
      ttlSeconds: 3600,
      bytes: 1536,
    });
    expect(text).toContain("1.5 KB");
    expect(text).not.toContain("ttl");
  });

  it("shows a group's aggregated subkey size next to its key count", () => {
    const text = row({
      name: "tx",
      prefix: "tx:",
      keys: 12,
      children: 3,
      bytes: 1.5 * 1024 * 1024,
    });
    expect(text).toContain("1.5 MB");
    expect(text).toContain("12");
  });
});
