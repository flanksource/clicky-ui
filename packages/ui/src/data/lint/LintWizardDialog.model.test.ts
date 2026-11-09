import { describe, expect, it } from "vitest";
import {
  buildLintWizardRequest,
  emptyLintWizardDraft,
  lintWizardCommand,
  lintWizardStepReady,
  type LintWizardDraft,
} from "./LintWizardDialog.model";

const DETECTED = ["golangci-lint", "eslint", "markdownlint"];
const PATHS = ["products/schemas"];
const draft = (patch: Partial<LintWizardDraft>): LintWizardDraft => ({ ...emptyLintWizardDraft(DETECTED), ...patch });

describe("lint wizard model", () => {
  it("starts with no method chosen and every detected linter selected", () => {
    expect(emptyLintWizardDraft(DETECTED)).toEqual({
      method: null,
      linters: DETECTED,
      fix: false,
      exclude: "",
      prompt: "",
      model: "",
      aiFix: false,
      changed: false,
    });
  });

  it.each([
    ["no method", draft({}), [false, false]],
    ["linters with none selected", draft({ method: "linters", linters: [] }), [true, false]],
    ["linters with one selected", draft({ method: "linters", linters: ["eslint"] }), [true, true]],
    ["AI review without a prompt", draft({ method: "ai" }), [true, false]],
    ["AI review with a prompt", draft({ method: "ai", prompt: "review.prompt" }), [true, true]],
  ] as const)("readiness of the method and configure steps with %s", (_, input, expected) => {
    expect([lintWizardStepReady("method", input), lintWizardStepReady("configure", input)]).toEqual(expected);
  });

  it("builds a linters request that runs every detected linter when all are selected, and splits excludes", () => {
    expect(
      buildLintWizardRequest(draft({ method: "linters", fix: true, exclude: "MD013, eslint:no-console ,", changed: true }), PATHS, DETECTED),
    ).toEqual({ method: "linters", paths: PATHS, fix: true, exclude: ["MD013", "eslint:no-console"], changed: true });
  });

  it("names the linters in the request only when a subset is selected", () => {
    expect(buildLintWizardRequest(draft({ method: "linters", linters: ["eslint"] }), PATHS, DETECTED)).toEqual({
      method: "linters",
      paths: PATHS,
      linters: ["eslint"],
      fix: false,
      exclude: [],
      changed: false,
    });
  });

  it("builds an AI review request, leaving the model to the saved default when none is picked", () => {
    expect([
      buildLintWizardRequest(draft({ method: "ai", prompt: "review.prompt", aiFix: true }), PATHS, DETECTED),
      buildLintWizardRequest(draft({ method: "ai", prompt: "review.prompt", model: "agent:sonnet" }), PATHS, DETECTED),
    ]).toEqual([
      { method: "ai", paths: PATHS, prompt: "review.prompt", aiFix: true, changed: false },
      { method: "ai", paths: PATHS, prompt: "review.prompt", model: "agent:sonnet", aiFix: false, changed: false },
    ]);
  });

  it("refuses to build a request for a draft whose configure step is not ready", () => {
    expect(() => buildLintWizardRequest(draft({ method: "ai" }), PATHS, DETECTED)).toThrow(/choose a prompt/);
  });

  it.each([
    [
      "every linter",
      { method: "linters" as const, paths: ["products/schemas"], fix: false, exclude: [], changed: false },
      "gavel lint products/schemas",
    ],
    [
      "a subset with fix, excludes and changed files",
      { method: "linters" as const, paths: ["my docs"], linters: ["eslint", "markdownlint"], fix: true, exclude: ["MD013"], changed: true },
      "gavel lint --linters eslint,markdownlint --fix --exclude MD013 --changed 'my docs'",
    ],
    [
      "an AI review with fix and a model",
      { method: "ai" as const, paths: ["products/schemas"], prompt: "review.prompt", model: "agent:sonnet", aiFix: true, changed: true },
      "gavel lint prompt --ai-fix --changed review.prompt products/schemas -- --model agent:sonnet",
    ],
  ])("previews %s as the equivalent gavel command", (_, request, command) => {
    expect(lintWizardCommand(request)).toBe(command);
  });
});
