import type { MiddlewareApp } from "./middleware";
import type { Plugin } from "vite";
import { readJsonBody, sendJson } from "./comments-server";
import type { GavelEndpoint } from "./gavel-launch-server";
import { RepositoryDocuments } from "./repository-documents";
import { prepareRepositoryFolder } from "./repository-folder";
import type {
  DocumentRepository,
  RepositoryFolder,
} from "../src/documents/types";

export async function authorizeDocumentDirectory({
  dir,
  endpoint,
  page,
}: {
  dir: string;
  endpoint: GavelEndpoint;
  page: string;
}): Promise<string> {
  const target = new RepositoryDocuments(dir).document(page);
  const response = await fetch(
    new URL(
      `/api/workspace/repository?${new URLSearchParams({ path: target.repository.root })}`,
      await endpoint.url(),
    ),
  );
  const repository = (await response.json()) as {
    root: string;
    error?: string;
  };
  if (!response.ok)
    throw new Error(
      repository.error ?? "Document repository is no longer enabled",
    );
  if (repository.root !== target.repository.root)
    throw new Error("Document repository identity changed");
  return repository.root;
}

export function registerRepositoryDocumentsMiddleware({ middlewares, dir, endpoint }: { middlewares: MiddlewareApp; dir: string; endpoint: GavelEndpoint }): void {
  const store = new RepositoryDocuments(dir);
  middlewares.use("/__playground/documents", (req, res) => {
    void (async () => {
      const url = new URL(req.url ?? "/", "http://playground.local");
      if (url.pathname === "/scope" && req.method === "GET") {
        const scope = await prepareRepositoryFolder({
          dir,
          endpoint,
          page: url.searchParams.get("id") ?? "",
        });
        return sendJson(res, 200, {
          files: scope.files,
          revision: scope.revision,
        });
      }
      if (url.pathname === "/repositories" && req.method === "GET")
        return sendJson(res, 200, store.all());
      if (url.pathname === "/repositories" && req.method === "POST") {
        const input = await readJsonBody(req);
        if (typeof input["path"] !== "string")
          throw new Error("Repository path is required");
        const response = await fetch(
          new URL(
            `/api/workspace/repository?${new URLSearchParams({ path: input["path"] })}`,
            await endpoint.url(),
          ),
        );
        const repo = (await response.json()) as DocumentRepository & {
          error?: string;
        };
        if (!response.ok) return sendJson(res, response.status, repo);
        return sendJson(res, 201, store.add(repo));
      }
      if (url.pathname === "/folder" && req.method === "PUT") {
        const input = await readJsonBody(req);
        if (typeof input["id"] !== "string")
          throw new Error("Repository id is required");
        store.folder(input["id"], input["folder"] as RepositoryFolder);
        return sendJson(res, 200, store.all());
      }
      if (url.pathname === "/target" && req.method === "GET")
        return sendJson(
          res,
          200,
          store.document(url.searchParams.get("id") ?? ""),
        );
      sendJson(res, 405, { error: "Unknown document operation" });
    })().catch((cause: unknown) =>
      sendJson(res, 400, {
        error: cause instanceof Error ? cause.message : String(cause),
      }),
    );
  });
  middlewares.use("/__playground/gavel", (req, res) => {
    const abort = new AbortController();
    res.once("close", () => abort.abort());
    void (async () => {
      const path = req.url ?? "/";
      if (!/^\/api\/(workspace\/|runs(?:[/?]|$)|launch(?:[/?]|$))/.test(path))
        return sendJson(res, 404, { error: "Unknown Gavel operation" });
      const method = req.method ?? "GET";
      const headers: Record<string, string> = {};
      if (typeof req.headers["idempotency-key"] === "string")
        headers["Idempotency-Key"] = req.headers["idempotency-key"];
      const body = ["POST", "PUT"].includes(method)
        ? JSON.stringify(await readJsonBody(req))
        : undefined;
      if (body) headers["Content-Type"] = "application/json";
      const response = await fetch(new URL(path, await endpoint.url()), {
        method,
        headers,
        signal: abort.signal,
        ...(body ? { body } : {}),
      });
      res.statusCode = response.status;
      for (const key of [
        "content-type",
        "cache-control",
        "content-security-policy",
        "x-content-type-options",
      ]) {
        const value = response.headers.get(key);
        if (value) res.setHeader(key, value);
      }
      if (!response.body) {
        res.end();
        return;
      }
      res.flushHeaders();
      const reader = response.body.getReader();
      while (!abort.signal.aborted) {
        const chunk = await reader.read();
        if (chunk.done) break;
        res.write(chunk.value);
      }
      res.end();
    })().catch((cause: unknown) => {
      if (abort.signal.aborted) return;
      const error = cause instanceof Error ? cause.message : String(cause);
      if (res.headersSent) res.destroy(new Error(error));
      else sendJson(res, 502, { error });
    });
  });
}

export function playgroundRepositoryDocuments({
  dir,
  endpoint,
}: {
  dir: string;
  endpoint: GavelEndpoint;
}): Plugin {
  return {
    name: "playground-repository-documents",
    configureServer: (server) => {
      registerRepositoryDocumentsMiddleware({ middlewares: server.middlewares, dir, endpoint });
    },
    configurePreviewServer: (server) => {
      registerRepositoryDocumentsMiddleware({ middlewares: server.middlewares, dir, endpoint });
    },
  };
}
