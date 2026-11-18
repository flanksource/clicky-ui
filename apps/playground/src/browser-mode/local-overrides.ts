import { createLinkStore, type StoredLink } from "@flanksource/page-runtime/host/link";
import { validateLink } from "@flanksource/page-runtime/link";

type Directory = FileSystemDirectoryHandle & {
  queryPermission?: (options: { mode: "read" }) => Promise<PermissionState>;
  requestPermission?: (options: { mode: "read" }) => Promise<PermissionState>;
};
type Snapshot = { loaded: boolean; links: StoredLink[]; permissions: Record<string, PermissionState>; errors: Record<string, string>; error: string | null };
type Store = Pick<ReturnType<typeof createLinkStore>, "put" | "list" | "remove">;

async function readJson(directory: FileSystemDirectoryHandle, path: string): Promise<unknown> {
  const parts = path.split("/");
  let current = directory;
  for (const part of parts.slice(0, -1)) current = await current.getDirectoryHandle(part);
  return JSON.parse(await (await (await current.getFileHandle(parts.at(-1)!)).getFile()).text()) as unknown;
}

export async function readLocalOverride(directory: FileSystemDirectoryHandle): Promise<StoredLink> {
  const manifest = await readJson(directory, "package.json") as { name?: string; version?: string; dependencies?: Record<string, string>; peerDependencies?: Record<string, string> };
  if (!manifest.name || !manifest.version) throw new Error("Select a package directory containing package.json with name and version");
  let build: StoredLink["build"];
  try { build = await readJson(directory, "dist/runtime/link.json") as StoredLink["build"]; }
  catch (error) { throw new Error(`${manifest.name}: prepare dist/runtime/link.json with buildLinkRuntime before linking this folder: ${String(error)}`); }
  if (build.library !== manifest.name || build.version !== manifest.version) throw new Error(`${manifest.name}: runtime link metadata is stale; rebuild it for ${manifest.version}`);
  build.package = { ...(manifest.dependencies ? { dependencies: manifest.dependencies } : {}), ...(manifest.peerDependencies ? { peerDependencies: manifest.peerDependencies } : {}) };
  const id = "local-" + [...manifest.name].map(char => char.charCodeAt(0).toString(16).padStart(2, "0")).join("");
  const link: StoredLink = { id, directory, source: { kind: "folder" }, build };
  validateLink(link);
  return link;
}

export function pickLocalOverride(): Promise<StoredLink> {
  const picker = (window as Window & { showDirectoryPicker?: (options: { mode: "read" }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
  if (!picker) return Promise.reject(new Error("Local folders require a browser with File System Access support, such as desktop Chrome"));
  return picker.call(window, { mode: "read" }).then(readLocalOverride);
}

export function createLocalOverrides(store: Store = createLinkStore()) {
  let snapshot: Snapshot = { loaded: false, links: [], permissions: {}, errors: {}, error: null };
  let restoring: Promise<void> | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: Snapshot) => { snapshot = next; for (const listener of listeners) listener(); };
  const refresh = async () => {
    const links = (await store.list()).filter(link => link.source.kind === "folder" && link.id.startsWith("local-"));
    const permissions: Snapshot["permissions"] = {};
    const errors: Snapshot["errors"] = {};
    for (const link of links) {
      try {
        if (!link.directory) throw new Error(`${link.build.library}: saved directory handle is missing; remove and select the package again`);
        const directory = link.directory as Directory;
        permissions[link.id] = directory.queryPermission ? await directory.queryPermission({ mode: "read" }) : "granted";
      } catch (error) { permissions[link.id] = "denied"; errors[link.id] = String(error); }
    }
    publish({ loaded: true, links, permissions, errors, error: null });
  };
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    restore() {
      return restoring ??= refresh().catch((error: unknown) => { publish({ ...snapshot, loaded: true, error: String(error) }); }).finally(() => { restoring = undefined; });
    },
    async apply(link: StoredLink) { validateLink(link); await store.put(link); await refresh(); },
    async remove(id: string) { await store.remove(id); await refresh(); },
    async reconnect(link: StoredLink) {
      if (!link.directory) throw new Error("Select the package folder again");
      const directory = link.directory as Directory;
      if (directory.requestPermission && await directory.requestPermission({ mode: "read" }) !== "granted") throw new Error(`${link.build.library}: folder read permission was not granted`);
      const updated = await readLocalOverride(directory);
      await store.put(updated); await refresh();
    },
  };
}

export const localOverrides = createLocalOverrides();

export function requiredOverrides(options: { links: StoredLink[]; packages: string[] }): StoredLink[] {
  const names = new Set(["@flanksource/clicky-ui", "@flanksource/facet", ...options.packages]);
  const selected: StoredLink[] = [];
  for (let changed = true; changed;) {
    changed = false;
    for (const link of options.links) if (names.has(link.build.library) && !selected.includes(link)) {
      selected.push(link); changed = true;
      for (const name of Object.keys(link.build.package?.dependencies ?? {})) names.add(name);
    }
  }
  return selected;
}
