import type { EvalResponse } from "./api.ts";

/**
 * How one sample fared. `invalid` outranks `empty`: a blank result is only
 * harmless when the expectation accepts it, and a validator that requires a
 * value says so.
 */
export type SampleOutcome = "valid" | "invalid" | "empty" | "failed";

export function classifySample(
  response: EvalResponse,
  validate?: (response: EvalResponse) => string[],
): { outcome: SampleOutcome; issues: string[] } {
  if (response.error) return { outcome: "failed", issues: [response.error.message] };
  const issues = validate?.(response) ?? [];
  if (issues.length > 0) return { outcome: "invalid", issues };
  if (response.result.trim() === "") return { outcome: "empty", issues: [] };
  return { outcome: "valid", issues: [] };
}

export function tallySamples(outcomes: SampleOutcome[]): Record<SampleOutcome, number> {
  const tally: Record<SampleOutcome, number> = { valid: 0, invalid: 0, empty: 0, failed: 0 };
  for (const outcome of outcomes) tally[outcome] += 1;
  return tally;
}

/**
 * The next failed or invalid sample after `from`, wrapping. Undefined when the
 * focused sample is the only one left to look at.
 */
export function nextFailure(outcomes: Array<SampleOutcome | undefined>, from: number): number | undefined {
  const failing = outcomes.flatMap((outcome, index) =>
    outcome === "failed" || outcome === "invalid" ? [index] : [],
  );
  const next = failing.find((index) => index > from) ?? failing[0];
  return next === from ? undefined : next;
}

/** Distinct result types, so an expression that sometimes returns a string shows. */
export function resultTypes(responses: EvalResponse[]): string[] {
  return [...new Set(responses.flatMap((response) => (!response.error && response.type ? [response.type] : [])))].sort();
}
