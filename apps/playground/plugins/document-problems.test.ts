// @vitest-environment node
import { describe, expect, it } from "vitest";
import { documentProblems } from "./document-problems";
import type { PromptAssociation } from "./prompt-associations";

const repository = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "repo",
  root: "/enabled/repo",
  folders: [{ path: ".", overrides: [] }],
};
const document = `document:${repository.id}/docs/guide.md`;
function prompt(overrides: Partial<PromptAssociation>): PromptAssociation {
  return {
    associationId: crypto.randomUUID(),
    workspace: repository.root,
    origin: "http://localhost",
    requestedBy: { name: "Reviewer", kind: "user" },
    runId: "review",
    promptId: "clarity",
    promptName: "Clarity",
    page: `folder:${repository.id}/docs`,
    anchor: "document",
    state: "done",
    startedAt: "2026-01-01T00:00:00Z",
    files: ["docs/guide.md", "docs/nested/setup.md"],
    results: [
      {
        linter: "clarity",
        success: true,
        violations: [
          { file: "/enabled/repo/docs/guide.md", message: "Use active voice" },
        ],
      },
    ],
    ...overrides,
  };
}

describe("document problem projections", () => {
  it.each([undefined, "[]", '["docs-other/guide.md"]', '["../outside.md"]'])(
    "rejects invalid folder execution file scope %s",
    (files) => {
      expect(() =>
        documentProblems({
          repositories: [repository],
          prompts: [],
          plain: [
            {
              metadata: {
                executionId: "invalid-scope",
                labels: {
                  page: `folder:${repository.id}/docs`,
                  ...(files ? { files } : {}),
                },
              },
              status: { state: "completed", running: false },
              lint: [{ linter: "markdownlint", violations: [] }],
            },
          ],
        }),
      ).toThrow();
    },
  );
  it("keeps newer file results when projecting an older repository-wide run", () => {
    const sibling = `document:${repository.id}/other/guide.md`;
    const result = documentProblems({
      repositories: [repository],
      prompts: [],
      plain: [
        {
          metadata: { executionId: "new-file", labels: { page: document } },
          status: { state: "completed", running: false },
          lint: [
            {
              linter: "vale",
              violations: [{ file: "docs/guide.md", message: "New issue" }],
            },
          ],
        },
        {
          metadata: {
            executionId: "old-root",
            labels: {
              page: `folder:${repository.id}/.`,
              files: JSON.stringify(["docs/guide.md", "other/guide.md"]),
            },
          },
          status: { state: "completed", running: false },
          lint: [
            {
              linter: "markdownlint",
              work_dir: repository.root,
              violations: [
                { file: "docs/guide.md", message: "Old issue" },
                { file: "other/guide.md", message: "Other issue" },
              ],
            },
          ],
        },
      ],
    });
    expect(
      Object.fromEntries(
        Object.entries(result).map(([id, entry]) => [
          id,
          entry.plain.flatMap((lint) => lint.violations ?? []),
        ]),
      ),
    ).toEqual({
      [document]: [{ file: "docs/guide.md", message: "New issue" }],
      [sibling]: [{ file: "other/guide.md", message: "Other issue" }],
    });
  });
  it("projects folder lint onto descendants and replaces older file findings including clean results", () => {
    const nested = `document:${repository.id}/docs/nested/setup.md`;
    const sibling = `document:${repository.id}/docs-other/guide.md`;
    const result = documentProblems({
      repositories: [repository],
      prompts: [],
      plain: [
        {
          metadata: {
            executionId: "folder",
            labels: {
              page: `folder:${repository.id}/docs`,
              files: JSON.stringify(["docs/guide.md", "docs/nested/setup.md"]),
            },
          },
          status: { state: "completed", running: false },
          lint: [
            {
              linter: "markdownlint",
              work_dir: repository.root,
              violations: [
                { file: "docs/nested/setup.md", message: "Nested issue" },
              ],
            },
          ],
        },
        {
          metadata: { executionId: "old", labels: { page: document } },
          status: { state: "completed", running: false },
          lint: [
            {
              linter: "markdownlint",
              violations: [{ file: "docs/guide.md", message: "Old issue" }],
            },
          ],
        },
        {
          metadata: { executionId: "sibling", labels: { page: sibling } },
          status: { state: "completed", running: false },
          lint: [
            {
              linter: "vale",
              violations: [
                { file: "docs-other/guide.md", message: "Sibling issue" },
              ],
            },
          ],
        },
      ],
    });
    expect(
      Object.fromEntries(
        Object.entries(result).map(([id, entry]) => [
          id,
          entry.plain.flatMap((lint) => lint.violations ?? []),
        ]),
      ),
    ).toEqual({
      [document]: [],
      [nested]: [{ file: "docs/nested/setup.md", message: "Nested issue" }],
      [sibling]: [{ file: "docs-other/guide.md", message: "Sibling issue" }],
    });
  });
  it("replaces overlapping results per prompt and file, clears clean reruns, and retains other linters", () => {
    const clean = prompt({
      page: document,
      state: "empty",
      startedAt: "2026-01-02T00:00:00Z",
      results: [{ linter: "clarity", success: true, violations: [] }],
    });
    delete clean.files;
    const result = documentProblems({
      repositories: [repository],
      prompts: [
        prompt({}),
        clean,
        prompt({
          promptId: "structure",
          promptName: "Structure",
          results: [
            {
              linter: "structure",
              success: true,
              violations: [
                { file: "docs/guide.md", message: "Missing heading" },
              ],
            },
          ],
        }),
      ],
      plain: [
        {
          metadata: { executionId: "new", labels: { page: document } },
          status: { state: "completed", running: false },
          lint: [{ linter: "markdownlint", violations: [] }],
        },
        {
          metadata: { executionId: "old", labels: { page: document } },
          status: { state: "completed", running: false },
          lint: [
            {
              linter: "markdownlint",
              violations: [{ file: "docs/guide.md", message: "Old issue" }],
            },
          ],
        },
      ],
    });
    expect(result[document]).toEqual({
      prompt: [
        {
          linter: "structure",
          work_dir: repository.root,
          success: true,
          violations: [{ file: "docs/guide.md", message: "Missing heading" }],
        },
      ],
      plain: [{ linter: "markdownlint", violations: [] }],
    });
  });

  it("keeps previous results while a run is running or fails before producing findings", () => {
    const running = prompt({
      state: "running",
      startedAt: "2026-01-03T00:00:00Z",
    });
    const failed = prompt({
      state: "failed",
      startedAt: "2026-01-02T00:00:00Z",
    });
    delete running.results;
    delete failed.results;
    const result = documentProblems({
      repositories: [repository],
      prompts: [prompt({}), running, failed],
      plain: [],
    });
    expect(
      result[document]?.prompt.flatMap((lint) => lint.violations ?? []),
    ).toMatchObject([{ message: "Use active voice" }]);
  });
});
