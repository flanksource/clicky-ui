import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve, sep } from "node:path";

/**
 * Reads and writes artifact sources under `src/pages/`.
 *
 * This backs a browser-driven file write, so every path is derived from a
 * validated slug and then re-checked for containment. The slug pattern already
 * makes traversal impossible; the containment assert is deliberate redundancy
 * on the one endpoint that can create files.
 */
export const PAGE_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/;

export function assertSlug(slug: unknown): string {
  if (typeof slug !== "string" || slug === "") {
    throw new Error("a page slug is required");
  }
  if (!PAGE_SLUG_PATTERN.test(slug)) {
    throw new Error(
      `invalid page slug "${slug}" — use lowercase letters, digits and hyphens, ` +
        'optionally nested with "/" (for example "dashboards/agent-inbox")',
    );
  }
  return slug;
}

export function pagePath(pagesDir: string, slug: string): string {
  assertSlug(slug);
  const root = resolve(pagesDir);
  const full = resolve(root, `${slug}.tsx`);
  if (!full.startsWith(root + sep)) {
    throw new Error(`refusing to touch "${slug}": it resolves outside ${root}`);
  }
  return full;
}

export function sourceExists(pagesDir: string, slug: string): boolean {
  return existsSync(pagePath(pagesDir, slug));
}

export function readSource(pagesDir: string, slug: string): string {
  const file = pagePath(pagesDir, slug);
  if (!existsSync(file)) throw new Error(`page "${slug}" does not exist`);
  return readFileSync(file, "utf8");
}

export function writeSource(pagesDir: string, slug: string, source: string): void {
  if (typeof source !== "string") throw new Error("page source must be a string");

  const file = pagePath(pagesDir, slug);
  mkdirSync(resolve(file, ".."), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, source, "utf8");
  renameSync(tmp, file);
}

/** Creates a new artifact, refusing to clobber an existing one. */
export function createSource(pagesDir: string, slug: string, source: string): string {
  if (sourceExists(pagesDir, slug)) {
    throw new Error(`page "${slug}" already exists`);
  }
  writeSource(pagesDir, slug, source);
  return slug;
}
