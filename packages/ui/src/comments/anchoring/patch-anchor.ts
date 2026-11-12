/**
 * Git-hunk anchors for line ranges: `r:` + JSON of a `PatchAnchor`.
 *
 * `capturePatch` and `matchPatch` are ports of gavel's `comments.CapturePatch`
 * and `comments.ResolvePatch` (comments/patch_anchor.go) and must stay
 * byte-for-byte compatible with them, so a client and the server place a
 * thread on the same lines. There is deliberately no fuzzy fallback: a hunk
 * that no longer matches exactly is "outdated", never silently moved.
 */
import type { PatchAnchor } from "../annotation-types";

export const PATCH_PREFIX = "r:";
/** Context lines kept on each side of the range. */
const CONTEXT_LINES = 3;

export type PatchMatch =
  | { state: "matched"; startLine: number; endLine: number }
  | { state: "ambiguous" }
  | { state: "outdated" };

const splitLines = (source: string): string[] => source.replaceAll("\r\n", "\n").split("\n");

/** The 1-based, inclusive lines `startLine`..`endLine` of `source` with their surrounding context. */
export function capturePatch(source: string, startLine: number, endLine: number): PatchAnchor {
  const lines = splitLines(source);
  if (startLine < 1 || endLine < startLine || endLine > lines.length) throw new Error("Source selection is outside the file");
  return {
    version: 1,
    startLine,
    endLine,
    before: lines.slice(Math.max(0, startLine - 1 - CONTEXT_LINES), startLine - 1),
    lines: lines.slice(startLine - 1, endLine),
    after: lines.slice(endLine, endLine + CONTEXT_LINES),
  };
}

const isStringList = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");

function assertPatch(value: unknown): asserts value is PatchAnchor {
  const patch = value as Partial<Record<keyof PatchAnchor, unknown>> | null;
  const ok =
    typeof patch === "object" &&
    patch !== null &&
    typeof patch.version === "number" &&
    typeof patch.startLine === "number" &&
    typeof patch.endLine === "number" &&
    isStringList(patch.before) &&
    isStringList(patch.lines) &&
    isStringList(patch.after);
  if (!ok) throw new Error("patch anchor is not a patch: expected {version, startLine, endLine, before, lines, after}");
}

export function isPatchAnchor(anchor: string): boolean {
  return anchor.startsWith(PATCH_PREFIX);
}

export function patchAnchor(patch: PatchAnchor): string {
  return `${PATCH_PREFIX}${JSON.stringify(patch)}`;
}

/** The patch an `r:` anchor holds; throws for any other anchor or malformed JSON. */
export function parsePatchAnchor(anchor: string): PatchAnchor {
  if (!isPatchAnchor(anchor)) throw new Error(`expected an "r:" patch anchor, got ${JSON.stringify(anchor.slice(0, 40))}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(anchor.slice(PATCH_PREFIX.length));
  } catch (cause) {
    throw new Error(`patch anchor is not valid JSON: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
  assertPatch(parsed);
  return parsed;
}

/** Reader-facing label of the lines a patch was captured on. */
export function describePatch(patch: PatchAnchor): string {
  return patch.startLine === patch.endLine ? `Line ${patch.startLine}` : `Lines ${patch.startLine}–${patch.endLine}`;
}

/**
 * Where `patch` sits in `source` now. The whole hunk (before + lines + after)
 * must match exactly: at the recorded position first, else at the one place it
 * occurs in the file. More than one place is "ambiguous", none is "outdated".
 */
export function matchPatch(source: string, patch: PatchAnchor): PatchMatch {
  const valid =
    patch.version === 1 &&
    patch.lines.length > 0 &&
    patch.startLine >= 1 &&
    patch.endLine - patch.startLine + 1 === patch.lines.length &&
    patch.before.length <= CONTEXT_LINES &&
    patch.after.length <= CONTEXT_LINES;
  if (!valid) return { state: "outdated" };

  const lines = splitLines(source);
  const hunk = [...patch.before, ...patch.lines, ...patch.after];
  const matchesAt = (index: number) => index >= 0 && index + hunk.length <= lines.length && hunk.every((line, i) => lines[index + i] === line);
  const located = (index: number): PatchMatch => {
    const startLine = index + patch.before.length + 1;
    return { state: "matched", startLine, endLine: startLine + patch.lines.length - 1 };
  };

  const expected = patch.startLine - 1 - patch.before.length;
  if (matchesAt(expected)) return located(expected);
  let found = -1;
  for (let index = 0; index + hunk.length <= lines.length; index++) {
    if (!matchesAt(index)) continue;
    if (found >= 0) return { state: "ambiguous" };
    found = index;
  }
  return found >= 0 ? located(found) : { state: "outdated" };
}
