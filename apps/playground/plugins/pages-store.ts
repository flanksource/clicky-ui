import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";

import { sourceHash } from "./source-hash";

/**
 * Reads and writes artifact sources under `src/pages/`.
 *
 * This backs a browser-driven file write, so every path is derived from a
 * validated slug and then re-checked for containment. The slug pattern already
 * makes traversal impossible; the containment assert is deliberate redundancy
 * on the one endpoint that can create files.
 */
export const PAGE_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/;

export class PageStoreError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export function assertSlug(slug: unknown): string {
  if (typeof slug !== "string" || slug === "") {
    throw new PageStoreError("a page slug is required", 400);
  }
  if (!PAGE_SLUG_PATTERN.test(slug)) {
    throw new PageStoreError(
      `invalid page slug "${slug}" — use lowercase letters, digits and hyphens, ` +
        'optionally nested with "/" (for example "dashboards/agent-inbox")',
      400,
    );
  }
  return slug;
}

export function resolvedInside(rootDir: string, relativePath: string): string {
  const root = resolve(rootDir);
  const full = resolve(root, relativePath);
  if (!full.startsWith(root + sep)) {
    throw new PageStoreError(
      `refusing to touch "${relativePath}": it resolves outside ${root}`,
      400,
    );
  }
  return full;
}

export function assertSafeParents(rootDir: string, parentDir: string): void {
  const root = resolve(rootDir);
  let current = root;
  for (const segment of relative(root, parentDir).split(sep).filter(Boolean)) {
    current = join(current, segment);
    if (!existsSync(current)) return;
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) {
      throw new PageStoreError(`refusing to traverse symbolic link ${current}`, 400);
    }
    if (!stat.isDirectory()) {
      throw new PageStoreError(`expected ${current} to be a directory`, 409);
    }
  }
}

/** The file types a page can be: a React component, or a markdown document. */
export const PAGE_EXTENSIONS = [".tsx", ".md", ".mdx"] as const;
export type PageExtension = (typeof PAGE_EXTENSIONS)[number];

export function assertPageExtension(extension: unknown): PageExtension {
  if (!PAGE_EXTENSIONS.includes(extension as PageExtension)) {
    throw new PageStoreError(
      `invalid page extension ${JSON.stringify(extension)} — expected one of ${PAGE_EXTENSIONS.join(", ")}`,
      400,
    );
  }
  return extension as PageExtension;
}

export function pageExtension(file: string): PageExtension {
  const extension = PAGE_EXTENSIONS.find((candidate) => file.endsWith(candidate));
  if (!extension) throw new PageStoreError(`${file} is not a page file`, 400);
  return extension;
}

/**
 * The file behind `slug`: whichever of `<slug>.tsx`, `.md` and `.mdx` exists,
 * or `<slug><extension>` for a page that does not exist yet. Two files for one
 * slug make every slug-keyed route ambiguous, so that is refused.
 */
export function pagePath(
  pagesDir: string,
  slug: string,
  extension: PageExtension = ".tsx",
): string {
  assertSlug(slug);
  const candidates = PAGE_EXTENSIONS.map((candidate) =>
    resolvedInside(pagesDir, `${slug}${candidate}`),
  );
  assertSafeParents(pagesDir, dirname(candidates[0]!));
  const existing = candidates.filter((file) => existsSync(file));
  if (existing.length > 1) {
    throw new PageStoreError(
      `page "${slug}" is ambiguous: ${existing.map((file) => relative(pagesDir, file)).join(" and ")} both exist — rename or delete one`,
      409,
    );
  }
  return existing[0] ?? resolvedInside(pagesDir, `${slug}${extension}`);
}

export function folderPath(pagesDir: string, folder: string): string {
  assertSlug(folder);
  const full = resolvedInside(pagesDir, folder);
  assertSafeParents(pagesDir, dirname(full));
  return full;
}

export function listFolders(pagesDir: string): string[] {
  const folders: string[] = [];

  function walk(dir: string, prefix: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
      const slug = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) {
        throw new PageStoreError(`refusing to traverse symbolic link ${join(dir, entry.name)}`, 400);
      }
      if (!entry.isDirectory()) continue;
      assertSlug(slug);
      folders.push(slug);
      walk(join(dir, entry.name), slug);
    }
  }

  walk(resolve(pagesDir), "");
  return folders.sort((left, right) => left.localeCompare(right));
}

/**
 * Every page slug inside `folder`, at any depth. Mirrors the registry's glob:
 * `_`-prefixed helpers and colocated tests/stories are not artifacts, so they
 * have no slug and no feedback to clean up.
 */
export function listFolderPages(pagesDir: string, folder: string): string[] {
  const root = folderPath(pagesDir, folder);
  const slugs: string[] = [];

  function walk(dir: string, prefix: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
      if (entry.isSymbolicLink()) {
        throw new PageStoreError(`refusing to traverse symbolic link ${join(dir, entry.name)}`, 400);
      }
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), `${prefix}${entry.name}/`);
        continue;
      }
      const extension = PAGE_EXTENSIONS.find((candidate) => entry.name.endsWith(candidate));
      if (extension && !/\.(test|stories)\.(tsx|md|mdx)$/.test(entry.name)) {
        slugs.push(`${prefix}${entry.name.slice(0, -extension.length)}`);
      }
    }
  }

  if (!existsSync(root)) throw new PageStoreError(`folder "${folder}" does not exist`, 404);
  walk(root, `${folder}/`);
  return slugs.sort((left, right) => left.localeCompare(right));
}

export function createFolder(pagesDir: string, folder: string): string {
  const target = folderPath(pagesDir, folder);
  if (existsSync(target)) {
    throw new PageStoreError(`folder "${folder}" already exists`, 409);
  }
  mkdirSync(target, { recursive: true });
  return folder;
}

export function sourceExists(pagesDir: string, slug: string): boolean {
  return existsSync(pagePath(pagesDir, slug));
}

export function readSource(pagesDir: string, slug: string): string {
  const file = pagePath(pagesDir, slug);
  if (!existsSync(file)) throw new PageStoreError(`page "${slug}" does not exist`, 404);
  return readFileSync(file, "utf8");
}

export function writeSource(
  pagesDir: string,
  slug: string,
  source: string,
  extension?: PageExtension,
): void {
  if (typeof source !== "string") throw new PageStoreError("page source must be a string", 400);

  const file = pagePath(pagesDir, slug, extension);
  mkdirSync(dirname(file), { recursive: true });
  writeAtomic(file, source);
}

function writeAtomic(file: string, source: string): void {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, source, "utf8");
  renameSync(tmp, file);
}

/** Module and stylesheet files under `src/pages/` that the editor may open, including `_` helpers. */
export const PAGES_FILE_EXTENSIONS = [".ts", ".tsx", ".css", ".md", ".mdx"] as const;

/**
 * The absolute path of an existing editable file `rel` (forward slashes, relative
 * to `pagesDir`). Refuses absolute paths, `..`, backslashes, empty segments,
 * other extensions, symlinks at any segment and anything whose realpath escapes
 * `pagesDir`. The returned path is lexical, matching what module resolution yields.
 */
export function pagesFilePath(pagesDir: string, rel: unknown): string {
  if (typeof rel !== "string" || rel === "") throw new PageStoreError("a file path is required", 400);
  if (isAbsolute(rel) || rel.includes("\\") || rel.split("/").some((s) => s === "" || s === "." || s === "..")) {
    throw new PageStoreError(
      `invalid file path ${JSON.stringify(rel)} — expected a forward-slash path relative to src/pages without "." or ".." segments`,
      400,
    );
  }
  if (!(PAGES_FILE_EXTENSIONS as readonly string[]).includes(extname(rel))) {
    throw new PageStoreError(`${rel} is not an editable file — expected one of ${PAGES_FILE_EXTENSIONS.join(", ")}`, 400);
  }
  const full = resolvedInside(pagesDir, rel);
  assertSafeParents(pagesDir, dirname(full));
  if (!existsSync(full)) throw new PageStoreError(`${rel} does not exist`, 404);
  const stat = lstatSync(full);
  if (stat.isSymbolicLink()) throw new PageStoreError(`refusing to traverse symbolic link ${full}`, 400);
  if (!stat.isFile()) throw new PageStoreError(`${rel} is not a file`, 400);
  if (!realpathSync(full).startsWith(realpathSync(pagesDir) + sep)) {
    throw new PageStoreError(`refusing to touch "${rel}": it resolves outside ${pagesDir}`, 400);
  }
  return full;
}

export function readPagesFile(pagesDir: string, rel: string): { file: string; source: string; hash: string } {
  const source = readFileSync(pagesFilePath(pagesDir, rel), "utf8");
  return { file: rel, source, hash: sourceHash(source) };
}

/** Writes `rel` only if its on-disk content still hashes to `expectedHash`, else 409. */
export function writePagesFile(
  pagesDir: string,
  rel: string,
  source: unknown,
  expectedHash: unknown,
): { file: string; hash: string } {
  if (typeof source !== "string") throw new PageStoreError("file source must be a string", 400);
  if (typeof expectedHash !== "string" || expectedHash === "") {
    throw new PageStoreError("the hash the file was opened at is required", 400);
  }
  const file = pagesFilePath(pagesDir, rel);
  if (sourceHash(readFileSync(file, "utf8")) !== expectedHash) {
    throw new PageStoreError(`${rel} changed since it was opened — reload it before saving`, 409);
  }
  writeAtomic(file, source);
  return { file: rel, hash: sourceHash(source) };
}

/** Creates a new artifact of the given file type, refusing to clobber an existing one. */
export function createSource(
  pagesDir: string,
  slug: string,
  source: string,
  extension: PageExtension,
): string {
  if (sourceExists(pagesDir, slug)) {
    throw new PageStoreError(`page "${slug}" already exists`, 409);
  }
  writeSource(pagesDir, slug, source, extension);
  return slug;
}
