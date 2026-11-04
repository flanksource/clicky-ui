import { mkdtempSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RepositoryDocuments } from "./repository-documents";
import { authorizeDocumentDirectory } from "./repository-documents-server";
import { fixedGavel } from "./gavel-launch-server";

const temporary: string[] = [];
afterEach(() => {
  vi.unstubAllGlobals();
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});
describe("repository document identity", () => {
  it("does not let persisted sidebar preferences grant removed filesystem access", async () => {
    const dir = mkdtempSync(resolve(".tmp/repository-documents-"));
    temporary.push(dir);
    const repository = new RepositoryDocuments(dir).add({
      root: "/previously/enabled",
      name: "repo",
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: "Repository is outside enabled roots" }),
            { status: 422 },
          ),
        ),
    );
    await expect(
      authorizeDocumentDirectory({
        dir,
        endpoint: fixedGavel("http://localhost:9330"),
        page: `document:${repository.id}/guide.md`,
      }),
    ).rejects.toThrow("outside enabled roots");
  });
  it("retains worktree identity and folder preferences across reloads", () => {
    const dir = mkdtempSync(resolve(".tmp/repository-documents-"));
    temporary.push(dir);
    const store = new RepositoryDocuments(dir);
    const first = store.add({ root: "/enabled/repo", name: "repo" });
    store.folder(first.id, {
      path: "docs",
      overrides: ["*.draft.md", "!approved.draft.md"],
    });
    const reopened = new RepositoryDocuments(dir);
    expect(reopened.add({ root: first.root, name: first.name })).toEqual(
      reopened.all()[0],
    );
    expect(reopened.document(`document:${first.id}/docs/guide.md`)).toEqual({
      repository: reopened.all()[0],
      path: "docs/guide.md",
      absolutePath: "/enabled/repo/docs/guide.md",
    });
  });
  it("rejects traversal and unknown document identities", () => {
    const dir = mkdtempSync(resolve(".tmp/repository-documents-"));
    temporary.push(dir);
    const store = new RepositoryDocuments(dir);
    const repo = store.add({ root: "/enabled/repo", name: "repo" });
    for (const path of [
      "../secret.md",
      "a/../../secret.md",
      ".git/config",
      "a\\secret.md",
      "a//b.md",
    ]) {
      expect(() => store.document(`document:${repo.id}/${path}`)).toThrow();
    }
    expect(() => store.document("document:unknown/guide.md")).toThrow();
  });
});
