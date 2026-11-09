import type { FileRef } from "./types";

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)$/i;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** True for an image file by extension: png, jpg, jpeg, gif, webp, svg, avif, bmp or ico. */
export function isImagePath(path: string): boolean {
  return IMAGE_EXTENSION.test(path);
}

/** An image with no text source: every image but svg. */
export function isRasterImagePath(path: string): boolean {
  return isImagePath(path) && !/\.svg$/i.test(path);
}

/**
 * The decoded file path of a document-relative URL, without `?query` or `#hash`.
 * Null when the URL is not relative to the document (a scheme such as `http:`,
 * `data:` or `mailto:`, `//host`, `/absolute`, `#fragment`), is empty, or has
 * malformed percent-encoding, so the caller leaves it for the browser.
 */
export function relativeUrlPath(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("/") || trimmed.startsWith("#") || SCHEME.test(trimmed)) return null;
  const path = trimmed.replace(/[?#].*$/s, "");
  if (!path) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

function normalizePosix(path: string): string {
  const out: string[] = [];
  for (const segment of path.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === ".." && out.length > 0 && out[out.length - 1] !== "..") out.pop();
    else out.push(segment);
  }
  return out.join("/");
}

/**
 * The file a document-relative `url` names when read from `from`: the url
 * joined onto the directory of `from.file`, normalized, in the same work dir.
 * A `..` past the root is kept rather than clamped; the server rejects it.
 * Null when `url` is not document-relative.
 */
export function resolveRelativeFile(from: FileRef, url: string): FileRef | null {
  const relative = relativeUrlPath(url);
  if (relative === null) return null;
  const slash = from.file.lastIndexOf("/");
  const dir = slash < 0 ? "" : from.file.slice(0, slash);
  const file = normalizePosix(dir ? `${dir}/${relative}` : relative);
  return from.workDir === undefined ? { file } : { workDir: from.workDir, file };
}
