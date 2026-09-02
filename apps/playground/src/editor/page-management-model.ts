import type { AppShellNavDropTarget } from "@flanksource/clicky-ui";

export function foldersFromSlugs(slugs: readonly string[]): string[] {
  const folders = new Set<string>();
  for (const slug of slugs) {
    const segments = slug.split("/");
    segments.pop();
    segments.forEach((_, index) => folders.add(segments.slice(0, index + 1).join("/")));
  }
  return [...folders].sort((left, right) => left.localeCompare(right));
}

export function pageFolder(slug: string): string {
  return slug.split("/").slice(0, -1).join("/");
}

export function pageFilename(slug: string): string {
  return slug.split("/").at(-1) ?? slug;
}

export function joinPageSlug(folder: string, filename: string): string {
  return folder ? `${folder}/${filename}` : filename;
}

/**
 * Where a page dragged onto a nav row lands, or `null` when the drop would not
 * move it — onto itself, or into the folder it already sits in.
 *
 * Dropping on a folder means "into this folder"; dropping on a page means "next
 * to this page", the same as every file explorer. That second rule is what
 * makes the root reachable: a root-level page row is a far easier target than
 * the section heading.
 */
export function plannedPageMove(
  slug: string,
  target: AppShellNavDropTarget,
): string | null {
  if (target.key === slug) return null;
  const folder =
    target.kind === "section"
      ? ""
      : target.kind === "group"
        ? target.key
        : pageFolder(target.key);
  const nextSlug = joinPageSlug(folder, pageFilename(slug));
  return nextSlug === slug ? null : nextSlug;
}
