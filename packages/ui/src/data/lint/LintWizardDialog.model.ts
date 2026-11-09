/** How a lint run checks the files: the project's configured linters, or an AI review prompt. */
export type LintWizardMethod = "linters" | "ai";

export type LintWizardStep = "method" | "configure" | "review";
export const LINT_WIZARD_STEPS: readonly LintWizardStep[] = ["method", "configure", "review"];

/** Everything the dialog collects; only the chosen method's fields reach the request. */
export type LintWizardDraft = {
  method: LintWizardMethod | null;
  linters: string[];
  fix: boolean;
  /** Comma-separated rule IDs or `source:rule` patterns, as typed. */
  exclude: string;
  prompt: string;
  /** Empty runs the model saved by `captain configure`. */
  model: string;
  aiFix: boolean;
  changed: boolean;
};

/**
 * What to run, mirroring `gavel lint` and `gavel lint prompt`. `linters` is
 * absent when every detected linter runs; `model` is absent for the saved default.
 */
export type LintWizardRequest =
  | { method: "linters"; paths: string[]; linters?: string[]; fix: boolean; exclude: string[]; changed: boolean }
  | { method: "ai"; paths: string[]; prompt: string; model?: string; aiFix: boolean; changed: boolean };

export function emptyLintWizardDraft(detectedLinters: readonly string[]): LintWizardDraft {
  return { method: null, linters: [...detectedLinters], fix: false, exclude: "", prompt: "", model: "", aiFix: false, changed: false };
}

/** Whether `step` has what it needs to move on (the review step is always ready). */
export function lintWizardStepReady(step: LintWizardStep, draft: LintWizardDraft): boolean {
  if (step === "method") return draft.method !== null;
  if (step === "configure") {
    if (draft.method === "linters") return draft.linters.length > 0;
    if (draft.method === "ai") return draft.prompt.trim() !== "";
    return false;
  }
  return true;
}

export function buildLintWizardRequest(
  draft: LintWizardDraft,
  paths: readonly string[],
  detectedLinters: readonly string[],
): LintWizardRequest {
  if (paths.length === 0) throw new Error("lint wizard: no paths to lint");
  if (draft.method === "linters") {
    if (draft.linters.length === 0) throw new Error("lint wizard: choose at least one linter");
    const all = detectedLinters.every((linter) => draft.linters.includes(linter));
    return {
      method: "linters",
      paths: [...paths],
      ...(all ? {} : { linters: [...draft.linters] }),
      fix: draft.fix,
      exclude: draft.exclude.split(",").map((rule) => rule.trim()).filter(Boolean),
      changed: draft.changed,
    };
  }
  if (draft.method === "ai") {
    const prompt = draft.prompt.trim();
    if (!prompt) throw new Error("lint wizard: choose a prompt for the AI review");
    const model = draft.model.trim();
    return { method: "ai", paths: [...paths], prompt, ...(model ? { model } : {}), aiFix: draft.aiFix, changed: draft.changed };
  }
  throw new Error("lint wizard: choose how to lint before building a request");
}

const shellWord = (word: string) => (/^[\w@%+=:,./-]+$/.test(word) ? word : `'${word.replace(/'/g, `'\\''`)}'`);

/** The `gavel` command line that runs `request`, shown on the review step. */
export function lintWizardCommand(request: LintWizardRequest): string {
  const words =
    request.method === "linters"
      ? [
          "gavel",
          "lint",
          ...(request.linters ? ["--linters", request.linters.join(",")] : []),
          ...(request.fix ? ["--fix"] : []),
          ...request.exclude.flatMap((rule) => ["--exclude", rule]),
          ...(request.changed ? ["--changed"] : []),
          ...request.paths,
        ]
      : [
          "gavel",
          "lint",
          "prompt",
          ...(request.aiFix ? ["--ai-fix"] : []),
          ...(request.changed ? ["--changed"] : []),
          request.prompt,
          ...request.paths,
          ...(request.model ? ["--", "--model", request.model] : []),
        ];
  return words.map(shellWord).join(" ");
}
