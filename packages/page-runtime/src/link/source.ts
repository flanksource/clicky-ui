import type { StoredLink } from "./types.ts";
import { missingLinkFile } from "./validation.ts";
import { validateSourcePath } from "../host/validation.ts";

export async function readLinkFile(options: { link: StoredLink; path: string; fetch?: typeof fetch; signal?: AbortSignal }): Promise<Uint8Array> {
  const { link, path } = options;
  validateSourcePath(path);
  if (link.source.kind === "server") {
    const url = new URL(path.split("/").map(encodeURIComponent).join("/"), link.source.url.replace(/\/?$/, "/"));
    const response = await (options.fetch ?? fetch)(url, { mode: "cors", credentials: "omit", redirect: "error", cache: "no-store", ...(options.signal ? { signal: options.signal } : {}) });
    if (response.status === 404) throw missingLinkFile(link, path);
    if (!response.ok) throw new Error(`${link.build.library}: ${path}: HTTP ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }
  if (!link.directory) throw new Error(`${link.id}: folder handle is missing; select the checkout again`);
  try {
    const segments = path.split("/");
    let directory = link.directory;
    for (const segment of segments.slice(0, -1)) directory = await directory.getDirectoryHandle(segment);
    return new Uint8Array(await (await (await directory.getFileHandle(segments.at(-1)!)).getFile()).arrayBuffer());
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") throw missingLinkFile(link, path);
    throw new Error(`${link.id}: cannot read ${path}; verify folder read permission: ${String(error)}`, { cause: error });
  }
}
