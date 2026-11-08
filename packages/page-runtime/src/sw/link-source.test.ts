import { expect, it, vi } from "vitest";
import { readLinkedSource } from "./link-source.ts";
import { createLinkActivity } from "./link-activity.ts";
import { exampleLink, exampleLock } from "../link/testing-fixtures.ts";

it("measures native folder bytes without claiming network transfer or origin", async () => {
  const metrics = createLinkActivity();
  const bytes = new Uint8Array([0, 128, 255]);
  const readFolder = vi.fn(async () => bytes); const fetch = vi.fn();
  const owner = { ...exampleLink(), source: { kind: "folder", session: "folder-session" } as const };
  expect(await readLinkedSource({ owner, path: "image.png", source: false, files: {}, lock: exampleLock(), metrics, fetch, readFolder })).toEqual(bytes);
  expect(metrics).toMatchObject({ origin: null, transferredBytes: 0, decodedBytes: 3, integrityMs: 0, compileMs: 0 });
  expect(metrics.fetchMs).toBeGreaterThan(0);
  expect(fetch).not.toHaveBeenCalled();
});

it("retains elapsed folder-read time on a permission error", async () => {
  const metrics = createLinkActivity();
  const owner = { ...exampleLink(), source: { kind: "folder", session: "folder-session" } as const };
  await expect(readLinkedSource({ owner, path: "image.png", source: false, files: {}, lock: exampleLock(), metrics, fetch: vi.fn(), readFolder: async () => { throw new Error("Folder permission denied"); } })).rejects.toThrow("Folder permission denied");
  expect(metrics.fetchMs).toBeGreaterThan(0);
  expect(metrics.decodedBytes).toBeNull();
});

it("calls the supplied fetch function without binding it to the options object", async () => {
  const metrics = createLinkActivity(); metrics.origin = "http://127.0.0.1:9000/src/Counter.tsx";
  const bytes = await readLinkedSource({ owner: exampleLink(), path: "src/Counter.tsx", source: false, files: {}, lock: exampleLock(), metrics, readFolder: vi.fn(), fetch: function (this: unknown) {
    expect(this).toBeUndefined(); return Promise.resolve(new Response("source"));
  } });
  expect(new TextDecoder().decode(bytes)).toBe("source");
});
