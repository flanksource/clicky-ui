export type WorkspaceAccessRoot = {
  id: string;
  path: string;
  source: "saved" | "command-line";
  available: boolean;
};
export type WorkspaceAccessClient = {
  list(): Promise<{ roots: WorkspaceAccessRoot[]; canManage: boolean }>;
  preview(path: string): Promise<{ path: string }>;
  grant(path: string, canonicalPath: string): Promise<WorkspaceAccessRoot>;
  revoke(id: string): Promise<unknown>;
  subscribe(changed: () => void, failed: (error: Error) => void): () => void;
};
export function workspaceAccessClient(
  base = "/api/workspace/access"
): WorkspaceAccessClient {
  async function request<T>(
    path: string,
    method = "GET",
    body?: unknown
  ): Promise<T> {
    const response = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const value = await response.json();
    if (!response.ok)
      throw new Error(
        value.error ?? `Workspace access: HTTP ${response.status}`
      );
    return value as T;
  }
  return {
    list: () => request(""),
    preview: (path) => request("/preview", "POST", { path }),
    grant: (path, canonicalPath) =>
      request("", "POST", { path, canonicalPath }),
    revoke: (id) => request(`/${encodeURIComponent(id)}`, "DELETE"),
    subscribe: (changed, failed) => {
      const source = new EventSource(base + "/events");
      source.addEventListener("workspace-access", changed);
      source.addEventListener("workspace-access-error", (event) =>
        failed(
          new Error(JSON.parse((event as MessageEvent<string>).data).error)
        )
      );
      source.onerror = () =>
        failed(
          new Error(
            "Workspace access notifications unavailable. Check the Gavel connection."
          )
        );
      return () => source.close();
    },
  };
}
