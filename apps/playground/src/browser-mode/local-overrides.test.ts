import { expect, it } from "vitest";
import type { StoredLink } from "@flanksource/page-runtime/host/link";
import { exampleLink } from "../../../../packages/page-runtime/src/link/testing-fixtures";
import { createLocalOverrides, readLocalOverride, requiredOverrides } from "./local-overrides";

it("restores, replaces, and removes browser-stored overrides while retaining folder handles", async () => {
  const saved = new Map<string, StoredLink>();
  const store = { put: async (link: StoredLink) => { saved.set(link.id, link); }, list: async () => [...saved.values()], remove: async (id: string) => { saved.delete(id); } };
  const local = { ...exampleLink(), id: "local-test", source: { kind: "folder" as const }, directory: { name: "checkout", queryPermission: async () => "granted" } as unknown as FileSystemDirectoryHandle };
  const manager = createLocalOverrides(store);
  await manager.apply(local);
  const restored = createLocalOverrides(store); await restored.restore();
  expect(restored.getSnapshot().links[0]?.directory).toBe(local.directory);
  expect(restored.getSnapshot().permissions).toEqual({ "local-test": "granted" });
  await manager.apply({ ...local, build: { ...local.build, version: "3.0.0" } });
  expect(manager.getSnapshot().links.map(link => link.build.version)).toEqual(["3.0.0"]);
  await manager.remove(local.id);
  expect(manager.getSnapshot().links).toEqual([]);
});

it("selects only used local packages, including their local dependency closure", () => {
  const make = (name: string, dependencies: Record<string, string> = {}): StoredLink => ({ ...exampleLink(), build: { ...exampleLink().build, library: name, package: { dependencies } } });
  const links = [make("@acme/card", { "@acme/helper": "^1" }), make("@acme/helper"), make("@acme/unrelated")];
  expect(requiredOverrides({ links, packages: ["@acme/card"] }).map(link => link.build.library)).toEqual(["@acme/card", "@acme/helper"]);
});

it("keeps inaccessible saved overrides removable and does not prompt during restore", async () => {
  const link = { ...exampleLink(), id: "local-denied", source: { kind: "folder" as const } };
  const manager = createLocalOverrides({ put: async () => {}, list: async () => [link], remove: async () => {} });
  await manager.restore();
  expect(manager.getSnapshot()).toMatchObject({ loaded: true, links: [link], permissions: { "local-denied": "denied" } });
});

it("validates folder metadata against package.json before saving an override", async () => {
  const build = exampleLink().build;
  const json = (value: unknown) => ({ getFile: async () => ({ text: async () => JSON.stringify(value) }) });
  const directory = { name: "checkout", getFileHandle: async () => json({ name: build.library, version: "99.0.0" }), getDirectoryHandle: async () => ({ getDirectoryHandle: async () => ({ getFileHandle: async () => json(build) }) }) } as unknown as FileSystemDirectoryHandle;
  await expect(readLocalOverride(directory)).rejects.toThrow(/metadata is stale/);
});
