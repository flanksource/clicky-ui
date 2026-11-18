import { documentPath, folderPath, type RepositoryFolder } from "./types";

/**
 * A configured sidebar folder owns a subtree. Its `path` is both the group
 * prefix and the directory its ignore `overrides` are relative to (the server
 * receives it as `overrideDirectory`), so one folder object describes every
 * request made for any directory beneath it.
 */
export function directoryCacheKey({
  repositoryId,
  path,
  folder,
}: {
  repositoryId: string;
  path: string;
  folder: RepositoryFolder;
}): string {
  return JSON.stringify([repositoryId, path, folder.overrides, folder.path]);
}

export type NavigationTarget = {
  repositoryId: string;
  path: string;
  kind: "document" | "folder";
};

export function navigationTarget(
  slug: string | undefined,
): NavigationTarget | undefined {
  if (slug?.startsWith("document:"))
    return { ...documentPath(slug), kind: "document" };
  if (slug?.startsWith("folder:"))
    return { ...folderPath(slug), kind: "folder" };
  return undefined;
}

/** The configured folder with the longest path that contains `targetPath`; `"."` contains everything. */
export function containingFolder(
  folders: RepositoryFolder[],
  targetPath: string,
): RepositoryFolder | undefined {
  return folders
    .filter(
      (folder) =>
        folder.path === "." ||
        folder.path === targetPath ||
        targetPath.startsWith(`${folder.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
}

/** Directories to load, outermost first, so that every ancestor of the target has children cached. */
export function revealPaths({
  folder,
  target,
}: {
  folder: RepositoryFolder;
  target: NavigationTarget;
}): string[] {
  const segments =
    target.path === "."
      ? []
      : target.kind === "folder"
        ? target.path.split("/")
        : target.path.split("/").slice(0, -1);
  const prefixes = segments.map((_, index) =>
    segments.slice(0, index + 1).join("/"),
  );
  if (folder.path === ".") return [".", ...prefixes];
  return prefixes.slice(folder.path.split("/").length - 1);
}
