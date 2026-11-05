import { configureTestComments } from "./testing/comments-store";
// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
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
    resolve(directory, "vocabs/shapes/catalog.ts"),
    `export default ${JSON.stringify(value)};`,
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
  writeFileSync(
    resolve(directory, "vocabs/shapes/Preview.tsx"),
    "import { label } from './specimen'; export default function Preview() { return <span>{label}</span>; }",
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
    { id: "shapes", preview: expect.stringContaining("vocabVersion=") },
  ]);
  const preview = await fetch(origin + snapshot.catalogs[0].preview);
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
    name: "wrong namespace",
    entries: [{ ...item, catalog: "other" }],
    error: "directory name",
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
    resolve(directory, "vocabs/colors/catalog.ts"),
    `export const colors = ${JSON.stringify([{ ...item, catalog: "colors", type: "color", id: "color/accent" }])};`,
  );
  writeFileSync(
    resolve(directory, "vocabs/colors/Preview.tsx"),
    "export default function Preview() { return <span>Accent</span>; }",
  );
  const next = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  expect(next.revision).not.toBe(first.revision);
  expect(next.items.map((entry: typeof item) => entry.description)).toContain(
    "Updated decision guidance",
  );
  expect(next.catalogs.map((entry: { id: string }) => entry.id)).toEqual([
    "colors",
    "shapes",
  ]);
  expect(
    next.catalogs.find((entry: { id: string }) => entry.id === "shapes")
      .preview,
  ).not.toBe(first.catalogs[0].preview);
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
  const preview = await (await fetch(origin + next.catalogs[0].preview)).text();
  const helper = preview.match(/"([^"\n]*specimen\.ts\?vocabVersion=[^"\n]*)"/);
  expect(helper).not.toBeNull();
  expect(await (await fetch(origin + helper![1])).text()).toContain(
    "Revised decision preview",
  );
  mkdirSync(resolve(directory, "vocabs/colors"));
  writeFileSync(
    resolve(directory, "vocabs/colors/catalog.ts"),
    `export default ${JSON.stringify([{ ...item, catalog: "colors" }])};`,
  );
  writeFileSync(
    resolve(directory, "vocabs/colors/Preview.tsx"),
    "export default function Preview() { return null; }",
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
    resolve(directory, "vocabs/shapes/Preview.tsx"),
    "import label from './label.txt?raw'; export default function Preview() { return <span>{label}</span>; }",
  );
  const first = await (
    await fetch(`${origin}/__playground/vocabularies`)
  ).json();
  const preview = await (
    await fetch(origin + first.catalogs[0].preview)
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
