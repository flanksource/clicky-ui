import type { RuntimeProfile } from "../../schema.ts";
import type { LibraryLink, LinkBuild, LinkCommand, LinkFrame, LinkReply, StoredLink } from "../../link/types.ts";
import { assertLinksAllowed, validateLink } from "../../link/validation.ts";
import { composeLinkOverrides } from "../../link/overrides.ts";
import { readLinkFile } from "../../link/source.ts";
import { createLinkStore } from "../../link/storage.ts";
import { affectedLinkFrames, createLinkWatcher } from "./watch.ts";
import type { PageSourceLock } from "../../link/page-sources.ts";

export type LinkTransport = (command: LinkCommand) => Promise<LinkReply>;
export type LinkHostOptions = { profile: Pick<RuntimeProfile, "links">; developerOverrides: boolean; transport: LinkTransport; fetch?: typeof fetch };
export { connectLinkRuntime } from "./transport.ts";
export { createLinkWatcher, affectedLinkFrames } from "./watch.ts";
export { createLinkStore } from "../../link/storage.ts";
export type { LibraryLink, LinkBuild, StoredLink, LinkFrame };

export function createLinkHost(options: LinkHostOptions) {
  assertLinksAllowed(options);
  const links = new Map<string, StoredLink>();
  const frames = new Map<string, LinkFrame>();
  const storage = createLinkStore();
  async function install(link: StoredLink): Promise<LibraryLink> {
    validateLink(link);
    await options.transport({ type: "install", link });
    await storage.put(link);
    links.set(link.id, link);
    return link;
  }
  async function invalidate(id: string, paths: string[]): Promise<void> {
    if (!links.has(id)) throw new Error(`Unknown link ${id}`);
    await options.transport({ type: "invalidate", id, paths });
    await Promise.all(affectedLinkFrames({ id, frames: [...frames.values()] }).map((frame) => frame.reload()));
  }
  return {
    install,
    async server(settings: { id: string; url: string; manifestPath?: string }): Promise<LibraryLink> {
      const path = settings.manifestPath ?? "dist/runtime/link.json";
      const response = await (options.fetch ?? fetch)(new URL(path, settings.url.replace(/\/?$/, "/")), { mode: "cors", credentials: "omit", redirect: "error", cache: "no-store" });
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}; run buildLinkRuntime (buildLibraryRuntime) in the checkout`);
      return install({ id: settings.id, source: { kind: "server", url: settings.url }, build: await response.json() as LinkBuild });
    },
    async folder(settings: { id: string; directory: FileSystemDirectoryHandle; manifestPath?: string }): Promise<LibraryLink> {
      const provisional: StoredLink = { id: settings.id, source: { kind: "folder" }, directory: settings.directory, build: { library: settings.directory.name, generated: {} } as LinkBuild };
      const bytes = await readLinkFile({ link: provisional, path: settings.manifestPath ?? "dist/runtime/link.json" });
      return install({ ...provisional, build: JSON.parse(new TextDecoder().decode(bytes)) as LinkBuild });
    },
    async pickFolder(settings: { id: string; manifestPath?: string }): Promise<LibraryLink> {
      const picker = (window as Window & { showDirectoryPicker?: (options: { mode: "read" }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
      if (!picker) throw new Error("Folder links require Chromium File System Access in a secure context");
      return this.folder({ ...settings, directory: await picker.call(window, { mode: "read" }) });
    },
    list: () => [...links.values()],
    async restore(): Promise<StoredLink[]> { for (const link of await storage.list()) { await options.transport({ type: "install", link }); links.set(link.id, link); } return [...links.values()]; },
    override(settings: { lock: PageSourceLock; ids: string[] }): PageSourceLock {
      return composeLinkOverrides({ ...options, lock: settings.lock, links: settings.ids.map((id) => { const link = links.get(id); if (!link) throw new Error(`Unknown link ${id}`); return link; }) });
    },
    registerFrame(frame: LinkFrame): () => void { if (frames.has(frame.id)) throw new Error(`Duplicate frame ${frame.id}`); frames.set(frame.id, frame); return () => { frames.delete(frame.id); }; },
    invalidate,
    watch(id: string) {
      const link = links.get(id); if (!link) throw new Error(`Unknown link ${id}`);
      return createLinkWatcher({ link, ...(link.directory ? { directory: link.directory } : {}), read: (path, signal) => readLinkFile({ link, path, ...(signal ? { signal } : {}), ...(options.fetch ? { fetch: options.fetch } : {}) }), changed: (paths) => invalidate(id, paths), files: async () => { const reply = await options.transport({ type: "files", id }); if (!reply.files) throw new Error("Worker did not return linked source hashes"); return reply.files; } });
    },
    async remove(id: string) { await options.transport({ type: "remove", id }); await storage.remove(id); links.delete(id); },
    close: storage.close,
  };
}
