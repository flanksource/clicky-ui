import type { DocumentSource, PageLock } from "../schema.ts";
import { CONTENT_TYPES, extensionOf } from "../sw/content-types.ts";
import { verifyIntegrity } from "../sw/integrity.ts";

export const DOCUMENT_ORIGIN = "https://facet-document.invalid";
export const documentSourceURL = (path: string) => `/src/${path.split("/").map(encodeURIComponent).join("/")}`;
export const textAsset = (text: string, type: string) => URL.createObjectURL(new Blob([text], { type }));

export function documentAssets(options: { files: DocumentSource["files"]; lock: PageLock }) {
  const { lock, files } = options;
  const requests = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();
  const urls = new Map<string, string>();

  async function read(path: string): Promise<Uint8Array<ArrayBuffer>> {
    if (path.startsWith("/src/")) {
      const key = decodeURIComponent(path.slice("/src/".length));
      const file = Object.hasOwn(files, key) ? files[key] : undefined;
      if (!file) throw new Error(`Missing document source ${key}`);
      return "text" in file ? new TextEncoder().encode(file.text) : Uint8Array.from(atob(file.base64), char => char.charCodeAt(0));
    }
    if (!path.startsWith("/npm/")) throw new Error(`Unsupported document package URL ${path}`);
    const key = decodeURIComponent(path.slice("/npm/".length));
    const expected = Object.hasOwn(lock.integrity, key) ? lock.integrity[key] : undefined;
    if (!expected) throw new Error(`${key} is outside the document's package lock`);
    let pending = requests.get(key);
    if (!pending) {
      pending = (async () => {
        const response = await fetch(`${lock.packageOrigin.replace(/\/$/, "")}/${key}`, { mode: "cors", credentials: "omit", redirect: "error" });
        if (!response.ok) throw new Error(`${key}: package origin returned HTTP ${response.status}`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        await verifyIntegrity(bytes, expected, key);
        return bytes;
      })();
      requests.set(key, pending);
    }
    return pending;
  }

  const readText = async (path: string) => new TextDecoder().decode(await read(path));

  async function css(path: string, parents: readonly string[] = []): Promise<string> {
    const text = await readText(path);
    return replaceMatches(text, /url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)|(@import\s+)(?:"([^"]+)"|'([^']+)')/g, async match => {
      const reference = match[1] ?? match[2] ?? match[3] ?? match[5] ?? match[6]!;
      if (/^(?:[a-z][a-z+.-]*:|\/\/|#)/i.test(reference)) return match[0];
      const target = new URL(reference, DOCUMENT_ORIGIN + path);
      const href = await url(target.pathname, [...parents, path]) + target.hash;
      return match[4] ? `${match[4]}${JSON.stringify(href)}` : `url(${JSON.stringify(href)})`;
    });
  }

  async function url(path: string, parents: readonly string[] = []): Promise<string> {
    const hit = urls.get(path);
    if (hit) return hit;
    if (parents.includes(path)) throw new Error(`Circular stylesheet imports: ${[...parents, path].join(" → ")}`);
    const ext = extensionOf(path);
    const type = CONTENT_TYPES[ext] ?? "application/octet-stream";
    const blob = ext === ".css" ? textAsset(await css(path, parents), type) : URL.createObjectURL(new Blob([await read(path)], { type }));
    const winner = urls.get(path);
    if (winner) { URL.revokeObjectURL(blob); return winner; }
    urls.set(path, blob);
    return blob;
  }

  return { readText, css, url };
}

export async function replaceMatches(code: string, pattern: RegExp, replace: (match: RegExpMatchArray) => Promise<string>): Promise<string> {
  const matches = [...code.matchAll(pattern)];
  const values = await Promise.all(matches.map(replace));
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]!;
    code = code.slice(0, match.index!) + values[i] + code.slice(match.index! + match[0].length);
  }
  return code;
}
