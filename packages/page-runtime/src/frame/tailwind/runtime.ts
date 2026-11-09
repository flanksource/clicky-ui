import { compileLibraries, transformCss, type CompilerLoaders, type LibraryStyles } from "./recipe.ts";
import { cssCacheKey, libraryKey } from "./cache.ts";
import { insertCss } from "./stylesheets.ts";
import type { TailwindStore } from "./store.ts";
import type { TailwindActivity } from "../../activity-schema.ts";

type Compiled = { compiler: Awaited<ReturnType<typeof compileLibraries>>; candidates: Set<string> };
const compilers = new Map<string, Promise<Compiled>>();
const IDLE_PERSIST_MS = 1000;
export type TailwindOptions = { libraries: LibraryStyles[]; loaders: CompilerLoaders; runtimeVersion: string; root: HTMLElement; candidates: string[]; store: TailwindStore; timeoutMs: number; onError: (error: unknown) => void; onActivity?: (activity: TailwindActivity) => void };

export function loadTailwind(options: Pick<TailwindOptions, "libraries" | "loaders" | "runtimeVersion" | "onActivity">): Promise<Compiled> {
  const key = libraryKey(options);
  let compiling = compilers.get(key);
  if (!compiling) {
    const startMs = performance.now();
    compiling = compileLibraries(options).then((compiler) => { options.onActivity?.({ kind: "libraries", startMs, durationMs: performance.now() - startMs, candidates: 0, cssBytes: 0, cacheHit: false }); return { compiler, candidates: new Set<string>() }; });
    compilers.set(key, compiling);
  } else options.onActivity?.({ kind: "libraries", startMs: performance.now(), durationMs: 0, candidates: 0, cssBytes: 0, cacheHit: true });
  return compiling;
}

export function classesUnder(options: { node: Element; root: HTMLElement; candidates: Set<string> }): boolean {
  if (!options.root.contains(options.node)) return false;
  let fresh = false;
  for (const element of [options.node, ...options.node.querySelectorAll("[class]")]) {
    for (const name of element.classList) {
      if (!options.candidates.has(name)) { options.candidates.add(name); fresh = true; }
    }
  }
  return fresh;
}

function whenIdle(callback: () => void): () => void {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(callback, { timeout: IDLE_PERSIST_MS });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(callback, IDLE_PERSIST_MS);
  return () => clearTimeout(id);
}

export async function prepareTailwind(options: TailwindOptions) {
  if (options.candidates.some((candidate) => typeof candidate !== "string")) throw new Error("runtime Tailwind: source candidates must be strings");
  const library = libraryKey(options);
  const source = new Set(options.candidates);
  const candidates = new Set(source);
  const key = await cssCacheKey({ libraryKey: library, candidates: source });
  const cached = await options.store.read(key);
  if (cached) for (const candidate of cached.record.domClasses) candidates.add(candidate);
  const fresh = classesUnder({ node: options.root, root: options.root, candidates });
  performance.mark("page-runtime:css-cache");
  let style: HTMLStyleElement | undefined;
  let imports = Promise.resolve();
  let failure: unknown;
  let observing = false;
  const report = (error: unknown) => { failure = error; if (observing) options.onError(error); };
  const insert = (css: string) => {
    const output = insertCss({ document: options.root.ownerDocument, ...(style ? { previous: style } : {}), css, timeoutMs: options.timeoutMs });
    style = output.style; imports = output.ready;
    void imports.catch(report);
  };
  if (cached) { insert(cached.css); options.onActivity?.({ kind: "candidates", startMs: performance.now(), durationMs: 0, candidates: candidates.size, cssBytes: new TextEncoder().encode(cached.css).byteLength, cacheHit: true }); }
  const compiled = await loadTailwind(options);
  let current = cached?.css ?? "";
  const build = () => {
    for (const candidate of candidates) compiled.candidates.add(candidate);
    return transformCss({ css: compiled.compiler.build([...compiled.candidates]), libraries: options.libraries });
  };
  let persisted = Promise.resolve();
  let pending: (() => void) | undefined;
  const flush = (): Promise<void> => {
    if (pending) {
      pending(); pending = undefined;
      const write = { key, libraryKey: library, candidates: [...source].sort(), domClasses: [...candidates].filter((name) => !source.has(name)).sort(), css: current };
      persisted = persisted.then(() => options.store.write(write));
      void persisted.catch(report);
    }
    return persisted;
  };
  const persist = () => { pending ??= whenIdle(() => { void flush(); }); };
  const update = () => {
    const startMs = performance.now();
    current = build();
    options.onActivity?.({ kind: "candidates", startMs, durationMs: performance.now() - startMs, candidates: compiled.candidates.size, cssBytes: new TextEncoder().encode(current).byteLength, cacheHit: false });
    insert(current);
    for (const candidate of compiled.candidates) candidates.add(candidate);
    persist();
  };
  if (!cached || fresh) update();
  else for (const candidate of candidates) compiled.candidates.add(candidate);
  performance.mark("page-runtime:css-built");
  if (!cached) await flush();
  await imports;
  performance.mark("page-runtime:css-imports");
  const observer = new MutationObserver((records) => {
    try {
      let changed = false;
      for (const record of records) {
        const nodes = record.type === "attributes" ? [record.target] : [...record.addedNodes];
        for (const node of nodes) if (node instanceof Element && classesUnder({ node, root: options.root, candidates })) changed = true;
      }
      if (changed) update();
    } catch (error) { observer.disconnect(); report(error); }
  });
  observer.observe(options.root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  observing = true;
  return {
    warm: Boolean(cached), get style() { return style!; }, candidates,
    ready: async () => { await imports; await flush(); if (failure) throw failure; },
    stop: () => { observer.disconnect(); style?.remove(); if (pending) void flush().catch(report); },
  };
}
