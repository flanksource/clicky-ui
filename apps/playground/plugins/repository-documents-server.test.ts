// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { resolve } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { fixedGavel } from "./gavel-launch-server";
import { RepositoryDocuments } from "./repository-documents";
import { playgroundRepositoryDocuments } from "./repository-documents-server";

afterEach(() => vi.unstubAllGlobals());

it("previews the exact visible descendant scope and invalidates its revision when a file changes", async () => {
  mkdirSync(resolve(".tmp"), { recursive: true });
  const dir = mkdtempSync(resolve(".tmp/folder-scope-"));
  const repository = new RepositoryDocuments(dir).add({
    root: "/enabled/repo",
    name: "repo",
  });
  const routes = new Map<
    string,
    (req: IncomingMessage, res: ServerResponse) => void
  >();
  const plugin = playgroundRepositoryDocuments({
    dir,
    endpoint: fixedGavel("http://gavel.local"),
  });
  (plugin.configureServer as (server: unknown) => void)({
    middlewares: {
      use: (
        route: string,
        handler: (req: IncomingMessage, res: ServerResponse) => void,
      ) => routes.set(route, handler),
    },
  });
  const server = createServer((req, res) => {
    const handler = routes.get("/__playground/documents");
    if (!handler) throw new Error("Document middleware is missing");
    req.url = req.url?.replace("/__playground/documents", "");
    handler(req, res);
  });
  const realFetch = globalThis.fetch;
  let revision = "original";
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.host !== "gavel.local") return realFetch(input, init);
      const path = init?.body
        ? (JSON.parse(String(init.body)) as { path: string }).path
        : "";
      const value = url.pathname.endsWith("/entries")
        ? path === "docs"
          ? [
              { path: "docs/guide.md", directory: false, visible: true },
              { path: "docs/nested", directory: true, visible: true },
              { path: "docs/ignored.md", directory: false, visible: false },
            ]
          : [{ path: "docs/nested/setup.md", directory: false, visible: true }]
        : { revision };
      return Response.json(value);
    }),
  );
  try {
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Scope test has no TCP address");
    const endpoint = `http://127.0.0.1:${address.port}/__playground/documents/scope`;
    const query = new URLSearchParams({ id: `folder:${repository.id}/docs` });
    const first = await fetch(`${endpoint}?${query}`);
    expect(first.status).toBe(200);
    const scope = (await first.json()) as { files: string[]; revision: string };
    expect(scope.files).toEqual(["docs/guide.md", "docs/nested/setup.md"]);
    expect(scope.revision).toMatch(/^[a-f\d]{64}$/);
    revision = "edited";
    expect(
      (
        (await (await fetch(`${endpoint}?${query}`)).json()) as {
          revision: string;
        }
      ).revision,
    ).not.toBe(scope.revision);
    const invalid = await fetch(
      `${endpoint}?${new URLSearchParams({ id: `folder:${repository.id}/../outside` })}`,
    );
    expect(invalid.status).toBe(400);
  } finally {
    await new Promise<void>((done, reject) =>
      server.close((error) => (error ? reject(error) : done())),
    );
    rmSync(dir, { recursive: true, force: true });
  }
});
