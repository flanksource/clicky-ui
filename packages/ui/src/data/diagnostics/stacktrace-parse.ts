import type { ParsedThreadFrame } from "./jvm-stacktrace";
import { frameLocation, isRuntimeFrame, shortFrameName } from "./frame-heuristics";

// ParsedStackFrame is the React mirror of Go's clicky api.StackFrame. We reuse
// ParsedThreadFrame so the shared StackFrameRow renderer can display it.
export type ParsedStackFrame = ParsedThreadFrame;

export interface ParsedStackTrace {
  exceptionClass?: string;
  message?: string;
  causedBy: string[];
  frames: ParsedStackFrame[];
  language: "java";
}

const frameRe = /^\s*at\s+([\w$.]+)\.([\w$<>]+)\(([^)]+)\)/;
const continuationRe = /^\.\.\.\s+\d+\s+more$/;


// parseJavaStackTrace decodes a free-form Java exception dump (the body that
// printStackTrace() emits, optionally wrapped by EclipseLink "Internal
// Exception:" / "Caused by:" markers) into a renderable shape. It is the
// React-side counterpart to Go's api.ParseJavaStackTrace.
export function parseJavaStackTrace(input: string): ParsedStackTrace {
  const out: ParsedStackTrace = {
    causedBy: [],
    frames: [],
    language: "java",
  };
  if (!input || !input.trim()) return out;

  const headerLines: string[] = [];
  for (const raw of input.split("\n")) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (continuationRe.test(trimmed)) continue;

    const frameMatch = frameRe.exec(raw);
    if (frameMatch && frameMatch[1] && frameMatch[2] && frameMatch[3] !== undefined) {
      out.frames.push(buildFrame(frameMatch[1], frameMatch[2], frameMatch[3]));
      continue;
    }

    if (trimmed.startsWith("Caused by:")) {
      out.causedBy.push(trimmed.slice("Caused by:".length).trim());
      continue;
    }
    if (trimmed.startsWith("Internal Exception:")) {
      out.causedBy.push(trimmed.slice("Internal Exception:".length).trim());
      continue;
    }

    if (!out.exceptionClass) {
      const header = parseExceptionHeader(trimmed);
      if (header) {
        out.exceptionClass = header.exceptionClass;
        if (header.message) out.message = header.message;
        continue;
      }
    }

    headerLines.push(trimmed);
  }

  if (!out.message && headerLines.length > 0) {
    out.message = headerLines.join(" ");
  }

  return out;
}

function parseExceptionHeader(
  value: string,
): { exceptionClass: string; message?: string } | null {
  const separator = value.indexOf(":");
  const exceptionClass = separator === -1 ? value : value.slice(0, separator);
  if (
    !exceptionClass ||
    !["Exception", "Error", "Throwable"].some((suffix) => exceptionClass.endsWith(suffix))
  ) {
    return null;
  }
  for (const character of exceptionClass) {
    const code = character.charCodeAt(0);
    const valid =
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      character === "_" ||
      character === "." ||
      character === "$";
    if (!valid) return null;
  }

  if (separator === -1) return { exceptionClass };
  const message = value.slice(separator + 1).trimStart();
  return message ? { exceptionClass, message } : { exceptionClass };
}

function buildFrame(cls: string, method: string, locRaw: string): ParsedStackFrame {
  const loc = locRaw.trim();
  let file: string | undefined;
  let line: number | undefined;
  let nativeMethod = false;
  if (loc === "Native Method") {
    nativeMethod = true;
  } else if (loc !== "Unknown Source") {
    const cleaned = (loc.split(" ~[")[0] ?? loc).trim();
    const i = cleaned.lastIndexOf(":");
    if (i >= 0) {
      file = cleaned.slice(0, i);
      const n = Number(cleaned.slice(i + 1));
      if (Number.isFinite(n)) line = n;
    } else {
      file = cleaned;
    }
  }
  const functionName = `${cls}.${method}`;
  const location = frameLocation(file, line) ?? (nativeMethod ? "Native Method" : undefined);
  const frame: ParsedStackFrame = {
    functionName,
    displayName: shortFrameName(cls, method),
    kind: "frame",
    runtime: isRuntimeFrame(cls),
    nativeMethod,
    class: cls,
    method,
  };
  if (file !== undefined) frame.file = file;
  if (line !== undefined) frame.line = line;
  if (location !== undefined) frame.location = location;
  return frame;
}
