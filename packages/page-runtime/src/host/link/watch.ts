import type { LibraryLink, LinkFrame } from "../../link/types.ts";
import { digest } from "../../sw/integrity.ts";

export function affectedLinkFrames(options: { id: string; frames: LinkFrame[] }): LinkFrame[] {
  return options.frames.filter((frame) => frame.links.includes(options.id));
}

type DirectoryObserver = { observe(directory: FileSystemDirectoryHandle, options: { recursive: boolean }): Promise<void>; disconnect(): void };
type ObserverConstructor = new (callback: () => void) => DirectoryObserver;

export function createLinkWatcher(options: { link: LibraryLink; read(path: string, signal?: AbortSignal): Promise<Uint8Array>; changed(paths: string[]): Promise<void>; files?: () => Promise<Record<string, string>>; directory?: FileSystemDirectoryHandle; observer?: ObserverConstructor }) {
  const hashes = new Map<string, string>();
  let scanning: Promise<string[]> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = true;
  let observer: DirectoryObserver | undefined;
  async function scan(): Promise<string[]> {
    const baseline = options.files ? await options.files() : {};
    const paths = options.files ? Object.keys(baseline) : Object.keys(options.link.build.modules);
    const controller = new AbortController();
    const changed: string[] = [];
    const next = await Promise.all(paths.map(async (path) => {
      try {
        const hash = await digest(new Uint8Array(await options.read(path, controller.signal)));
        if ((hashes.has(path) || baseline[path] !== undefined) && (hashes.get(path) ?? baseline[path]) !== hash) {
          changed.push(path);
          if (options.link.source.kind === "server") controller.abort();
        }
        return [path, hash] as const;
      } catch (error) {
        if (controller.signal.aborted && error instanceof DOMException && error.name === "AbortError") return undefined;
        controller.abort(); throw error;
      }
    }));
    if (changed.length) await options.changed(changed);
    for (const entry of next) if (entry) hashes.set(entry[0], entry[1]);
    return changed;
  }
  const check = () => scanning ??= scan().finally(() => { scanning = undefined; });
  return {
    scan: check,
    async start(settings: { intervalMs?: number; onError(error: unknown): void }) {
      if (!stopped) throw new Error("Link watcher is already running");
      const interval = settings.intervalMs ?? 25;
      if (!Number.isFinite(interval) || interval < 1) throw new Error("Link polling interval must be positive");
      stopped = false;
      const NativeObserver = options.observer ?? (globalThis as unknown as { FileSystemObserver?: ObserverConstructor }).FileSystemObserver;
      if (options.directory && NativeObserver) {
        observer = new NativeObserver(() => { if (!stopped) void check().then(() => stopped ? [] : check()).catch((error: unknown) => { stopped = true; observer?.disconnect(); settings.onError(error); }); });
        await observer.observe(options.directory, { recursive: true });
        await check(); return;
      }
      await check();
      const tick = async () => {
        try { await check(); if (!stopped) timer = setTimeout(() => { void tick(); }, interval); }
        catch (error) { stopped = true; settings.onError(error); }
      };
      timer = setTimeout(() => { void tick(); }, interval);
    },
    async stop() { stopped = true; clearTimeout(timer); observer?.disconnect(); await scanning; },
  };
}
