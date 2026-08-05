// L0 of the tool-render pipeline: undo the transport envelope before any
// renderer sees a tool result.
//
// The Go backend (captain/pkg/aichat/events.go) emits a completed tool result
// as `{"output": "<json string>", "isError"?: true}` — the payload is JSON
// encoded *twice*. Persisted threads store the same shape, so both the live
// stream and a reloaded thread need the same unwrap. Nothing downstream should
// ever have to know about the envelope.

export type NormalizedToolOutput = {
  /** Envelope-unwrapped, JSON-parsed value. */
  value: unknown;
  /** True when the transport envelope carried `isError: true`. */
  isError: boolean;
  /** The original text when the payload was a string that is not JSON. */
  text?: string;
};

const ENVELOPE_KEYS = new Set(["output", "isError"]);
const MAX_UNWRAP_DEPTH = 4;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** True for the transport envelope only: an object carrying `output` and
 *  nothing beyond `isError`. The subset check is what stops a legitimate
 *  record that happens to have an `output` field from being eaten. */
function isOutputEnvelope(value: unknown): value is { output: unknown; isError?: boolean } {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.includes("output") && keys.every((key) => ENVELOPE_KEYS.has(key));
}

function parseJsonish(text: string): { parsed: unknown } | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    return { parsed: JSON.parse(trimmed) as unknown };
  } catch {
    return null;
  }
}

/** Unwraps the transport `{output, isError}` envelope and parses JSON-looking
 *  strings. Identity for anything else — a non-JSON string is returned
 *  untouched (and also surfaced as `text`). */
export function normalizeToolOutput(raw: unknown): NormalizedToolOutput {
  let value = raw;
  let isError = false;

  for (let depth = 0; depth < MAX_UNWRAP_DEPTH; depth += 1) {
    if (isOutputEnvelope(value)) {
      if (value.isError === true) isError = true;
      value = value.output;
      continue;
    }
    if (typeof value === "string") {
      const parsed = parseJsonish(value);
      if (!parsed) return { value, isError, text: value };
      value = parsed.parsed;
      continue;
    }
    break;
  }

  return { value, isError };
}
