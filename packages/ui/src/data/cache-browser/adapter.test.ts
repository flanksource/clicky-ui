import { describe, expect, it } from "vitest";
import { createCacheRegistry, prefixAdapter, type CacheNodeAdapter } from "./adapter";
import type { CacheClient } from "./api";
import type { CacheKeyDetail, CacheTreeNode } from "./types";

const leaf = (key: string, type = "string"): CacheTreeNode => ({
  name: key,
  key,
  keys: 1,
  type,
});

const client = { baseUrl: "/api/v1" } as CacheClient;

const detailOf = (type: string): CacheKeyDetail => ({
  key: "k",
  type,
  ttlSeconds: -1,
  length: 0,
});

describe("CacheAdapterRegistry", () => {
  it("resolves the first matching adapter with renderDetail", () => {
    const schema: CacheNodeAdapter = prefixAdapter("schema", "schema:", () => "schema-view");
    const txEverything: CacheNodeAdapter = {
      id: "tx",
      match: () => true,
      renderDetail: () => "tx-view",
    };
    const registry = createCacheRegistry([schema, txEverything]);

    expect(registry.resolveDetail(leaf("schema:plan:p1"), null)?.id).toBe("schema");
    expect(registry.resolveDetail(leaf("tx:abc"), null)?.id).toBe("tx");
  });

  it("falls back to null when no adapter contributes the surface", () => {
    const iconOnly: CacheNodeAdapter = {
      id: "icon-only",
      match: () => true,
      renderRowIcon: () => "icon",
    };
    const registry = createCacheRegistry([iconOnly]);

    expect(registry.resolveDetail(leaf("tx:abc"), null)).toBeNull();
    expect(registry.resolveRowIcon(leaf("tx:abc"), null)?.id).toBe("icon-only");
  });

  it("merges detailTabs across all matching adapters, de-duplicated by id", () => {
    const a: CacheNodeAdapter = {
      id: "a",
      match: () => true,
      detailTabs: () => [
        { id: "raw", label: "Raw", render: () => null },
        { id: "history", label: "History", render: () => null },
      ],
    };
    const b: CacheNodeAdapter = {
      id: "b",
      match: () => true,
      detailTabs: () => [
        { id: "raw", label: "Raw (dup)", render: () => null },
        { id: "graph", label: "Graph", render: () => null },
      ],
    };
    const registry = createCacheRegistry([a, b]);

    const tabs = registry.resolveTabs({ node: leaf("x"), detail: null, client });
    expect(tabs.map((t) => t.id)).toEqual(["raw", "history", "graph"]);
    expect(tabs[0]!.label).toBe("Raw");
  });

  it("matches on loaded detail so adapters can claim by value kind", () => {
    const hashes: CacheNodeAdapter = {
      id: "hashes",
      match: (_node, detail) => detail?.type === "hash",
      renderDetail: () => "hash-view",
    };
    const registry = createCacheRegistry([hashes]);

    expect(registry.resolveDetail(leaf("any"), detailOf("hash"))?.id).toBe("hashes");
    expect(registry.resolveDetail(leaf("any"), detailOf("string"))).toBeNull();
    expect(registry.resolveDetail(leaf("any"), null)).toBeNull();
  });

  it("prefixAdapter never claims group nodes", () => {
    const group: CacheTreeNode = { name: "schema", prefix: "schema:", keys: 5 };
    const registry = createCacheRegistry([prefixAdapter("schema", "schema:", () => null)]);

    expect(registry.resolveDetail(group, null)).toBeNull();
  });
});
