// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { join, resolve } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { registerCommentsMiddleware } from "./comments-server";
import { createAgentRuns, registerAgentRunsMiddleware } from "./agent-runs-server";
import { createPromptRuns, registerPromptRunsMiddleware } from "./prompt-runs-server";
import { registerNavigationMiddleware } from "./navigation-server";
import { registerSourcesMiddleware } from "./sources-server";
import { registerVisualEditsMiddleware } from "./visual-edits-server";
import { registerExportsMiddleware } from "./exports-server";
import { registerGavelLintMiddleware } from "./gavel-lint-server";
import { registerBlameMiddleware } from "./blame-server";
import { registerConnectionsMiddleware } from "./connections-server";
import { registerRuntimeProfilesMiddleware } from "./runtime-profiles-server";
import { registerWorkspaceFilesMiddleware } from "./workspace-files-server";
import { registerRepositoryDocumentsMiddleware } from "./repository-documents-server";
import { registerBookmarkletMiddleware } from "./bookmarklet-middleware";
import { registerPageActivityMiddleware } from "./page-activity";
import { fixedGavel } from "./gavel-launch-server";
import { registerVocabulariesMiddleware } from "./vocabularies-server";

vi.mock("vite", () => { throw new Error("Plain API middleware loaded the Vite runtime"); });

type Handler = (request: IncomingMessage, response: ServerResponse, next: (error?: unknown) => void) => void;
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0).reverse()) await cleanup(); });

async function fixture() {
  mkdirSync(".tmp", { recursive: true });
  const dir = mkdtempSync(resolve(".tmp/plain-middleware-"));
  cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
  const pagesDir = join(dir, "pages");
  mkdirSync(pagesDir);
  writeFileSync(join(pagesDir, "welcome.tsx"), "export default () => null;");
  const routes: { route: string; handler: Handler }[] = [];
  const middlewares = { use(route: string | Handler, handler?: Handler) {
    routes.push(typeof route === "string" ? { route, handler: handler! } : { route: "", handler: route });
    return this;
  } };
  const server = createServer((request, response) => {
    let index = 0;
    const dispatch = (error?: unknown) => {
      if (error) { response.statusCode = 500; response.end(String(error)); return; }
      const entry = routes[index++];
      if (!entry) { response.statusCode = 404; response.end("unhandled"); return; }
      const url = request.url!;
      if (!url.startsWith(entry.route)) return dispatch();
      request.url = url.slice(entry.route.length) || "/";
      entry.handler(request, response, (cause) => { request.url = url; dispatch(cause); });
    };
    dispatch();
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  cleanups.push(() => new Promise<void>((done, reject) => server.close((error) => error ? reject(error) : done())));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing plain middleware test address");
  return { dir, pagesDir, middlewares, logger: { error: vi.fn() }, origin: `http://127.0.0.1:${address.port}` };
}

it("mounts every API without a Vite server and preserves routing and validation", async () => {
  const options = await fixture();
  const { origin, dir } = options;
  const endpoint = fixedGavel("http://127.0.0.1:1");
  const events = { created: vi.fn(), changed: vi.fn(), deleted: vi.fn(), folderCreated: vi.fn(), folderDeleted: vi.fn() };
  const runs = createAgentRuns({ dir, captainURL: "http://127.0.0.1:1", cwd: dir, skillPath: "unused" });
  const prompts = createPromptRuns({ dir, workspace: dir, endpoint });
  registerAgentRunsMiddleware({ ...options, runs });
  registerPromptRunsMiddleware({ ...options, runs: prompts });
  registerCommentsMiddleware({ ...options });
  registerNavigationMiddleware({ ...options, endpoint, problems: async () => ({}) });
  registerSourcesMiddleware({ ...options, commentsDir: dir, workspaceRoot: dir, events });
  registerVisualEditsMiddleware({ ...options, workspaceRoot: dir, changed: events.changed });
  registerExportsMiddleware(options);
  registerGavelLintMiddleware({ ...options, workspaceRoot: dir, promptFile: "unused" });
  registerBlameMiddleware({ ...options, cwd: dir });
  registerConnectionsMiddleware({ ...options, gavel: endpoint, captainURL: "http://127.0.0.1:1" });
  registerRuntimeProfilesMiddleware({ ...options, modelsURL: "unused", permissionsURL: "unused", resolveURL: "unused", presetsResolveURL: "unused", runtimesURL: "unused" });
  registerWorkspaceFilesMiddleware({ ...options, cwd: dir });
  registerRepositoryDocumentsMiddleware({ ...options, endpoint });
  registerBookmarkletMiddleware({ ...options, script: () => "window.bookmarklet = true;" });
  registerPageActivityMiddleware(options);
  const routes = [
    ["agent-sessions", "POST"], ["prompts", "POST"], ["comments", "PUT"],
    ["navigation", "POST"], ["sources", "OPTIONS"], ["visual-edits", "GET"],
    ["exports/test.svg", "POST"], ["lint", "GET"], ["blame", "POST"],
    ["connections", "POST"], ["runtime-profiles/models", "POST"],
    ["workspace-files", "POST"], ["documents", "DELETE"], ["page-activity", "POST"],
  ];
  for (const [route, method] of routes) {
    const response = await fetch(`${origin}/__playground/${route}`, { method: method! });
    expect({ route, status: response.status, error: (await response.json()).error }).toEqual({ route, status: 405, error: expect.any(String) });
  }
  expect((await fetch(`${origin}/__playground/comments/schema`)).status).toBe(200);
  expect((await fetch(`${origin}/__playground/agent-sessions`)).status).toBe(200);
  expect(await (await fetch(`${origin}/__playground/document-problems`)).json()).toEqual({ results: {} });
  expect(await (await fetch(`${origin}/__playground/sources?slug=welcome`)).json()).toMatchObject({ slug: "welcome", source: "export default () => null;" });
  expect((await fetch(`${origin}/__playground/sources?slug=welcome`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "export default () => <main />;" }) })).status).toBe(200);
  expect(events.changed).toHaveBeenCalledWith(join(dir, "pages/welcome.tsx"));
  expect((await fetch(`${origin}/__playground/exports/shape.svg`, { method: "PUT", body: "<svg />" })).status).toBe(200);
  expect(await (await fetch(`${origin}/__playground/exports/shape.svg`)).text()).toBe("<svg />");
  expect(await (await fetch(`${origin}/__playground/documents/repositories`)).json()).toEqual([]);
  expect(await (await fetch(`${origin}/__playground/external-pages`)).json()).toEqual({ pages: [] });
  expect((await fetch(`${origin}/__playground/page-activity`)).status).toBe(200);
  expect((await fetch(`${origin}/unclaimed`)).status).toBe(404);
});

it("reads vocabulary metadata through plain middleware and declares runtime source URLs", async () => {
  const options = await fixture();
  const vocabulary = join(options.dir, "shapes");
  mkdirSync(vocabulary);
  writeFileSync(join(vocabulary, "Preview.tsx"), "throw new Error('preview executed'); export default () => <div />;");
  const item = { catalog: "shapes", type: "shape", id: "circle", label: "Circle", description: "Round node", references: ["shapes.md"] };
  writeFileSync(join(vocabulary, "catalog.ts"), `export default [${JSON.stringify(item)}];`);
  cleanups.push(registerVocabulariesMiddleware({ ...options, roots: [vocabulary], sourceRoots: [{ directory: options.dir, url: "/runtime/sources/" }] }));
  const response = await fetch(`${options.origin}/__playground/vocabularies`);
  const snapshot = await response.json();
  expect({ status: response.status, items: snapshot.items, catalogs: snapshot.catalogs }).toEqual({ status: 200, items: [item], catalogs: [{ id: "shapes", preview: `/runtime/sources/shapes/Preview.tsx?vocabVersion=${snapshot.revision}` }] });
  expect((await fetch(`${options.origin}/__playground/vocabularies`, { method: "POST" })).status).toBe(405);
  expect((await fetch(`${options.origin}/unclaimed`)).status).toBe(404);
  writeFileSync(join(vocabulary, "catalog.ts"), "export default fetch('/untrusted');");
  const invalid = await fetch(`${options.origin}/__playground/comments/schema`);
  expect({ status: invalid.status, error: (await invalid.json()).error }).toEqual({ status: 500, error: expect.stringContaining("metadata") });
});
