export const SOURCES_ROUTE = "/__playground/sources";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error(
      "Page filesystem actions only work under `vite dev` — the playground-sources " +
        "middleware is not part of the production build.",
    );
  }
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `${init?.method ?? "GET"} ${url} failed (${response.status})`);
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

export function createPage(slug: string, source: string): Promise<{ slug: string }> {
  return jsonRequest(SOURCES_ROUTE, "POST", { slug, source });
}

export function createFolder(folder: string): Promise<{ folder: string }> {
  return jsonRequest(`${SOURCES_ROUTE}/folders`, "POST", { folder });
}

export type MovePageRequest = {
  slug: string;
  nextSlug: string;
  title?: string;
};

export function movePage(
  body: MovePageRequest,
): Promise<{ slug: string; movedComments: number }> {
  return jsonRequest(SOURCES_ROUTE, "PATCH", body);
}

export function deletePage(
  slug: string,
): Promise<{ slug: string; deletedComments: number }> {
  return request(`${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

export function readPage(slug: string): Promise<{ source: string }> {
  return request(`${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`);
}

export function writePage(slug: string, source: string): Promise<{ slug: string }> {
  return jsonRequest(`${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`, "PUT", {
    slug,
    source,
  });
}
