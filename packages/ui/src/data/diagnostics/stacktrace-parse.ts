import type { ParsedThreadFrame } from "./jvm-stacktrace";

// ParsedStackFrame is the React mirror of Go's clicky api.StackFrame. We reuse
// ParsedThreadFrame so the existing JvmStackFrameRow renderer can display it.
export type ParsedStackFrame = ParsedThreadFrame;

export interface ParsedStackTrace {
  exceptionClass?: string;
  message?: string;
  causedBy: string[];
  frames: ParsedStackFrame[];
  language: "java";
}

const frameRe = /^\s*at\s+([\w$.]+)\.([\w$<>]+)\(([^)]+)\)/;
const headerRe = /^([\w.$]+(?:Exception|Error|Throwable))(?::\s*(.*))?$/;
const continuationRe = /^\.\.\.\s+\d+\s+more$/;

const runtimePrefixes = ["java.", "javax.", "sun.", "jdk.", "com.sun.", "or" + "acle.jrockit."];

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
      const headerMatch = headerRe.exec(trimmed);
      if (headerMatch && headerMatch[1]) {
        out.exceptionClass = headerMatch[1];
        if (headerMatch[2]) out.message = headerMatch[2];
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
  const location = file
    ? line
      ? `${file}:${line}`
      : file
    : nativeMethod
      ? "Native Method"
      : undefined;
  const frame: ParsedStackFrame = {
    functionName,
    displayName: shortDisplay(cls, method),
    kind: "frame",
    runtime: runtimePrefixes.some((p) => cls.startsWith(p)),
    nativeMethod,
    class: cls,
    method,
  };
  if (file !== undefined) frame.file = file;
  if (line !== undefined) frame.line = line;
  if (location !== undefined) frame.location = location;
  return frame;
}

function shortDisplay(cls: string, method: string): string {
  const parts = cls.split(".");
  const last = parts[parts.length - 1] ?? cls;
  return `${last}.${method}`;
}
