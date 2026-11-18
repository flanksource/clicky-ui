import type { PageLock } from "@flanksource/page-runtime/schema";
import { object, parseProject } from "../project";
import type { SourceProvider } from "./types";

export type Directory = {
  kind: "directory"; name: string;
  values(): AsyncIterable<Directory | { kind: "file"; name: string; getFile(): Promise<File> }>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<Directory>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<{ getFile(): Promise<File>; createWritable(): Promise<{ write(value: string): Promise<void>; close(): Promise<void> }> }>;
};
const SIDECAR = ".page-runtime.json";
const TEXT_FILE = /\.(tsx?|jsx?|mjs|mdx?|json|css|txt|svg)$/i;

async function readFiles(directory: Directory, prefix = ""): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  for await (const entry of directory.values()) {
    if (["node_modules", ".git", SIDECAR, ".page-comments.json"].includes(entry.name)) continue;
    const path = `${prefix}${entry.name}`;
    if (entry.kind === "directory") Object.assign(files, await readFiles(entry, `${path}/`));
    else if (TEXT_FILE.test(entry.name)) files[path] = await (await entry.getFile()).text();
  }
  return files;
}

async function sidecar(directory: Directory): Promise<Record<string, unknown> | null> {
  let handle;
  try { handle = await directory.getFileHandle(SIDECAR); }
  catch (error) { if (error instanceof DOMException && error.name === "NotFoundError") return null; throw error; }
  return object(JSON.parse(await (await handle.getFile()).text()), SIDECAR);
}

async function write(options: { directory: Directory; path: string; text: string }): Promise<void> {
  const parts = options.path.split("/");
  let directory = options.directory;
  for (const part of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(part, { create: true });
  const writer = await (await directory.getFileHandle(parts.at(-1)!, { create: true })).createWritable();
  try { await writer.write(options.text); } finally { await writer.close(); }
}

export function directoryProvider(options: { directory: Directory; id: string; label: string }): SourceProvider {
  const { directory } = options;
  return {
    id: options.id, label: options.label, saveLabel: "Save files", directory,
    async read() {
      const files = await readFiles(directory);
      if (!Object.keys(files).length) return null;
      const metadata = await sidecar(directory);
      const entry = metadata?.entry ?? Object.keys(files).filter((path) => /\.(tsx|jsx|mdx)$/.test(path)).sort()[0];
      return parseProject({ format: 1, name: metadata?.name ?? directory.name, entry, files, locks: metadata?.locks ?? {} });
    },
    async save(project) {
      parseProject(project);
      for (const [path, text] of Object.entries(project.files)) await write({ directory, path, text });
      await write({ directory, path: SIDECAR, text: JSON.stringify({ name: project.name, entry: project.entry, locks: project.locks }, null, 2) });
    },
    async saveLocks(locks: Record<string, PageLock>) {
      const previous = await sidecar(directory);
      await write({ directory, path: SIDECAR, text: JSON.stringify({ ...previous, locks }, null, 2) });
    },
  };
}

export async function opfsProvider(): Promise<SourceProvider> {
  if (!navigator.storage?.getDirectory) throw new Error("OPFS is unavailable in this browser; choose a URL or hash project");
  const root = await navigator.storage.getDirectory() as unknown as Directory;
  const directory = await root.getDirectoryHandle("page-host", { create: true });
  return directoryProvider({ directory, id: "opfs", label: "Browser project (OPFS)" });
}

export async function folderProvider(): Promise<SourceProvider> {
  const browser = window as unknown as { showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<Directory> };
  if (!browser.showDirectoryPicker) throw new Error("Local folders require a Chromium browser with File System Access");
  const directory = await browser.showDirectoryPicker({ mode: "readwrite" });
  return directoryProvider({ directory, id: `folder:${directory.name}`, label: directory.name });
}
