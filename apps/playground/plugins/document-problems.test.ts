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
