import { describe, expect, it } from "vitest";
import { composeLinkOverrides, linksInLock } from "./overrides.ts";
import { assertLinksAllowed, linkUrl, missingLinkFile } from "./validation.ts";
import { exampleLink, exampleLock } from "./testing-fixtures.ts";
import { affectedLinkFrames, createLinkWatcher } from "../host/link/watch.ts";
import { digest } from "../sw/integrity.ts";

describe("library link state and session overrides", () => {
  it("mounts built and source barrel paths while preserving external dependency targets", () => {
    const link = exampleLink();
    link.build.barrels = { modules: ["dist/provider.js", "/npm/@acme/helper@1/index.js"], barrels: { "dist/comments.js": { CommentProvider: 0 }, "src/index.ts": { helper: 1 } } };
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile: { links: "allow" }, developerOverrides: true });
    expect(lock.barrels).toEqual({ modules: ["/link/checkout/dist/provider.js", "/npm/@acme/helper@1/index.js"], barrels: { "/link/checkout/dist/comments.js": { CommentProvider: 0 }, "/link/checkout/src/index.ts": { helper: 1 } } });
  });
  it.each([["deny", true], ["allow", false]] as const)("rejects links for profile %s with developer overrides %s", (links, developerOverrides) => {
    expect(() => assertLinksAllowed({ profile: { links }, developerOverrides })).toThrow(/developer overrides/);
  });
  it.each([
    ["the checkout's declaration replaces the published one", { remark: [{ module: "@flanksource/clicky-ui/remark/local" }] }, { "@flanksource/clicky-ui": { remark: [{ module: "@flanksource/clicky-ui/remark/local" }] }, "@acme/facet": { remark: [{ module: "@acme/facet/remark/redact" }] } }],
    ["a checkout without a declaration drops the published one", undefined, { "@acme/facet": { remark: [{ module: "@acme/facet/remark/redact" }] } }],
  ])("compiler plugins: %s", (_case, compiler, expected) => {
    const lock = { ...exampleLock(), compiler: { "@flanksource/clicky-ui": { remark: [{ module: "@flanksource/clicky-ui/remark/published" }] }, "@acme/facet": { remark: [{ module: "@acme/facet/remark/redact" }] } } };
    const link = exampleLink();
    if (compiler) Object.assign(link.build.fragment, { compiler, imports: { ...link.build.fragment.imports, "@flanksource/clicky-ui/remark/local": "@flanksource/clicky-ui@2.0.0/remark/local.mjs" } });
    expect(composeLinkOverrides({ lock, links: [link], profile: { links: "allow" }, developerOverrides: true }).compiler).toEqual(expected);
  });
  it("swaps checkout entries and React without mutating the published lock", () => {
    const original = exampleLock();
    const lock = composeLinkOverrides({ lock: original, links: [exampleLink()], profile: { links: "allow" }, developerOverrides: true });
    expect(lock.map).toEqual({ imports: { react: "/link/checkout/dist/runtime/react.js", "@flanksource/clicky-ui": "/link/checkout/src/index.ts" }, scopes: { "/npm/@acme/facet@1/": {} } });
    expect(linksInLock(lock)).toEqual(["checkout"]);
    expect(original.map.imports.react).toBe("/npm/react@18/index.js");
  });
  it("rejects an existing scope with a different React instance", () => {
    const lock = exampleLock(); lock.map.scopes["/npm/other/"] = { react: "/npm/react@17/index.js" };
    expect(() => composeLinkOverrides({ lock, links: [exampleLink()], profile: { links: "allow" }, developerOverrides: true })).toThrow(/base-set react/);
  });
  it("rejects a standalone singleton checkout even if its fragment omits the singleton mapping", () => {
    const link = exampleLink();
    link.build = { ...link.build, library: "react", entries: { react: "src/index.ts" }, fragment: { ...link.build.fragment, name: "react", imports: {}, scopes: {} } };
    expect(() => composeLinkOverrides({ lock: exampleLock(), links: [link], profile: { links: "allow" }, developerOverrides: true })).toThrow(/singleton.*clicky-ui/);
  });
  it("links facet alone while inheriting the locked clicky-ui base", () => {
    const link = exampleLink();
    link.build.library = "@flanksource/facet";
    link.build.fragment = { ...link.build.fragment, name: "@flanksource/facet", imports: { "@flanksource/facet": "@flanksource/facet@2.0.0/dist/index.js" }, inherits: ["react"] };
    link.build.entries = { "@flanksource/facet": "src/index.ts" };
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile: { links: "allow" }, developerOverrides: true });
    expect(lock.map.imports.react).toBe("/npm/react@18/index.js");
    expect(lock.map.imports["@flanksource/facet"]).toBe("/link/checkout/src/index.ts");
  });
  it("rejects traversal and names the icon generation command", () => {
    expect(() => linkUrl("checkout", "../private")).toThrow(/invalid source path/);
    expect(missingLinkFile(exampleLink(), "src/icons/UiMissing.tsx").message).toContain("pnpm --filter @flanksource/clicky-ui build:icons");
  });
  it("reloads only frames whose link was invalidated", () => {
    expect(affectedLinkFrames({ id: "checkout", frames: [{ id: "linked", links: ["checkout"], reload() {} }, { id: "control", links: [], reload() {} }] }).map((frame) => frame.id)).toEqual(["linked"]);
  });
  it("detects edits by content even when size and modification time do not change", async () => {
    let code = "before";
    const watcher = createLinkWatcher({ link: exampleLink(), read: async () => new TextEncoder().encode(code), changed: async () => {} });
    await watcher.scan(); code = "after!";
    expect((await watcher.scan()).sort()).toEqual(["src/Counter.tsx", "src/index.ts", "src/untouched.ts"]);
    expect(await watcher.scan()).toEqual([]);
  });
  it("detects edits made before the first watcher scan against the worker's served content", async () => {
    const path = "src/Counter.tsx";
    const old = new TextEncoder().encode("before");
    const watcher = createLinkWatcher({ link: exampleLink(), files: async () => ({ [path]: await digest(old) }), read: async () => new TextEncoder().encode("after"), changed: async () => {} });
    expect(await watcher.scan()).toEqual([path]);
  });
  it("observes a granted directory and disconnects when stopped", async () => {
    let notify = () => {};
    let disconnected = false;
    let code = "before";
    const directory = { name: "checkout", kind: "directory" } as FileSystemDirectoryHandle;
    const observed: unknown[] = [];
    let changed!: (paths: string[]) => void;
    const change = new Promise<string[]>((resolve) => { changed = resolve; });
    class Observer {
      constructor(callback: () => void) { notify = callback; }
      async observe(handle: FileSystemDirectoryHandle, options: { recursive: boolean }) { observed.push({ handle, options }); }
      disconnect() { disconnected = true; }
    }
    const watcher = createLinkWatcher({ link: exampleLink(), directory, observer: Observer, read: async () => new TextEncoder().encode(code), changed: async (paths) => changed(paths) });
    await watcher.start({ onError(error) { throw error; } }); code = "after"; notify();
    expect((await change).sort()).toEqual(["src/Counter.tsx", "src/index.ts", "src/untouched.ts"]);
    await watcher.stop();
    expect({ observed, disconnected }).toEqual({ observed: [{ handle: directory, options: { recursive: true } }], disconnected: true });
  });
  it("cancels remaining server reads once a changed module is found", async () => {
    const first = "src/Counter.tsx";
    const remaining = "src/untouched.ts";
    const hash = await digest(new TextEncoder().encode("before"));
    let canceled = false;
    const watcher = createLinkWatcher({ link: exampleLink(), files: async () => ({ [first]: hash, [remaining]: hash }), read: async (path, signal) => {
      if (path === first) return new TextEncoder().encode("after");
      return new Promise<Uint8Array>((_resolve, reject) => signal?.addEventListener("abort", () => { canceled = true; reject(new DOMException("Read canceled", "AbortError")); }, { once: true }));
    }, changed: async () => {} });
    expect(await watcher.scan()).toEqual([first]);
    expect(canceled).toBe(true);
  });
});
