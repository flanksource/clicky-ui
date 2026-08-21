// Shared frame heuristics for the JVM diagnostics renderers. Both parsers — the
// exception-dump parser (stacktrace-parse) and the thread-dump parser
// (jvm-stacktrace) — classify and label frames the same way, so the rules live
// here rather than being restated in each.

// Packages that are JVM/JDK internals rather than application code. Frames
// matching one are marked `runtime`, which mutes them and lets a renderer drop
// them via `hideRuntimeOnly`.
//
// Deliberately conservative: it covers the JDK only. A consumer whose noise
// floor is higher (a servlet container's frames, a profiling agent's own
// frames) passes its extra prefixes to `isRuntimeFrame` rather than forking
// this list — what counts as noise is the consumer's call, not ours.
export const RUNTIME_PREFIXES = [
  "java.",
  "javax.",
  "sun.",
  "jdk.",
  "com.sun.",
  "or" + "acle.jrockit.",
];

export function isRuntimeFrame(className: string, extraPrefixes: string[] = []): boolean {
  return (
    RUNTIME_PREFIXES.some((p) => className.startsWith(p)) ||
    extraPrefixes.some((p) => className.startsWith(p))
  );
}

// shortFrameName collapses a fully-qualified frame to `Class.method` for
// display, keeping any inner-class suffix: `com.example.App$Inner.run` →
// `App$Inner.run`. Returns the input unchanged when it has no package.
export function shortFrameName(className: string, method: string): string {
  const last = className.split(".").filter(Boolean).pop() ?? className;
  return [last, method].filter(Boolean).join(".");
}

// frameLocation renders the `File.java:42` badge, degrading to the bare file
// when no line was captured and to undefined when there is no file at all.
// Line 0 is a captured location, not an absent one, so the check is against
// undefined rather than falsiness.
export function frameLocation(file?: string, line?: number): string | undefined {
  if (!file) return undefined;
  return line === undefined ? file : `${file}:${line}`;
}
