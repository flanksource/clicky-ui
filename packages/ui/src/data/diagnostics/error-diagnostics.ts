// Normalize ad-hoc error payloads (oops JSON, plain strings, nested objects)
// into the shape ErrorDetails consumes. Mirrors what `samber/oops` emits
// from `OopsError.MarshalJSON()` on the Go side.

export type ErrorDiagnostics = {
  message: string;
  trace?: string;
  time?: string;
  stacktrace?: string;
  context: Array<[string, string]>;
  // details carries values too long for a context badge — a failing SQL
  // statement, a response body. They render as labeled preformatted blocks and
  // are part of the copied report.
  details?: ErrorDetailBlock[];
  raw?: unknown;
};

export type ErrorDetailBlock = {
  label: string;
  value: string;
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
  const nestedError = objectRecord(record.error);
  if (nestedError && nestedError !== record) {
    return normalizeErrorDiagnostics(nestedError, fallback);
  }
  const message =
    firstString(record, ["error", "message", "msg", "reason", "detail", "details"]) ?? fallback;
  const trace = firstString(record, ["trace", "trace_id", "traceId", "traceID"]);
  const stacktrace = firstString(record, ["stacktrace", "stack_trace", "stackTrace", "stack"]);
  const time = firstString(record, ["time", "timestamp", "created_at"]);
  const hint = firstString(record, ["hint"]);
  // The hint leads the context badges: of everything the server attaches it is
  // the one field that says what to do next.
  const context: Array<[string, string]> = [
    ...(hint ? ([["Hint", hint]] as Array<[string, string]>) : []),
    ...contextEntries(record.context),
  ];
  const details = detailBlocks(record.details);
  if (!message && !trace && !stacktrace && !time && context.length === 0) {
    const nestedDiagnostics = objectRecord(record.diagnostics);
    if (nestedDiagnostics && nestedDiagnostics !== record) {
      return normalizeErrorDiagnostics(nestedDiagnostics, fallback);
    }
  }
  if (!message && !trace && !stacktrace && !time && context.length === 0) return null;
  return {
    message: message ?? "Action failed",
    context,
    raw: value,
    ...(trace !== undefined ? { trace } : {}),
    ...(time !== undefined ? { time } : {}),
    ...(stacktrace !== undefined ? { stacktrace } : {}),
    ...(details.length > 0 ? { details } : {}),
  };
}

// `details` is overloaded on the wire: our own envelope sends an array of
// {label, value} blocks (entity.ErrorResponse), while third-party bodies use a
// bare string that firstString already reads as the message. Only the array
// form produces blocks; content_type is dropped because every block renders as
// preformatted text either way.
function detailBlocks(value: unknown): ErrorDetailBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const record = objectRecord(entry);
    const label = firstString(record ?? {}, ["label"]);
    const detail = firstString(record ?? {}, ["value"]);
    return label && detail ? [{ label, value: detail }] : [];
  });
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
  const prefix = "--- at ";
  if (!line.startsWith(prefix)) return null;

  const value = line.slice(prefix.length);
  let fileEnd = -1;
  let lineStart = -1;
  let lineEnd = -1;
  let functionStart = -1;

  for (let index = 0; index < value.length; index++) {
    if (value[index] !== ":" || !isDecimalDigit(value[index + 1])) continue;

    let end = index + 1;
    while (isDecimalDigit(value[end])) end++;
    if (end === value.length) {
      fileEnd = index;
      lineStart = index + 1;
      lineEnd = end;
      functionStart = -1;
      continue;
    }
    if (!isWhitespace(value[end])) continue;

    let start = end;
    while (isWhitespace(value[start])) start++;
    if (start === value.length && start - end < 2) continue;
    fileEnd = index;
    lineStart = index + 1;
    lineEnd = end;
    functionStart = start;
  }

  if (fileEnd <= 0 || lineStart < 0 || lineEnd < 0) return null;
  const functionName = functionStart >= 0 ? value.slice(functionStart).trim() : "";
  return {
    raw: line,
    file: value.slice(0, fileEnd),
    line: Number(value.slice(lineStart, lineEnd)),
    ...(functionName ? { functionName } : {}),
  };
}

function isDecimalDigit(value: string | undefined): boolean {
  return value !== undefined && value >= "0" && value <= "9";
}

function isWhitespace(value: string | undefined): boolean {
  return value !== undefined && value.trim() === "";
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
