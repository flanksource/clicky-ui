import type { LinkBuild, StoredLink } from "../types.ts";
import { readLinkFile } from "../source.ts";

export async function copyLinkToOpfs(options: { link: StoredLink; files: string[]; build: LinkBuild }): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  const folder = await root.getDirectoryHandle(`link-test-${crypto.randomUUID()}`, { create: true });
  async function write(path: string, bytes: Uint8Array<ArrayBuffer>) {
    let directory = folder;
    const parts = path.split("/");
    for (const part of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(part, { create: true });
    const writable = await (await directory.getFileHandle(parts.at(-1)!, { create: true })).createWritable();
    try { await writable.write(bytes); } finally { await writable.close(); }
  }
  const prefix = `${options.build.library}@${options.build.version}/`;
  const runtime = Object.keys(options.build.fragment.integrity).filter((path) => path.startsWith(prefix)).map((path) => path.slice(prefix.length));
  for (const path of new Set([...options.files, ...runtime, ...Object.values(options.build.entries), ...Object.keys(options.build.generated)])) await write(path, new Uint8Array(await readLinkFile({ link: options.link, path })));
  await write("dist/runtime/link.json", new TextEncoder().encode(JSON.stringify(options.build)));
  return folder;
}
