// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RepositoryDocuments } from "./repository-documents";
import { repositoryPromptDirectory } from "./repository-prompt-directory";
import { fixedGavel } from "./gavel-launch-server";

const temporary: string[] = [];
afterEach(() => {
  vi.unstubAllGlobals();
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

describe("repository prompt directory", () => {
  it.each(["document", "folder"])(
    "uses the nearest ancestor prompt project for a %s target",
    async (kind) => {
      mkdirSync(resolve(".tmp"), { recursive: true });
      const dir = mkdtempSync(resolve(".tmp/prompt-directory-"));
      temporary.push(dir);
      const root = "/enabled/repo";
      const project = `${root}/shared/architecture`;
      const repo = new RepositoryDocuments(dir).add({ root, name: "repo" });
      const visited: string[] = [];
      vi.stubGlobal(
        "fetch",
        vi.fn(async (input: URL) => {
          const path = input.searchParams.get("path")!;
          visited.push(path);
          const children =
            path === project
              ? [
                  {
                    path: `${project}/.captain`,
                    name: ".captain",
                    directory: true,
                  },
                ]
              : path === `${project}/.captain`
                ? [
                    {
                      path: `${project}/.captain/prompts`,
                      name: "prompts",
                      directory: true,
                    },
                  ]
                : [];
          return new Response(JSON.stringify(children));
        }),
      );
      expect(
        await repositoryPromptDirectory({
          dir,
          endpoint: fixedGavel("http://localhost:9330"),
          page: `${kind}:${repo.id}/shared/architecture/slides${kind === "document" ? "/solution.mdx" : ""}`,
        }),
      ).toBe(project);
      expect(visited).toEqual([
        `${project}/slides`,
        project,
        `${project}/.captain`,
      ]);
    },
  );

  it("keeps the target directory when no project prompt directory exists and stops at the repository root", async () => {
    mkdirSync(resolve(".tmp"), { recursive: true });
    const dir = mkdtempSync(resolve(".tmp/prompt-directory-"));
    temporary.push(dir);
    const root = "/enabled/repo";
    const repo = new RepositoryDocuments(dir).add({ root, name: "repo" });
    const fetch = vi.fn().mockImplementation(async () => new Response("[]"));
    vi.stubGlobal("fetch", fetch);
    expect(
      await repositoryPromptDirectory({
        dir,
        endpoint: fixedGavel("http://localhost:9330"),
        page: `document:${repo.id}/docs/guide.md`,
      }),
    ).toBe(`${root}/docs`);
    expect(
      fetch.mock.calls.map(([url]) => (url as URL).searchParams.get("path")),
    ).toEqual([`${root}/docs`, root]);
  });
});
