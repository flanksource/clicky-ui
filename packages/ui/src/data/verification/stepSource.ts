// The source lines a failed fixture step was written as: gavel reads them from
// the step's YAML or markdown file and attaches them as `detail.source`
// (parsers.SourceSnippet). A present-but-malformed field is reported by path,
// like the typed step detail in stepKind.ts.

import type { BriefSection } from "../test-runner";

export type StepSource = {
  file: string;
  line: number;
  endLine: number;
  language?: string;
  text?: string;
  /** Lines past the snippet's cap that `text` leaves out. */
  moreLines?: number;
  /** Why the lines could not be read; set instead of `text`. */
  error?: string;
};

export type StepSourceResult =
  | { kind: "none" }
  | { kind: "source"; source: StepSource }
  | { kind: "invalid"; error: string };

type Rec = Record<string, unknown>;

const isRecord = (value: unknown): value is Rec =>
  value !== null && typeof value === "object" && !Array.isArray(value);

class StepSourceError extends Error {}

function field<T>(source: Rec, key: string, guard: (value: unknown) => value is T, expectation: string): T {
  const value = source[key];
  if (!guard(value)) throw new StepSourceError(`detail.source.${key} must be ${expectation}`);
  return value;
}

function optionalField<T>(source: Rec, key: string, guard: (value: unknown) => value is T, expectation: string): T | undefined {
  return source[key] === undefined ? undefined : field(source, key, guard, expectation);
}

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

export function readStepSource(detail: unknown): StepSourceResult {
  if (!isRecord(detail) || detail.source === undefined) return { kind: "none" };
  const raw = detail.source;
  if (!isRecord(raw)) return { kind: "invalid", error: "detail.source must be an object" };
  try {
    const source: StepSource = {
      file: field(raw, "file", isString, "a string"),
      line: field(raw, "line", isNumber, "a number"),
      endLine: field(raw, "end_line", isNumber, "a number"),
    };
    const optional = {
      language: optionalField(raw, "language", isString, "a string"),
      text: optionalField(raw, "text", isString, "a string"),
      moreLines: optionalField(raw, "more_lines", isNumber, "a number"),
      error: optionalField(raw, "error", isString, "a string"),
    };
    for (const [key, value] of Object.entries(optional)) {
      if (value !== undefined) (source as Rec)[key] = value;
    }
    return { kind: "source", source };
  } catch (err) {
    if (err instanceof StepSourceError) return { kind: "invalid", error: err.message };
    throw err;
  }
}

/** `detail` without its `source`, which the Source section shows. */
export function withoutSource(detail: unknown): unknown {
  if (!isRecord(detail) || !("source" in detail)) return detail;
  const { source: _source, ...rest } = detail;
  return Object.keys(rest).length > 0 ? rest : undefined;
}

export function sourceLocation({ file, line, endLine }: StepSource): string {
  return `${file}:${line}-${endLine}`;
}

/** The Source section of the "Copy details" brief. */
export function stepSourceCopy(source: StepSource): BriefSection[] {
  const body = source.error ? `source unavailable: ${source.error}` : source.text ?? "";
  const more = source.moreLines ? `\n… ${source.moreLines} more lines` : "";
  return [{ title: `Source ${sourceLocation(source)}`, ...(source.language && !source.error ? { lang: source.language } : {}), body: body + more }];
}
