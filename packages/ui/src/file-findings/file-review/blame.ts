/** The commit that last changed a run of lines, as `git blame` reports it. */
export type BlameCommit = {
  sha: string;
  author: string;
  /** ISO 8601 author date. */
  date: string;
  /** First line of the commit message. */
  summary: string;
};

/** Consecutive lines (1-based `startLine`) last changed by one commit. */
export type BlameRange = { startLine: number; lineCount: number; commit: BlameCommit };

/** A line's blame: its range's commit, whether it opens the range, and its age from 0 (oldest in the file) to 1 (newest). */
export type BlameLine = { commit: BlameCommit; first: boolean; recency: number };

/** git blames lines not yet committed on an all-zero sha. */
export const isUncommitted = (commit: BlameCommit) => /^0+$/.test(commit.sha);

/** Each line's blame; throws when a range falls outside the source, since the blame then belongs to another revision. */
export function blameLines(ranges: readonly BlameRange[], lineCount: number): Map<number, BlameLine> {
  const times = ranges.map((range) => Date.parse(range.commit.date));
  const oldest = Math.min(...times);
  const span = Math.max(...times) - oldest;
  const lines = new Map<number, BlameLine>();
  ranges.forEach((range, i) => {
    const last = range.startLine + range.lineCount - 1;
    if (range.startLine < 1 || range.lineCount < 1 || last > lineCount) {
      throw new Error(`blame covers lines ${range.startLine}-${last} but the source has ${lineCount} lines`);
    }
    const recency = span > 0 ? (times[i]! - oldest) / span : 1;
    for (let line = range.startLine; line <= last; line++) {
      lines.set(line, { commit: range.commit, first: line === range.startLine, recency });
    }
  });
  return lines;
}

const DAY_MS = 86_400_000;

/** A commit's age at a glance: "today", "5d", "3mo", "2y". */
export function blameAge(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - Date.parse(iso)) / DAY_MS);
  if (days < 1) return "today";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}
