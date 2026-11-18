import type {
  DirectoryEntry,
  DocumentRepository,
  RepositoryFolder,
  FolderLintScope,
} from "./types";
import { normalizeErrorDiagnostics, type ErrorDiagnostics } from "@flanksource/clicky-ui";

export const GAVEL_ROUTE = "/__playground/gavel";
export class DocumentHttpError extends Error {
  constructor(
    readonly status: number,
    readonly diagnostics: ErrorDiagnostics,
  ) {
    super(diagnostics.message);
    if (!diagnostics.stacktrace && this.stack) diagnostics.stacktrace = this.stack;
  }
}
export const documentError = (cause: unknown): Error => cause instanceof Error ? cause : new Error(String(cause));
export async function documentJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const context: Array<[string, string]> = [["Method", init?.method ?? "GET"], ["Endpoint", path]];
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch (cause) {
    const error = documentError(cause);
    throw new DocumentHttpError(0, { ...normalizeErrorDiagnostics(error)!, message: `Repository request failed: ${error.message}`, context });
  }
  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "Missing";
  context.push(["Status", String(response.status)], ["Content type", contentType]);
  const details = [{ label: "Response", value: body }];
  if (!contentType.includes("application/json"))
    throw new DocumentHttpError(response.status, { message: "Repository review requires a live playground server and Gavel workspace API", context, details });
  let value: T;
  try {
    value = JSON.parse(body) as T;
  } catch (cause) {
    throw new DocumentHttpError(response.status, { message: `Repository review returned invalid JSON: ${documentError(cause).message}`, context, details });
  }
  if (!response.ok) {
    const diagnostics = normalizeErrorDiagnostics(value, `Request failed (${response.status})`) ?? { message: `Request failed (${response.status})`, context: [] };
    throw new DocumentHttpError(response.status, { ...diagnostics, context: [...diagnostics.context, ...context], details: [...(diagnostics.details ?? []), ...details] });
  }
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

export const folderLintScope = (id: string) => documentJson<FolderLintScope>(
  `/__playground/documents/scope?${new URLSearchParams({ id })}`,
);
