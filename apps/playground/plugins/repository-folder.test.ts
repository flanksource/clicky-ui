// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "vite";
import { RepositoryDocuments } from "./repository-documents";
import { createPromptRuns } from "./prompt-runs-server";
import { PromptAssociations } from "./prompt-associations";
import { readAll } from "./comments-store";
import { StubCaptain } from "./testing/stub-captain";
import { prepareRepositoryFolder } from "./repository-folder";
import { fixedGavel } from "./gavel-launch-server";

const temporary: string[] = [];
afterEach(() => {
  vi.unstubAllGlobals();
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

describe("repository folder prompt lint", () => {
  it("rejects folder traversal and folders without visible Markdown files", async () => {
    mkdirSync(resolve(".tmp"), { recursive: true });
    const dir = mkdtempSync(resolve(".tmp/folder-lint-"));
    temporary.push(dir);
    const store = new RepositoryDocuments(dir);
    const repo = store.add({ root: "/enabled/repo", name: "repo" });
    for (const path of [
      "../other",
      "a/../../other",
      ".git",
      "a\\b",
      "a//b",
      "a\0b",
    ])
      expect(() => store.document(`folder:${repo.id}/${path}`)).toThrow();
    expect(store.document(`folder:${repo.id}/.`).path).toBe(".");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("[]", {
            headers: { "Content-Type": "application/json" },
          }),
        ),
    );
    await expect(
      prepareRepositoryFolder({
        dir,
        endpoint: fixedGavel("http://localhost:9330"),
        page: `folder:${repo.id}/.`,
      }),
    ).rejects.toThrow("no visible Markdown files");
  });
  it("prepares visible Markdown descendants, scopes the launch, and retains per-file findings after restart", async () => {
    mkdirSync(resolve(".tmp"), { recursive: true });
    const dir = mkdtempSync(resolve(".tmp/folder-lint-"));
    temporary.push(dir);
    const repository = new RepositoryDocuments(dir).add({
      root: "/enabled/repo",
      name: "repo",
    });
    const page = `folder:${repository.id}/docs`;
    new RepositoryDocuments(dir).folder(repository.id, {
      path: "docs",
      overrides: ["*.draft.md", "!public.draft.md"],
    });
    const captain = new StubCaptain();
    captain.prompts = [
      {
        id: "clarity",
        name: "clarity",
        version: "v1",
        content: "Review {{files}}",
      },
    ];
    const gavelURL = await captain.listen();
    const realFetch = globalThis.fetch;
    let revision = "original";
    const listings: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = new URL(String(input));
        if (!url.pathname.startsWith("/api/workspace/"))
          return realFetch(input, init);
        let value: unknown;
        if (url.pathname.endsWith("/entries")) {
          const body = JSON.parse(String(init?.body)) as {
            path: string;
            includeIgnored?: boolean;
          };
          expect(body).toMatchObject({
            root: repository.root,
            overrideDirectory: "docs",
            overrides: ["*.draft.md", "!public.draft.md"],
          });
          expect(body.includeIgnored).not.toBe(true);
          listings.push(body.path);
          value =
            body.path === "docs"
              ? [
                  {
                    path: "docs/guide.md",
                    name: "guide.md",
                    directory: false,
                    visible: true,
                  },
                  {
                    path: "docs/nested",
                    name: "nested",
                    directory: true,
                    visible: true,
                  },
                  {
                    path: "docs/hidden.md",
                    name: "hidden.md",
                    directory: false,
                    visible: false,
                  },
                ]
              : [
                  {
                    path: "docs/nested/setup.mdx",
                    name: "setup.mdx",
                    directory: false,
                    visible: true,
                  },
                ];
        } else if (url.pathname.endsWith("/file")) value = { revision };
        else value = { root: repository.root };
        return new Response(JSON.stringify(value), {
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
    const runs = createPromptRuns({ dir, gavelURL, workspace: "/playground" });
    try {
      const detail = await runs.prompt("clarity", page);
      expect(detail).toMatchObject({
        files: ["docs/guide.md", "docs/nested/setup.mdx"],
      });
      expect(listings).toEqual(["docs", "docs/nested"]);
      const request = {
        promptId: "clarity",
        promptVersion: "v1",
        preparationId: detail.preparationId,
        associationId: crypto.randomUUID(),
        variables: { input: "Check clarity" },
        presets: ["lint"],
        spec: { model: "example/model" },
        page,
        anchor: "document",
        element: {
          source: "/enabled/repo/docs",
          html: "<section>docs</section>",
        },
        author: { name: "Reviewer", kind: "user" },
      };
      revision = "changed";
      await expect(
        runs.start(request, "http://localhost", createLogger("silent")),
      ).rejects.toThrow(/changed/i);
      expect(captain.callsTo("POST", /^\/api\/launch\/lint$/)).toHaveLength(0);
      revision = "original";
      const violations = [
        {
          file: "/enabled/repo/docs/nested/setup.mdx",
          line: 2,
          message: "Use active voice",
          severity: "warning",
        },
      ];
      captain.nextSummary = {
        event: "done",
        data: { success: true, structuredOutput: { violations } },
      };
      await runs.start(request, "http://localhost", createLogger("silent"));
      expect(
        captain.callsTo("POST", /^\/api\/launch\/prepare$/)[0]?.body,
      ).toEqual({ workspace: { cwd: repository.root } });
      expect(
        captain.callsTo("POST", /^\/api\/launch\/lint$/)[0]?.body,
      ).toMatchObject({
        config: {
          lint: {
            files: ["docs/guide.md", "docs/nested/setup.mdx"],
            linters: [{ options: { variables: { input: "Check clarity" } } }],
          },
        },
      });
      await vi.waitFor(() =>
        expect(new PromptAssociations(dir).all()[0]?.state).toBe("done"),
      );
      const restored = createPromptRuns({
        dir,
        gavelURL,
        workspace: "/playground",
      });
      const problems = await restored.problems();
      expect(
        problems[
          `document:${repository.id}/docs/nested/setup.mdx`
        ]?.prompt.flatMap((result) => result.violations ?? []),
      ).toMatchObject([{ message: "Use active voice" }]);
      expect(
        readAll(dir)[`document:${repository.id}/docs/nested/setup.mdx`],
      ).toHaveLength(1);
      expect(readAll(dir)[page]).toBeUndefined();
    } finally {
      await captain.close();
    }
  });
});
