import { parseJsonPrefix } from "./parse-prefix";

export type SourceDiagnostic = {
  message: string;
  line: number;
  column: number;
};
export type JsonSourceResult = {
  status: "complete" | "incomplete" | "invalid";
  value?: unknown;
  diagnostic?: SourceDiagnostic;
  partialRecord?: { line: number; value: unknown };
};

export function parseJsonSource(
  source: string,
  inputFormat: "json" | "ndjson" = "json",
): JsonSourceResult {
  switch (inputFormat) {
    case "json":
      return parseDocument(source);
    case "ndjson":
      return parseRecords(source);
    default:
      throw new Error(`Unsupported JSON input format: ${String(inputFormat)}`);
  }
}

function parseDocument(source: string): JsonSourceResult {
  try {
    return { status: "complete", value: JSON.parse(source) };
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }
  const result = parseJsonPrefix(source);
  if (result.status === "complete")
    throw new Error(
      "JSON prefix parser accepted a document rejected by JSON.parse",
    );
  const before = source.slice(0, result.offset).split(/\r\n|\r|\n/);
  const last = before.at(-1);
  if (last === undefined) throw new Error("JSON diagnostic has no source line");
  return {
    status: result.status,
    ...(result.status === "incomplete" && "value" in result
      ? { value: result.value }
      : {}),
    diagnostic: {
      message: result.message,
      line: before.length,
      column: last.length + 1,
    },
  };
}

function parseRecords(source: string): JsonSourceResult {
  const lines = source.split(/\r\n|\n/);
  const lastRecord = lines.findLastIndex((line) => line.trim().length > 0);
  const records: unknown[] = [];
  for (const [index, line] of lines.entries()) {
    if (line.trim().length === 0) continue;
    const result = parseDocument(line);
    if (result.status === "complete") {
      records.push(result.value);
      continue;
    }
    if (!result.diagnostic)
      throw new Error("Invalid NDJSON record has no diagnostic");
    const incomplete = result.status === "incomplete" && index === lastRecord;
    return {
      status: incomplete ? "incomplete" : "invalid",
      ...(records.length > 0 ? { value: records } : {}),
      diagnostic: { ...result.diagnostic, line: index + 1 },
      ...(incomplete && "value" in result
        ? { partialRecord: { line: index + 1, value: result.value } }
        : {}),
    };
  }
  return { status: "complete", value: records };
}
