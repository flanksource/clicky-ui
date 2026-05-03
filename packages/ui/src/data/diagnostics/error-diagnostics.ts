// Normalize ad-hoc error payloads (oops JSON, plain strings, nested objects)
// into the shape ErrorDetails consumes. Mirrors what `samber/oops` emits
// from `OopsError.MarshalJSON()` on the Go side.

export type ErrorDiagnostics = {
  message: string;
  trace?: string;
  time?: string;
  stacktrace?: string;
  context: Array<[string, string]>;
  raw?: unknown;
};

export type ParsedErrorStackTrace = {
  headline?: string;
  frames: ErrorStackFrame[];
  unparsed: string[];
  raw: string;
};

export type ErrorStackFrame = {
  raw: string;
  file: string;
  line: number;
  functionName?: string;
};

export function normalizeErrorDiagnostics(
  value: unknown,
  fallback?: string | null,
): ErrorDiagnostics | null {
  if (!value) return null;
  if (typeof value === "string") {
    return value.trim() ? { message: value, context: [] } : null;
  }
  const record = objectRecord(value);
  if (!record) return null;
  const nested = objectRecord(record.error) ?? objectRecord(record.diagnostics);
  if (nested && nested !== record) {
    return normalizeErrorDiagnostics(nested, fallback);
  }
  const message =
    firstString(record, ["error", "message", "msg", "reason", "detail", "details"]) ?? fallback;
  const trace = firstString(record, ["trace", "trace_id", "traceId", "traceID"]);
  const stacktrace = firstString(record, ["stacktrace", "stack_trace", "stackTrace", "stack"]);
  const time = firstString(record, ["time", "timestamp", "created_at"]);
  const context = contextEntries(record.context);
  if (!message && !trace && !stacktrace && context.length === 0) return null;
  return {
    message: message ?? "Action failed",
    context,
    raw: value,
    ...(trace !== undefined ? { trace } : {}),
    ...(time !== undefined ? { time } : {}),
    ...(stacktrace !== undefined ? { stacktrace } : {}),
  };
}

export function parseDiagnosticsStackTrace(stacktrace: string): ParsedErrorStackTrace {
  const lines = stacktrace
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const frames: ErrorStackFrame[] = [];
  const unparsed: string[] = [];
  let headline: string | undefined;

  for (const line of lines) {
    const frame = parseStackTraceFrame(line);
    if (frame) {
      frames.push(frame);
      continue;
    }
    if (!headline && !line.startsWith("--- at ")) {
      headline = line;
      continue;
    }
    unparsed.push(line);
  }

  return {
    frames,
    unparsed,
    raw: stacktrace,
    ...(headline !== undefined ? { headline } : {}),
  };
}

export function parseInlineJsonContextValue(value: string): unknown | null {
  const trimmed = value.trim();
  if (!trimmed || !/^[{[]/.test(trimmed)) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export function compactStackPath(file: string) {
  return file
    .replace(/^github\.com\/flanksource\/incident-commander\//, "")
    .replace(/^github\.com\/flanksource\//, "flanksource/")
    .replace(/^.*\/go\/pkg\/mod\//, "pkg/mod/")
    .replace(/^.*\/incident-commander\//, "");
}

export function isApplicationStackFrame(file: string) {
  return (
    file.includes("github.com/flanksource/incident-commander/") ||
    file.includes("/incident-commander/")
  );
}

function parseStackTraceFrame(line: string): ErrorStackFrame | null {
  const match = line.match(/^--- at (.+):(\d+)(?:\s+(.+))?$/);
  if (!match) return null;
  return {
    raw: line,
    file: match[1] ?? "",
    line: Number(match[2] ?? 0),
    ...(match[3]?.trim() ? { functionName: match[3]!.trim() } : {}),
  };
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function contextEntries(value: unknown): Array<[string, string]> {
  const record = objectRecord(value);
  if (!record) return [];
  return Object.entries(record)
    .filter(
      ([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== "",
    )
    .map(([key, entryValue]) => [key, stringifyValue(entryValue)]);
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
