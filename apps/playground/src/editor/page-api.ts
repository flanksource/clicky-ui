import { requestActivityRefresh, requestNavigationRefresh } from "../navigation/refresh";

export const SOURCES_ROUTE = "/__playground/sources";

/**
 * Carries the status so callers can tell "gone" from "broken". Files under
 * `src/pages/` are edited by agents and editors as well as by the playground,
 * so a 404 usually means the nav is holding a row the glob has not caught up
 * on yet — recoverable, not a failure to report and leave on screen.
 */
export class PageApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PageApiError";
  }

  get missing(): boolean {
    return this.status === 404;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error(
      "Page filesystem actions require a live playground server. Start `pnpm run playground:prod` or `pnpm run dev:playground`.",
    );
  }
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new PageApiError(
      payload.error ?? `${init?.method ?? "GET"} ${url} failed (${response.status})`,
      response.status,
    );
  }
  return payload;
}

function jsonRequest<T>(url: string, method: string, body: unknown): Promise<T> {
  return request<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function fetchFolders(): Promise<string[]> {
  return request<{ folders: string[] }>(SOURCES_ROUTE).then(({ folders }) => folders);
}

/** Runs a structural page action, then tells the sidebar tree its shape changed. */
async function structural<T>(action: Promise<T>): Promise<T> {
  const result = await action;
  requestNavigationRefresh();
  return result;
}

export function createPage(
  slug: string,
  source: string,
  extension: ".tsx" | ".md" | ".mdx",
): Promise<{ slug: string }> {
  return structural(jsonRequest(SOURCES_ROUTE, "POST", { slug, source, extension }));
}

export function createFolder(folder: string): Promise<{ folder: string }> {
  return structural(jsonRequest(`${SOURCES_ROUTE}/folders`, "POST", { folder }));
}

export type MovePageRequest = {
  slug: string;
  nextSlug: string;
  title?: string;
};

export type MovePageResult = {
  slug: string;
  movedComments: number;
  updatedReferences: number;
  updatedFiles: number;
};

export function movePage(
  body: MovePageRequest,
): Promise<MovePageResult> {
  return structural(jsonRequest(SOURCES_ROUTE, "PATCH", body));
}

export function deletePage(
  slug: string,
): Promise<{ slug: string; deletedComments: number }> {
  return structural(
    request(`${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }),
  );
}

export type DeleteFolderResult = {
  folder: string;
  deletedPages: string[];
  deletedComments: number;
};

export function deleteFolder(folder: string): Promise<DeleteFolderResult> {
  return structural(
    request(`${SOURCES_ROUTE}/folders?folder=${encodeURIComponent(folder)}`, {
      method: "DELETE",
    }),
  );
}

/** `path` is the page file relative to the workspace root, e.g. `apps/playground/src/pages/notes.md`. */
export function readPage(slug: string): Promise<{ source: string; path: string }> {
  return request(`${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`);
}

export async function writePage(slug: string, source: string): Promise<{ slug: string }> {
  const saved = await jsonRequest<{ slug: string }>(
    `${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`,
    "PUT",
    { slug, source },
  );
  requestActivityRefresh();
  return saved;
}

/** A page module or helper under `src/pages/`; `file` is relative to it, `path` to the workspace root. */
export type PagesFile = { file: string; path: string; source: string; hash: string };

const filesUrl = (file: string) => `${SOURCES_ROUTE}/files?file=${encodeURIComponent(file)}`;

export function readPagesFile(file: string): Promise<PagesFile> {
  return request(filesUrl(file));
}

/** Rejects with a 409 `PageApiError` when the file changed since `expectedHash` was read. */
export async function writePagesFile(
  file: string,
  source: string,
  expectedHash: string,
): Promise<{ file: string; hash: string }> {
  const saved = await jsonRequest<{ file: string; hash: string }>(filesUrl(file), "PUT", { source, expectedHash });
  requestActivityRefresh();
  return saved;
}
