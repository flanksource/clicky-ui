import { configureTestComments } from "./testing/comments-store";
// @vitest-environment node
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { vocabularyPageFile } from "./vocabulary-registry";
import { sessionScopeDirectory } from "./session-scope";
import { afterEach, beforeEach, expect, it } from "vitest";
import { createServer, type ViteDevServer } from "vite";
import { playgroundVocabularies } from "./vocabularies-server";
import { playgroundComments } from "./comments-server";
import { readPage } from "./testing/comments-store";

let directory: string;
let server: ViteDevServer;
let origin: string;
const item = {
  catalog: "shapes",
  type: "shape",
  id: "shape/decision",
  label: "Decision",
  description: "A branching decision",
  references: ["docs/shapes.md#decision"],
  variant: "diamond",
};

function catalog(value: unknown = [item]) {
  writeFileSync(
    resolve(directory, "vocabs/shapes/index.tsx"),
    `import { label } from './specimen'; export const vocabulary = {alias:'shapes', instructions:'Read shapes as geometry.', items:${JSON.stringify(value)}}; export default function Shapes() { return <span>{label}</span>; }`,
  );
}
beforeEach(async () => {
  mkdirSync(".tmp", { recursive: true });
  directory = mkdtempSync(resolve(".tmp/runtime-vocabulary-"));
  configureTestComments(directory);
  mkdirSync(resolve(directory, "vocabs/shapes"), { recursive: true });
  catalog();
  writeFileSync(
    resolve(directory, "vocabs/shapes/specimen.ts"),
    "export const label = 'Decision preview';",
  );
  server = await createServer({
    configFile: false,
    plugins: [
      playgroundVocabularies({
        dir: directory,
        roots: [resolve(directory, "vocabs")],
      }),
      playgroundComments({ dir: directory }),
    ],
    server: { host: "127.0.0.1", port: 0 },
    optimizeDeps: { noDiscovery: true },
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === "string")
    throw new Error("Missing vocabulary test server address");
  origin = `http://127.0.0.1:${address.port}`;
});
afterEach(async () => {
  await server?.close();
  if (directory) rmSync(directory, { recursive: true, force: true });
});

it("loads a directory into the picker API and resolves the same server-owned definitions on writes", async () => {
  const response = await fetch(`${origin}/__playground/vocabularies`);
  const snapshot = await response.json();
  expect(response.status).toBe(200);
  expect(snapshot.items).toEqual([item]);
  expect(snapshot.catalogs).toEqual([
    { alias: "shapes", slug: "vocabularies/shapes", file: "vocabs/shapes/index.tsx", instructions: "Read shapes as geometry.", page: expect.stringContaining("vocabVersion="), previewRevision: expect.stringMatching(/^[a-f0-9]{20}$/) },
  ]);
  const preview = await fetch(origin + snapshot.catalogs[0].page);
  expect(preview.status).toBe(200);
  expect(await preview.text()).toMatch(/specimen\.ts\?vocabVersion=/);
  const posted = await fetch(`${origin}/__playground/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page: "welcome",
      body: "[Decision](/?vocabulary=shapes%3Ashape%2Fdecision)",
      author: { name: "Reviewer", kind: "user" },
      element: { source: "welcome.tsx", html: "<p>Welcome</p>" },
    }),
  });
  expect(posted.status).toBe(201);
  expect((await readPage(directory, "welcome"))[0]?.vocabularyRefs).toEqual([
    item,
  ]);
});

it.each([
  {
    name: "duplicate identifiers",
    entries: [item, item],
    error: "Duplicate vocabulary item",
  },
  {
    name: "missing references",
    entries: [{ ...item, references: [] }],
    error: "references",
  },
  {
    name: "missing description",
    entries: [{ ...item, description: "" }],
    error: "description",
  },
])("rejects $name", async ({ entries, error }) => {
  catalog(entries);
  const response = await fetch(`${origin}/__playground/vocabularies`);
  expect(response.status).toBe(500);
  expect((await response.json()).error).toContain(error);
});

it("discovers new folders and refreshes metadata and preview revisions without restarting", async () => {
  const first = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  catalog([{ ...item, description: "Updated decision guidance" }]);
  mkdirSync(resolve(directory, "vocabs/colors"));
  writeFileSync(
    resolve(directory, "vocabs/colors/index.tsx"),
    `export const vocabulary = {alias:'colors',instructions:'Read colors',items:${JSON.stringify([{ ...item, type: "color", id: "color/accent" }])}}; export default () => null;`,
  );
  const next = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  expect(next.revision).not.toBe(first.revision);
  expect(next.items.map((entry: typeof item) => entry.description)).toContain(
    "Updated decision guidance",
  );
  expect(next.catalogs.map((entry: { alias: string }) => entry.alias)).toEqual([
    "colors",
    "shapes",
  ]);
  expect(
    next.catalogs.find((entry: { alias: string }) => entry.alias === "shapes")
      .page,
  ).not.toBe(first.catalogs[0].page);
});

it("refreshes preview helpers and removes deleted catalogs without restarting", async () => {
  const first = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  writeFileSync(
    resolve(directory, "vocabs/shapes/specimen.ts"),
    "export const label = 'Revised decision preview';",
  );
  const next = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  expect(next.revision).not.toBe(first.revision);
  const preview = await (await fetch(origin + next.catalogs[0].page)).text();
  const helper = preview.match(/"([^"\n]*specimen\.ts\?vocabVersion=[^"\n]*)"/);
  expect(helper).not.toBeNull();
  expect(await (await fetch(origin + helper![1])).text()).toContain(
    "Revised decision preview",
  );
  mkdirSync(resolve(directory, "vocabs/colors"));
  writeFileSync(
    resolve(directory, "vocabs/colors/index.tsx"),
    `export const vocabulary = {alias:'colors', instructions:'Read colors', items:${JSON.stringify([item])}}; export default () => null;`,
  );
  await fetch(`${origin}/__playground/vocabularies`);
  rmSync(resolve(directory, "vocabs/shapes"), { recursive: true });
  const removed = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  expect(removed.items).toEqual([{ ...item, catalog: "colors" }]);
});

it("preserves raw asset imports and refreshes previews when their content changes", async () => {
  writeFileSync(
    resolve(directory, "vocabs/shapes/label.txt"),
    "Decision guidance",
  );
  writeFileSync(
    resolve(directory, "vocabs/shapes/index.tsx"),
    `import label from './label.txt?raw'; export const vocabulary = {alias:'shapes',instructions:'Read shapes',items:${JSON.stringify([item])}}; export default () => <span>{label}</span>;`,
  );
  const first = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  const preview = await (
    await fetch(origin + first.catalogs[0].page)
  ).text();
  const asset = preview.match(/"([^"\n]*label\.txt\?[^"\n]*)"/);
  expect(asset).not.toBeNull();
  expect(new URL(asset![1]!, origin).searchParams.has("raw")).toBe(true);
  expect(await (await fetch(origin + asset![1])).text()).toContain(
    "Decision guidance",
  );
  writeFileSync(
    resolve(directory, "vocabs/shapes/label.txt"),
    "Updated guidance",
  );
  const next = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  expect(next.revision).not.toBe(first.revision);
});

it("resolves a vocabulary page slug to its file in the vocabulary root for session scoping", async () => {
  await fetch(`${origin}/__playground/vocabularies`);
  const file = realpathSync(resolve(directory, "vocabs/shapes/index.tsx"));
  expect([vocabularyPageFile("vocabularies/shapes"), sessionScopeDirectory({ page: "vocabularies/shapes", dir: directory, cwd: directory })]).toEqual([file, dirname(file)]);
  expect(() => vocabularyPageFile("vocabularies/missing")).toThrow("Unknown vocabulary page vocabularies/missing");
});

it("serves versioned JSON imports as JavaScript modules", async () => {
  writeFileSync(resolve(directory, "vocabs/shapes/sizes.json"), JSON.stringify({ a4: [210, 297] }));
  writeFileSync(
    resolve(directory, "vocabs/shapes/index.tsx"),
    `import sizes from './sizes.json'; export const vocabulary = {alias:'shapes',instructions:'Read shapes',items:${JSON.stringify([item])}}; export default () => <span>{sizes.a4[0]}</span>;`,
  );
  const snapshot = await (await fetch(`${origin}/__playground/vocabularies`)).json();
  const preview = await (await fetch(origin + snapshot.catalogs[0].page)).text();
  const json = preview.match(/"([^"\n]*sizes\.json\?[^"\n]*)"/);
  expect(json?.[1]).toContain("vocabVersion=");
  expect(await (await fetch(origin + json![1])).text()).toMatch(/export default/);
});

it("rejects malformed definitions and blocks comment writes instead of using a stale catalog", async () => {
  await fetch(`${origin}/__playground/vocabularies`);
  catalog([{ ...item, description: "" }]);
  const response = await fetch(`${origin}/__playground/vocabularies`);
  expect(response.status).toBe(500);
  expect((await response.json()).error).toContain("description");
  const posted = await fetch(`${origin}/__playground/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page: "welcome",
      body: "No stale writes",
      author: { name: "Reviewer", kind: "user" },
    }),
  });
  expect(posted.status).toBe(500);
  expect(await readPage(directory, "welcome")).toEqual([]);
  catalog();
  const recovered = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  expect(recovered.items).toEqual([item]);
});
