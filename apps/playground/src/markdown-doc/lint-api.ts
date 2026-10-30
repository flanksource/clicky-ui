import { useCallback, useEffect, useState } from "react";
import type { LinterResult } from "@flanksource/clicky-ui";

import type { LintMode } from "../../plugins/gavel-lint-server";

export const LINT_ROUTE = "/__playground/lint";

export type { LintMode };

/** Runs gavel against a markdown page's file on disk; rejects with gavel's own error text. */
export async function runLint(slug: string, mode: LintMode): Promise<LinterResult[]> {
  const response = await fetch(LINT_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, mode }),
  });
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error("Linting only works under `vite dev`; the playground-gavel-lint middleware is not part of the build.");
  }
  const payload = (await response.json()) as { results?: LinterResult[]; error?: string };
  if (!response.ok || !payload.results) {
    throw new Error(payload.error ?? `POST ${LINT_ROUTE} failed (${response.status})`);
  }
  return payload.results;
}

export type LintRun =
  | { status: "idle" }
  | { status: "running"; previous?: LinterResult[] }
  | { status: "done"; results: LinterResult[] }
  | { status: "error"; error: string; previous?: LinterResult[] };

const IDLE: Record<LintMode, LintRun> = { lint: { status: "idle" }, prompt: { status: "idle" } };

function resultsOf(run: LintRun): LinterResult[] {
  if (run.status === "done") return run.results;
  if (run.status === "running" || run.status === "error") return run.previous ?? [];
  return [];
}

/**
 * The latest lint and AI-review results for one page, kept per mode so a new
 * run of one never discards the other. A run keeps showing the previous
 * results until it finishes. Results from a page the reader has left are dropped.
 */
export function usePageLint(slug: string) {
  const [runs, setRuns] = useState<{ slug: string; byMode: Record<LintMode, LintRun> }>({ slug, byMode: IDLE });
  const byMode = runs.slug === slug ? runs.byMode : IDLE;

  useEffect(() => setRuns({ slug, byMode: IDLE }), [slug]);

  const run = useCallback(
    async (mode: LintMode) => {
      const update = (next: (current: LintRun) => LintRun) =>
        setRuns((state) =>
          state.slug === slug ? { slug, byMode: { ...state.byMode, [mode]: next(state.byMode[mode]) } } : state,
        );
      update((current) => ({ status: "running", previous: resultsOf(current) }));
      try {
        const results = await runLint(slug, mode);
        update(() => ({ status: "done", results }));
      } catch (cause) {
        const error = cause instanceof Error ? cause.message : String(cause);
        update((current) => ({ status: "error", error, previous: resultsOf(current) }));
      }
    },
    [slug],
  );

  return {
    runs: byMode,
    results: [...resultsOf(byMode.lint), ...resultsOf(byMode.prompt)],
    run,
  };
}
