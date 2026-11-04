export type RepositoryFolder = { path: string; overrides: string[] };
export type DocumentRepository = {
  id: string;
  root: string;
  name: string;
  folders: RepositoryFolder[];
};
export type DirectoryEntry = {
  path: string;
  name: string;
  directory: boolean;
  visible: boolean;
  rule?: string;
};
export type DocumentFile = {
  root: string;
  path: string;
  source: string;
  revision: string;
};
export type DocumentLease = {
  id: string;
  expires: string;
  idleMilliseconds: number;
  file: DocumentFile;
};

export function documentPath(id: string): {
  repositoryId: string;
  path: string;
} {
  const match = /^document:([\da-f-]{36})\/(.+)$/.exec(id);
  if (!match?.[1] || !match[2])
    throw new Error(`Invalid document identity: ${id}`);
  const path = match[2];
  if (
    path
      .split("/")
      .some(
        (part) => !part || part === "." || part === ".." || part === ".git",
      ) ||
    path.includes("\\") ||
    path.includes("\0")
  )
    throw new Error("Document path must stay inside its repository");
  if (!/\.(md|mdx|markdown)$/i.test(path))
    throw new Error("Select a Markdown document");
  return { repositoryId: match[1], path };
}
