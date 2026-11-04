// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addComment, addReply, patchComment, readPage } from "./comments-store";
import { commentsToMarkdown } from "../src/comments/markdown";
import { VOCABULARY_ITEMS } from "../src/vocabularies/catalog";
import { vocabularyHref } from "../../../packages/ui/src/comments/comment-vocabulary";
let dir: string;
const item = VOCABULARY_ITEMS.find(entry => entry.id === "box/header")!;
const body = `[${item.label}](${vocabularyHref(item)})`;
const author = { name: "Reviewer", kind: "user" } as const;
beforeEach(() => { mkdirSync(".tmp", { recursive: true }); dir = mkdtempSync(resolve(".tmp/vocabulary-")); });
afterEach(() => rmSync(dir, { recursive: true, force: true }));
describe("persisted vocabulary selections", () => {
  it("preserves root and reply definitions for exports and recomputes edited references", () => {
    addComment(dir, "welcome", { id: "root", body, author, createdAt: "2026-11-03" });
    addReply(dir, "root", { id: "reply", body, author, createdAt: "2026-11-03" });
    expect(readPage(dir, "welcome").map(comment => comment.vocabularyRefs)).toEqual([[item], [item]]);
    const markdown = commentsToMarkdown([{ page: "welcome", comments: readPage(dir, "welcome") }], { labels: {}, pageUrl: () => "http://localhost:5274/?page=welcome", pagePath: () => "welcome.tsx" });
    expect(markdown).toContain(`facet:box/header: ${item.description}`);
    expect(markdown.match(/facet:box\/header:/g)).toHaveLength(1);
    expect(markdown).toContain(item.references[0]);
    expect(patchComment(dir, "root", { body: "No selection" }).vocabularyRefs).toBeUndefined();
  });
  it("rejects unknown selections before storing a comment", () => {
    expect(() => addComment(dir, "welcome", { id: "bad", body: "[unknown](/?vocabulary=facet%3Aunknown)", author, createdAt: "2026-11-03" })).toThrow("Unknown vocabulary");
    expect(readPage(dir, "welcome")).toEqual([]);
  });
  it("registers unique identifiers and every existing family", () => {
    expect(new Set(VOCABULARY_ITEMS.map(entry => `${entry.catalog}:${entry.id}`)).size).toBe(VOCABULARY_ITEMS.length);
    const familiesOf = (catalog: string) => new Set(VOCABULARY_ITEMS.filter(entry => entry.catalog === catalog).map(entry => entry.type)).size;
    expect({ facet: familiesOf("facet"), oipa: familiesOf("oipa") }).toEqual({ facet: 33, oipa: 11 });
    expect(VOCABULARY_ITEMS.every(entry => entry.description && entry.references.length)).toBe(true);
  });
});
