import type {
  DirectoryEntry,
  DocumentRepository,
  RepositoryFolder,
} from "./types";

export const GAVEL_ROUTE = "/__playground/gavel";
export class DocumentHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function documentJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, init);
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "Repository review requires a live playground server and Gavel workspace API",
    );
  const value = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new DocumentHttpError(
      response.status,
      value.error ?? `Request failed (${response.status})`,
    );
  return value;
}
export const jsonBody = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
export const workspaceURL = (operation: string, root: string, path: string) =>
  `${GAVEL_ROUTE}/api/workspace/${operation}?${new URLSearchParams({ root, path })}`;
export const repositories = () =>
  documentJson<DocumentRepository[]>("/__playground/documents/repositories");
export const addRepository = (path: string) =>
  documentJson<DocumentRepository>(
    "/__playground/documents/repositories",
    jsonBody("POST", { path }),
  );
export const saveFolder = (id: string, folder: RepositoryFolder) =>
  documentJson<DocumentRepository[]>(
    "/__playground/documents/folder",
    jsonBody("PUT", { id, folder }),
  );
export const directoryEntries = (input: {
  root: string;
  path: string;
  overrides: string[];
  includeIgnored?: boolean;
  overrideDirectory?: string;
}) =>
  documentJson<DirectoryEntry[]>(
    `${GAVEL_ROUTE}/api/workspace/entries`,
    jsonBody("POST", input),
  );
