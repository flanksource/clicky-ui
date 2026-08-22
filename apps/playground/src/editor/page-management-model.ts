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
