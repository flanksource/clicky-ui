// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addComment,
  addReply,
  patchComment,
  readPage,
} from "./testing/comments-store";
import { commentsToMarkdown } from "../src/comments/markdown";
import { directoryVocabulary } from "./vocabulary-directories";
import { instructions, registerCommentVocabulary } from "./vocabulary-registry";
import { vocabularyHref } from "../../../packages/ui/src/comments/comment-vocabulary";
let dir: string;
const item = { catalog: "shapes", type: "shape", id: "box/header", label: "Header", description: "Names a box", references: ["docs/shapes.md"] };
const body = `[${item.label}](${vocabularyHref(item)})`;
const author = { name: "Reviewer", kind: "user" } as const;
let dispose: () => void;
beforeEach(async () => {
  mkdirSync(".tmp", { recursive: true });
  dir = realpathSync(mkdtempSync(resolve(".tmp/vocabulary-")));
  writeFileSync(resolve(dir, "shapes.tsx"), `export const vocabulary = {alias:'shapes',instructions:'Read shapes as diagram parts.',items:${JSON.stringify([item])}}; export default () => null;`);
  const registry = directoryVocabulary({ roots: [dir], sourceRoots: [{ directory: dir, url: "/fixtures/" }] });
  await registry.refresh();
  dispose = registerCommentVocabulary(dir, registry);
});
afterEach(() => { dispose?.(); rmSync(dir, { recursive: true, force: true }); });
describe("persisted vocabulary selections", () => {
  it("preserves root and reply definitions for exports and recomputes edited references", async () => {
    await addComment(dir, "welcome", {
      id: "root",
      body,
      author,
      createdAt: "2026-11-03",
    });
    await addReply(dir, "root", {
      id: "reply",
      body,
      author,
      createdAt: "2026-11-03",
    });
    expect(
      (await readPage(dir, "welcome")).map((comment) => comment.vocabularyRefs),
    ).toEqual([[item], [item]]);
    const options = {
      labels: {},
      vocabularyInstructions: { shapes: instructions("shapes") },
      pageUrl: () => "http://localhost:5274/?page=welcome",
      pagePath: () => "welcome.tsx",
    };
    const markdown = commentsToMarkdown(
      [{ page: "welcome", comments: await readPage(dir, "welcome") }],
      options,
    );
    expect(markdown).toContain(`shapes:box/header: ${item.description}`);
    expect(markdown.match(/shapes:box\/header:/g)).toHaveLength(1);
    expect(markdown).toContain(item.references[0]);
    expect(
      (await patchComment(dir, "root", { body: "No selection" }))
        .vocabularyRefs,
    ).toBeUndefined();
  });
  it("rejects unknown selections before storing a comment", async () => {
    await expect(
      addComment(dir, "welcome", {
                id: "bad",
                body: "[unknown](/?vocabulary=shapes%3Aunknown)",
                author,
                createdAt: "2026-11-03",
              }),
    ).rejects.toThrow("Unknown vocabulary");
    expect(await readPage(dir, "welcome")).toEqual([]);
  });
  it("rejects unknown instruction aliases", () => {
    expect(() => instructions("unknown")).toThrow("Unknown vocabulary alias unknown");
  });
});
