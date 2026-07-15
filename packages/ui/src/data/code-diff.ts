// Pure, React-free diff model shared by `CodeDiff`. Two producers normalize to
// the same `DiffHunk[]` row model: `computeLineDiff` (LCS over two blobs) and
// `parseUnifiedDiff` (git-style `@@` hunks). Kept dependency-free — the repo has
// no diff library and code blocks are small enough for an O(n·m) LCS.

export type DiffLineType = "context" | "add" | "remove";

export type DiffLine = {
  type: DiffLineType;
  /** Line text with no trailing newline. */
  content: string;
  /** 1-based line number on the old side — present for `context` and `remove`. */
  oldNumber?: number;
  /** 1-based line number on the new side — present for `context` and `add`. */
  newNumber?: number;
};

export type DiffHunk = {
  /** The raw `@@ … @@` header for parsed diffs; absent for computed diffs. */
  header?: string;
  /** The file this hunk belongs to, from a multi-file unified diff's headers. */
  path?: string;
  lines: DiffLine[];
};

// Strip a single trailing newline before splitting so line counts match Shiki's
// per-line tokens (Shiki drops one trailing newline). An empty blob is zero
// lines, not one empty line.
function splitLines(text: string): string[] {
  if (text === "") return [];
  const normalized = text.endsWith("\n") ? text.slice(0, -1) : text;
  return normalized.split("\n");
}

// Longest-common-subsequence line diff. Returns a single hunk covering the whole
// blob (or no hunks when both sides are empty).
export function computeLineDiff(original: string, modified: string): DiffHunk[] {
  const a = splitLines(original);
  const b = splitLines(modified);
  const lines = diffLines(a, b);
  return lines.length > 0 ? [{ lines }] : [];
}

function diffLines(a: string[], b: string[]): DiffLine[] {
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  // lcs table: `at(i, j)` = LCS length of a[i:] and b[j:]. Every access is
  // in-bounds by construction (the `!` is safe), so `at` reads as a plain number.
  const lcs = new Int32Array((n + 1) * width);
  const at = (row: number, col: number): number => lcs[row * width + col]!;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * width + j] =
        a[i] === b[j] ? at(i + 1, j + 1) + 1 : Math.max(at(i + 1, j), at(i, j + 1));
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldNo = 1;
  let newNo = 1;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "context", content: a[i]!, oldNumber: oldNo++, newNumber: newNo++ });
      i++;
      j++;
    } else if (at(i + 1, j) >= at(i, j + 1)) {
      out.push({ type: "remove", content: a[i]!, oldNumber: oldNo++ });
      i++;
    } else {
      out.push({ type: "add", content: b[j]!, newNumber: newNo++ });
      j++;
    }
  }
  while (i < n) out.push({ type: "remove", content: a[i++]!, oldNumber: oldNo++ });
  while (j < m) out.push({ type: "add", content: b[j++]!, newNumber: newNo++ });
  return out;
}

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

// Strip the `a/`|`b/` prefix (and any trailing tab-timestamp) from a `---`/`+++`
// header path; `/dev/null` (add/delete) has no path.
function gitHeaderPath(token: string): string | undefined {
  const path = token.split("\t")[0]!.trim();
  if (path === "" || path === "/dev/null") return undefined;
  return path.startsWith("a/") || path.startsWith("b/") ? path.slice(2) : path;
}

// Parse a unified-diff string. `@@ -a,b +c,d @@` headers drive line numbers and
// hunk lengths; `+`/`-`/space lines become add/remove/context. Each hunk records
// the file `path` from the enclosing `diff --git`/`---`/`+++` headers, so a
// multi-file diff keeps its file boundaries. A line that starts with `@@` but is
// not a valid hunk header throws rather than being dropped.
export function parseUnifiedDiff(diff: string): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  let current: DiffHunk | null = null;
  let oldNo = 0;
  let newNo = 0;
  let oldRemaining = 0;
  let newRemaining = 0;
  let path: string | undefined;
  let oldPath: string | undefined;

  const body = diff.endsWith("\n") ? diff.slice(0, -1) : diff;
  for (const raw of body.split("\n")) {
    // While a hunk is open, every line is content until its declared line counts
    // are exhausted — so a `+++ …` content line is never read as a file header.
    if (current) {
      if (raw.startsWith("\\")) continue; // "\ No newline at end of file"
      if (raw.startsWith("+")) {
        current.lines.push({ type: "add", content: raw.slice(1), newNumber: newNo++ });
        newRemaining--;
      } else if (raw.startsWith("-")) {
        current.lines.push({ type: "remove", content: raw.slice(1), oldNumber: oldNo++ });
        oldRemaining--;
      } else {
        const content = raw.startsWith(" ") ? raw.slice(1) : raw;
        current.lines.push({ type: "context", content, oldNumber: oldNo++, newNumber: newNo++ });
        oldRemaining--;
        newRemaining--;
      }
      if (oldRemaining <= 0 && newRemaining <= 0) current = null;
      continue;
    }

    if (raw.startsWith("@@")) {
      const match = HUNK_HEADER.exec(raw);
      if (!match) throw new Error(`Malformed unified diff hunk header: ${raw}`);
      oldNo = Number(match[1]);
      newNo = Number(match[3]);
      oldRemaining = match[2] ? Number(match[2]) : 1;
      newRemaining = match[4] ? Number(match[4]) : 1;
      current = { header: raw, lines: [], ...(path ? { path } : {}) };
      hunks.push(current);
      if (oldRemaining <= 0 && newRemaining <= 0) current = null;
      continue;
    }
    if (raw.startsWith("diff --git ")) {
      path = undefined;
      oldPath = undefined;
    } else if (raw.startsWith("--- ")) {
      oldPath = gitHeaderPath(raw.slice(4));
    } else if (raw.startsWith("+++ ")) {
      path = gitHeaderPath(raw.slice(4)) ?? oldPath;
    }
    // `index`, mode, and similar metadata lines carry no path — ignored.
  }
  return hunks;
}
