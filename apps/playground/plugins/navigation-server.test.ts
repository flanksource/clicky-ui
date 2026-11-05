// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname, join, resolve } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import type { DirectoryEntry } from "../src/documents/types";
import type { NavigationEntry, NavigationResponse } from "../src/navigation/types";
import type { DocumentProblems } from "./document-problems";
import { configureComments } from "./comments-client";
import { fixedGavel } from "./gavel-launch-server";
import { playgroundNavigation } from "./navigation-server";
import { RepositoryDocuments } from "./repository-documents";

type Handler = (req: IncomingMessage, res: ServerResponse) => void;
type EntryRequest = { path: string; overrideDirectory: string; includeIgnored: boolean; root: string; overrides: string[] };

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const EXTERNAL_ID = "external:33333333-3333-3333-3333-333333333333";
const cleanups: (() => Promise<void> | void)[] = [];

afterEach(async () => {
  vi.unstubAllGlobals();
  for (const cleanup of cleanups.splice(0)) await cleanup();
});

const file = (path: string, visible = true): DirectoryEntry => ({ path, name: path.split("/").at(-1)!, directory: false, visible });
const directory = (path: string): DirectoryEntry => ({ path, name: path.split("/").at(-1)!, directory: true, visible: true });
const listings = (includeIgnored: boolean): Record<string, DirectoryEntry[]> => ({
  ".": [directory("docs"), file("README.md"), file("notes.txt")],
  docs: [file("docs/guide.md"), directory("docs/deep")],
  "docs/deep": [file("docs/deep/setup.md"), ...(includeIgnored ? [file("docs/deep/draft.md", false)] : [])],
});

function writeAt(path: string, text: string, ageMs: number) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  const time = new Date(Date.now() - ageMs);
  utimesSync(path, time, time);
}

async function fixture({ problems = () => ({}), betaAge = 3 * HOUR }: { problems?: (repositoryId: string) => DocumentProblems; betaAge?: number } = {}) {
  mkdirSync(resolve(".tmp"), { recursive: true });
  const dir = mkdtempSync(resolve(".tmp/navigation-"));
  const pagesDir = join(dir, "pages");
  writeAt(join(pagesDir, "solo.tsx"), "export default () => null", HOUR);
  writeAt(join(pagesDir, "alpha/inner.md"), "# Inner", 2 * HOUR);
  writeAt(join(pagesDir, "beta/inner.tsx"), "export default () => null", betaAge);
  writeAt(join(pagesDir, "_helper.tsx"), "export {}", HOUR);
  writeAt(join(pagesDir, "solo.test.tsx"), "export {}", HOUR);
  const repository = new RepositoryDocuments(dir).add({ root: "/enabled/repo", name: "repo" });
  const documentId = (path: string) => `document:${repository.id}/${path}`;
  const iso = (ageMs: number) => new Date(Date.now() - ageMs).toISOString();
  const comment = (id: string, page: string, status: string, ageMs: number) => ({
    id,
    bodyMarkdown: id,
    author: { kind: "user", id: "user:you", label: "You" },
    target: { uri: `gavel://test/page/${page}`, scopeUri: "gavel://test", kind: "playground-page" },
    status,
    version: 1,
    createdAt: iso(ageMs),
    updatedAt: iso(ageMs),
    content: { playground: { page } },
  });
  const gavelComments = [
    comment("c1", "solo", "open", 5 * HOUR),
    comment("c2", documentId("docs/guide.md"), "open", HOUR / 2),
    comment("c3", documentId("docs/deep/setup.md"), "resolved", 6 * HOUR),
    comment("c4", EXTERNAL_ID, "open", HOUR / 4),
  ];
  configureComments({ dir, endpoint: fixedGavel("http://gavel.local"), workspace: "/workspace" });
  writeFileSync(
    join(dir, "external-pages.json"),
    JSON.stringify([{ id: EXTERNAL_ID, title: "Setup dashboard", base: "https://example.com/dash", urls: ["https://example.com/dash"] }]),
  );

  const calls: EntryRequest[] = [];
  let entriesStatus = 200;
  const realFetch = globalThis.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.host !== "gavel.local") return realFetch(input, init);
      if (url.pathname === "/api/v1/comments") {
        const limit = Number(url.searchParams.get("limit"));
        const offset = Number(url.searchParams.get("offset"));
        return Response.json({ data: gavelComments.slice(offset, offset + limit), page: { total: gavelComments.length, limit, offset } });
      }
      if (entriesStatus !== 200) return Response.json({ error: "gavel down" }, { status: entriesStatus });
      const request = JSON.parse(String(init?.body)) as EntryRequest;
      calls.push(request);
      const entries = listings(request.includeIgnored)[request.path];
      return entries ? Response.json(entries) : Response.json({ error: `no directory ${request.path}` }, { status: 404 });
    }),
  );

  const routes = new Map<string, Handler>();
  const plugin = playgroundNavigation({
    dir,
    pagesDir,
    endpoint: fixedGavel("http://gavel.local"),
    problems: async () => problems(repository.id),
    loadMeta: async (path) => (path.endsWith("solo.tsx") ? { title: "Setup guide", description: "Start here", icon: Object.assign(() => null, { displayName: "UiFileCode" }) } : undefined),
  });
  (plugin.configureServer as (server: unknown) => void)({
    middlewares: { use: (route: string, handler: Handler) => routes.set(route, handler) },
    ssrLoadModule: async () => ({}),
    config: { root: dir },
    watcher: { on: () => undefined, off: () => undefined },
    httpServer: undefined,
  });
  const server = createServer((req, res) => {
    const handler = routes.get("/__playground/navigation");
    if (!handler) throw new Error("Navigation middleware is missing");
    req.url = req.url?.replace("/__playground/navigation", "");
    handler(req, res);
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Navigation test has no TCP address");
  cleanups.push(
    () => new Promise<void>((done, reject) => server.close((error) => (error ? reject(error) : done()))),
    () => rmSync(dir, { recursive: true, force: true }),
  );
  return {
    repository,
    documentId,
    calls,
    failEntries: (status: number) => {
      entriesStatus = status;
    },
    post: () => realFetch(`http://127.0.0.1:${address.port}/__playground/navigation`, { method: "POST" }),
    async get(query: Record<string, string> = {}) {
      const response = await realFetch(`http://127.0.0.1:${address.port}/__playground/navigation?${new URLSearchParams({ node: "", ...query })}`);
      return { status: response.status, body: (await response.json()) as NavigationResponse & { error?: string } };
    },
  };
}

const keys = (entries: NavigationEntry[] | undefined) => entries?.map((entry) => entry.key);
const repoKey = (id: string, folder: string, path: string) => `repo:${id}:${folder}:${path}`;

it("serves the merged root: repository folder and pages by latest activity, External pages last, with olderCount", async () => {
  const { get, repository, calls } = await fixture();
  const { status, body } = await get();
  expect(status).toBe(200);
  expect(keys(body.children)).toEqual([repoKey(repository.id, ".", "."), "page-item:solo", "page:alpha", "page:beta", "external"]);
  expect(body.olderCount).toBe(0);
  const [repo, solo, alpha, , external] = body.children;
  expect(repo).toMatchObject({ kind: "folder", label: "repo", slug: `folder:${repository.id}/.`, source: "repository", hasChildren: true, activity: { openCount: 1, resolvedCount: 1 } });
  expect(repo?.children).toBeUndefined();
  expect(solo).toMatchObject({ kind: "page", label: "Setup guide", description: "Start here", icon: "UiFileCode", slug: "solo", activity: { openCount: 1 } });
  expect(alpha).toMatchObject({ kind: "folder", label: "Alpha", folderPath: "alpha", hasChildren: true });
  expect(alpha?.children).toBeUndefined();
  expect(external).toMatchObject({ kind: "folder", label: "External pages", source: "external", hasChildren: true });
  expect(calls).toEqual([]);
});

it("expands a page folder, the External pages folder and a repository directory lazily", async () => {
  const { get, repository, calls } = await fixture();
  expect(keys((await get({ node: "page:alpha" })).body.children)).toEqual(["page-item:alpha/inner"]);
  const external = (await get({ node: "external" })).body.children;
  expect(external).toMatchObject([{ key: EXTERNAL_ID, kind: "external", label: "Setup dashboard", slug: EXTERNAL_ID, activity: { openCount: 1 } }]);

  const docs = (await get({ node: repoKey(repository.id, ".", "docs") })).body.children;
  expect(docs.map((entry) => [entry.key, entry.kind, entry.label, entry.activity.openCount])).toEqual([
    [`doc:document:${repository.id}/docs/guide.md`, "document", "guide.md", 1],
    [repoKey(repository.id, ".", "docs/deep"), "folder", "deep", 0],
  ]);
  expect(calls).toEqual([{ root: "/enabled/repo", path: "docs", overrides: [], overrideDirectory: ".", includeIgnored: false }]);
  await get({ node: repoKey(repository.id, ".", "docs") });
  expect(calls).toHaveLength(1);
});

it("reveals a deep active document with its ancestors open and an ignored target included", async () => {
  const { get, repository, calls, documentId } = await fixture();
  const { body } = await get({ active: documentId("docs/deep/draft.md") });
  const repo = body.children.find((entry) => entry.key === repoKey(repository.id, ".", "."));
  expect(repo).toMatchObject({ open: true });
  expect(repo?.children?.map((entry) => entry.label)).toEqual(["docs", "README.md"]);
  const docs = repo?.children?.[0];
  expect(docs).toMatchObject({ open: true });
  const deep = docs?.children?.find((entry) => entry.label === "deep");
  expect(deep).toMatchObject({ open: true });
  expect(deep?.children?.map((entry) => [entry.label, entry.hidden ?? false])).toEqual([["setup.md", false], ["draft.md (ignored)", true]]);
  expect(calls.map((call) => [call.path, call.includeIgnored])).toEqual([[".", true], ["docs", true], ["docs/deep", true]]);
});

it("hides pages older than seven days, counts them, and keeps the active one with its folder open", async () => {
  const { get } = await fixture({ betaAge: 30 * DAY });
  const root = await get();
  expect(keys(root.body.children)).not.toContain("page:beta");
  expect(root.body.olderCount).toBe(1);
  expect(keys((await get({ age: "all" })).body.children)).toContain("page:beta");
  expect(keys((await get({ q: "inner" })).body.children)).toContain("page:beta");
  const active = await get({ active: "beta/inner" });
  expect(active.body.children.find((entry) => entry.key === "page:beta")).toMatchObject({ open: true, children: [{ key: "page-item:beta/inner" }] });
  expect(active.body.olderCount).toBe(0);
});

it("searches pages, repository documents and external pages in one response", async () => {
  const { get, repository } = await fixture();
  const { status, body } = await get({ q: "setup" });
  expect(status).toBe(200);
  expect(keys(body.children)).toEqual([repoKey(repository.id, ".", "."), "page-item:solo", "external"]);
  const repo = body.children[0];
  expect(repo).toMatchObject({ open: true });
  expect(repo?.children?.map((entry) => [entry.key, entry.open])).toEqual([[repoKey(repository.id, ".", "docs"), true]]);
  const deep = repo?.children?.[0]?.children?.[0];
  expect(deep).toMatchObject({ key: repoKey(repository.id, ".", "docs/deep"), open: true });
  expect(keys(deep?.children)).toEqual([`doc:document:${repository.id}/docs/deep/setup.md`]);
  expect(body.children[2]).toMatchObject({ open: true, children: [{ key: EXTERNAL_ID }] });
});

it("filters every source by open or resolved threads", async () => {
  const { get, repository } = await fixture();
  const open = await get({ filters: "open" });
  expect(keys(open.body.children)).toEqual([repoKey(repository.id, ".", "."), "page-item:solo", "external"]);
  const resolved = await get({ filters: "resolved" });
  expect(keys(resolved.body.children)).toEqual([repoKey(repository.id, ".", ".")]);
  const docs = await get({ filters: "resolved", node: repoKey(repository.id, ".", "docs") });
  expect(keys(docs.body.children)).toEqual([repoKey(repository.id, ".", "docs/deep")]);
});

it("sets lint problems on documents and sums them on the folders above", async () => {
  const lint = { violations: [{ file: "docs/deep/setup.md" }, { file: "docs/deep/setup.md" }] };
  const { get, documentId } = await fixture({
    problems: (id) => ({ [`document:${id}/docs/deep/setup.md`]: { plain: [lint], prompt: [] } }) as unknown as DocumentProblems,
  });
  const { body } = await get({ active: documentId("docs/deep/setup.md") });
  const repo = body.children[0];
  const docs = repo?.children?.find((entry) => entry.label === "docs");
  const deep = docs?.children?.find((entry) => entry.label === "deep");
  const setup = deep?.children?.find((entry) => entry.label === "setup.md");
  expect([repo?.problems, docs?.problems, deep?.problems, setup?.problems]).toEqual([2, 2, 2, 2]);
  expect(docs?.children?.find((entry) => entry.label === "guide.md")?.problems).toBeUndefined();
});

it("still serves the tree when lint problems fail, reporting the failure instead of counts", async () => {
  const failure = "workspace path is outside enabled roots";
  const { get, documentId, repository } = await fixture({
    problems: () => {
      throw new Error(failure);
    },
  });
  const root = await get({ active: documentId("docs/deep/setup.md") });
  const repo = root.body.children[0];
  const lazy = await get({ node: repoKey(repository.id, ".", "docs") });
  expect({
    status: [root.status, lazy.status],
    problemsError: [root.body.problemsError, lazy.body.problemsError],
    problems: [repo?.problems, repo?.children?.find((entry) => entry.label === "docs")?.problems],
    hasRepository: repo?.key === repoKey(repository.id, ".", "."),
  }).toEqual({ status: [200, 200], problemsError: [failure, failure], problems: [undefined, undefined], hasRepository: true });
});

it.each([
  ["page:missing", "Unknown navigation node"],
  ["nonsense", "Unknown navigation node"],
  ["page-item:solo", "has no children"],
  ["repo:bad", "Invalid repository navigation key"],
])("answers 400 for node key %s", async (node, message) => {
  const { get } = await fixture();
  const { status, body } = await get({ node });
  expect(status).toBe(400);
  expect(body.error).toContain(message);
});

it("answers 400 for an unknown repository, an unconfigured folder and a bad sidebar vocabulary", async () => {
  const { get, repository } = await fixture();
  expect((await get({ node: repoKey("99999999-9999-9999-9999-999999999999", ".", ".") })).status).toBe(400);
  expect((await get({ node: repoKey(repository.id, "nope", "nope") })).status).toBe(400);
  expect((await get({ sort: "alphabetical" })).body.error).toBe("Invalid sidebar sort: alphabetical");
  expect((await get({ filters: "open,stale" })).body.error).toBe("Invalid sidebar filter: stale");
  expect((await get({ age: "never" })).body.error).toBe("Invalid sidebar age: never");
  expect((await get({ active: "document:not-an-id" })).status).toBe(400);
});

it("propagates a Gavel failure instead of returning an empty directory", async () => {
  const { get, repository, failEntries } = await fixture();
  failEntries(503);
  const { status, body } = await get({ node: repoKey(repository.id, ".", "docs") });
  expect(status).toBe(503);
  expect(body.error).toBe("gavel down");
});

it("rejects non-GET requests with 405", async () => {
  const { post } = await fixture();
  const response = await post();
  expect(response.status).toBe(405);
  expect(response.headers.get("allow")).toBe("GET");
});
