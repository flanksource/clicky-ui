// Findings as read-only clicky-ui comment threads, and the anchor scheme that
// ties a finding's line to the rendered block (or editor line) showing it.

import { DOCUMENT_ANCHOR, type Comment, type CommentAnchor, type CommentConfig } from "../comments/comment-types";
import type { AnchorResolver } from "../comments/comment-context";
import type { FileFinding } from "./types";

/** Anchor of every comment for a finding on `line`. */
export function lineAnchor(line: number): CommentAnchor {
  return `line:${line}`;
}

/** Anchor a rendered block registers for the source lines `start`..`end`. */
export function blockAnchor(start: number, end: number): CommentAnchor {
  return `L${start}-${end}`;
}

const LINE_ANCHOR = /^line:(\d+)$/;
const BLOCK_ANCHOR = /^L(\d+)-(\d+)$/;

/** The line a `line:N` anchor names; throws for any other anchor. */
export function lineOfAnchor(anchor: CommentAnchor): number {
  const match = LINE_ANCHOR.exec(anchor);
  if (!match) throw new Error(`file-findings: expected a "line:<n>" anchor, got ${JSON.stringify(anchor)}`);
  return Number(match[1]);
}

/**
 * Resolves a `line:N` anchor to a registered `L<start>-<end>` block: the
 * smallest block containing N, else the nearest block starting above N, else
 * the document anchor when that is registered. A block anchor resolves to
 * itself when registered. Anything else is a bug in the caller and throws.
 */
export const lineRangeAnchorResolver: AnchorResolver = (anchor, registered) => {
  if (anchor === DOCUMENT_ANCHOR || BLOCK_ANCHOR.test(anchor)) return registered.includes(anchor) ? anchor : null;
  const line = lineOfAnchor(anchor);

  const blocks = registered.flatMap((candidate) => {
    const match = BLOCK_ANCHOR.exec(candidate);
    return match ? [{ anchor: candidate, start: Number(match[1]), end: Number(match[2]) }] : [];
  });
  const containing = blocks
    .filter((b) => b.start <= line && line <= b.end)
    .sort((a, b) => a.end - a.start - (b.end - b.start) || b.start - a.start)[0];
  if (containing) return containing.anchor;
  const preceding = blocks.filter((b) => b.start <= line).sort((a, b) => b.start - a.start)[0];
  if (preceding) return preceding.anchor;
  return registered.includes(DOCUMENT_ANCHOR) ? DOCUMENT_ANCHOR : null;
};

/**
 * Every severity is an unresolved, active comment: a finding has no
 * resolve/close lifecycle here, it is shown for as long as the tool reports it.
 */
export const FINDINGS_COMMENT_CONFIG: CommentConfig = {
  statuses: [
    { value: "error", label: "Error", tone: "danger", stage: "active", unresolved: true },
    { value: "warning", label: "Warning", tone: "warning", stage: "active", unresolved: true },
    { value: "info", label: "Info", tone: "info", stage: "active", unresolved: true },
  ],
  facets: [
    {
      key: "severity",
      label: "Severity",
      options: [
        { value: "error", label: "Error", tone: "danger" },
        { value: "warning", label: "Warning", tone: "warning" },
        { value: "info", label: "Info", tone: "info" },
      ],
    },
    {
      key: "kind",
      label: "Kind",
      options: [
        { value: "lint", label: "Lint", tone: "neutral" },
        { value: "test", label: "Test", tone: "neutral" },
      ],
    },
  ],
};

// A finding has no creation time of its own; one fixed instant keeps the
// comments identical between renders and ordered by id alone.
const FINDING_TIME = "1970-01-01T00:00:00.000Z";
const ID_WIDTH = 6;

/**
 * One root comment per finding, in order. The id is the finding's index
 * zero-padded, so comment `i` belongs to `findings[i]` and ids sort in finding
 * order. Anchor is `line:<n>`, author is the raising tool, status is the severity.
 */
export function findingsToComments(findings: readonly FileFinding[]): Comment[] {
  return findings.map((finding, index) => ({
    id: `finding-${String(index).padStart(ID_WIDTH, "0")}`,
    body: finding.rule ? `${finding.message}\n\n\`${finding.rule}\`` : finding.message,
    createdAt: FINDING_TIME,
    author: { name: finding.source, kind: "agent" },
    status: finding.severity,
    anchor: lineAnchor(finding.line),
    facets: { severity: finding.severity, source: finding.source, kind: finding.kind },
  }));
}
