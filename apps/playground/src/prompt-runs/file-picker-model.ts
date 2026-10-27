import type { ComboboxOption } from "@flanksource/clicky-ui";

import type { WorkspaceFile } from "./prompt-runs-api";

/** One row of a folder listing: a subfolder (with the files beneath it) or a file. */
export type FolderEntry =
  | { kind: "folder"; path: string; name: string; count: number }
  | { kind: "file"; path: string; name: string; status?: string };

const baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

/** The subfolders of `folder` with their file counts, then its own files; both by name. */
export function folderEntries(files: WorkspaceFile[], folder: string): FolderEntry[] {
  const prefix = folder ? `${folder}/` : "";
  const folders = new Map<string, number>();
  const own: FolderEntry[] = [];
  for (const file of files) {
    if (!file.path.startsWith(prefix)) continue;
    const rest = file.path.slice(prefix.length);
    const slash = rest.indexOf("/");
    if (slash === -1) {
      own.push({ kind: "file", path: file.path, name: rest, ...(file.status ? { status: file.status } : {}) });
    } else {
      const name = rest.slice(0, slash);
      folders.set(name, (folders.get(name) ?? 0) + 1);
    }
  }
  const byName = (a: FolderEntry, b: FolderEntry) => a.name.localeCompare(b.name);
  return [
    ...[...folders].map(([name, count]): FolderEntry => ({ kind: "folder", path: `${prefix}${name}`, name, count })).sort(byName),
    ...own.sort(byName),
  ];
}

/** The breadcrumb trail from the root ("All files") down to `folder`. */
export function folderCrumbs(folder: string): { path: string; name: string }[] {
  const parts = folder ? folder.split("/") : [];
  return [
    { path: "", name: "All files" },
    ...parts.map((name, index) => ({ path: parts.slice(0, index + 1).join("/"), name })),
  ];
}

/**
 * Files whose path holds every whitespace-separated term, case-insensitively.
 * Ranked by: all terms in the file name, then changed files, then shorter paths.
 */
export function searchFiles(
  files: WorkspaceFile[],
  query: string,
  limit: number,
): { matches: WorkspaceFile[]; total: number } {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { matches: [], total: 0 };
  const hits = files.filter((file) => {
    const path = file.path.toLowerCase();
    return terms.every((term) => path.includes(term));
  });
  const nameHit = (file: WorkspaceFile) => {
    const name = baseName(file.path).toLowerCase();
    return terms.every((term) => name.includes(term)) ? 0 : 1;
  };
  hits.sort(
    (a, b) =>
      nameHit(a) - nameHit(b) ||
      Number(Boolean(b.status)) - Number(Boolean(a.status)) ||
      a.path.length - b.path.length ||
      a.path.localeCompare(b.path),
  );
  return { matches: hits.slice(0, limit), total: hits.length };
}

/**
 * The inline typeahead's options. Before typing: the element's own files, then
 * git changes. While typing: ranked matches. Selected files are always kept, so
 * their chips have a label even when they fall outside both lists.
 */
export function pickerOptions({
  files,
  query,
  suggested,
  selected,
  limit,
}: {
  files: WorkspaceFile[];
  query: string;
  suggested: string[];
  selected: string[];
  limit: number;
}): ComboboxOption[] {
  const status = new Map(files.map((file) => [file.path, file.status]));
  const option = (path: string, group: string): ComboboxOption => {
    const code = group === "Git changes" ? status.get(path) : undefined;
    return { value: path, label: path, group, ...(code ? { description: code } : {}) };
  };
  const listed = query.trim()
    ? searchFiles(files, query, limit).matches.map((file) => option(file.path, "Matches"))
    : [
        ...suggested.map((path) => option(path, "This element")),
        ...files
          .filter((file) => file.status && !suggested.includes(file.path))
          .slice(0, limit)
          .map((file) => option(file.path, "Git changes")),
      ];
  const shown = new Set(listed.map((entry) => entry.value));
  return [...listed, ...selected.filter((path) => !shown.has(path)).map((path) => option(path, "Selected"))];
}

/** A `files` string argument holds space-separated paths, the way a CLI takes a file list. */
export const splitFileValue = (value: string): string[] => value.split(/\s+/).filter(Boolean);

export const joinFileValue = (paths: string[]): string => paths.join(" ");
