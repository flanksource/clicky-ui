import { useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "../lib/utils";
import { CommentProvider } from "../comments/CommentProvider";
import { CommentSidePanel } from "../comments/CommentSidePanel";
import { useCommentContext, type CommentContextValue } from "../comments/comment-context";
import { DOCUMENT_ANCHOR, type Comment } from "../comments/comment-types";
import { Markdown } from "../data/Markdown";
import { severityRank } from "../data/lint/stats";
import {
  FINDINGS_COMMENT_CONFIG,
  blockAnchor,
  findingsToComments,
  lineAnchor,
  lineOfAnchor,
  lineRangeAnchorResolver,
} from "./findings-comments";
import { blankMdxPreamble } from "./mdx-source";
import type { FileFinding, LintSeverity } from "./types";

export type AnnotatedMarkdownProps = {
  /** File path; an `.mdx` extension has its frontmatter and ESM statements blanked before rendering. */
  path: string;
  source: string;
  findings: readonly FileFinding[];
  /** Line to scroll to and, when a finding is on it, to focus. Controlled by the host. */
  line?: number | undefined;
  /** Called with the first finding line of a block when the reader clicks that block. */
  onLineChange?: ((line: number) => void) | undefined;
  /** Extra controls under each finding's thread, e.g. an ignore action. */
  renderFindingActions?: ((finding: FileFinding) => ReactNode) | undefined;
  className?: string | undefined;
};

// The block border is drawn from the data attribute the sync below sets, so
// the rendered markdown needs no knowledge of findings.
const BLOCK_STYLES = [
  "[&_[data-finding-severity]]:cursor-pointer",
  "[&_[data-finding-severity]]:border-l-4",
  "[&_[data-finding-severity]]:pl-3",
  "[&_[data-finding-severity=error]]:border-red-500",
  "[&_[data-finding-severity=warning]]:border-amber-500",
  "[&_[data-finding-severity=info]]:border-sky-500",
].join(" ");

type BlockFindings = { severity: LintSeverity; lines: number[] };

/** For each registered block, the worst severity and the sorted distinct finding lines that resolve to it. */
function findingsByBlock(findings: readonly FileFinding[], registered: string[]): Map<string, BlockFindings> {
  const blocks = new Map<string, BlockFindings>();
  for (const finding of findings) {
    const block = lineRangeAnchorResolver(lineAnchor(finding.line), registered);
    if (!block || block === DOCUMENT_ANCHOR) continue;
    const current = blocks.get(block);
    if (!current) {
      blocks.set(block, { severity: finding.severity, lines: [finding.line] });
      continue;
    }
    if (severityRank(finding.severity) > severityRank(current.severity)) current.severity = finding.severity;
    if (!current.lines.includes(finding.line)) current.lines.push(finding.line);
  }
  for (const block of blocks.values()) block.lines.sort((a, b) => a - b);
  return blocks;
}

function blockAnchorOf(el: HTMLElement): string {
  return blockAnchor(Number(el.dataset.sourceStart), Number(el.dataset.sourceEnd));
}

/**
 * Keeps the comment provider's anchor registry equal to the rendered blocks.
 * Markdown loads Streamdown lazily and re-renders on its own, so the registry
 * follows the DOM through a MutationObserver rather than a render hook.
 * Returns the number of registered blocks and the per-block findings.
 */
function useBlockAnchors({
  ctx,
  root,
  findings,
}: {
  ctx: CommentContextValue;
  root: RefObject<HTMLDivElement | null>;
  findings: readonly FileFinding[];
}) {
  const [blockCount, setBlockCount] = useState(0);
  const blocks = useRef(new Map<string, BlockFindings>());
  const { registerAnchor } = ctx;

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const registered = new Map<string, HTMLElement>();
    registerAnchor(DOCUMENT_ANCHOR, element);

    const sync = () => {
      const wanted = new Map<string, HTMLElement>();
      for (const el of element.querySelectorAll<HTMLElement>("[data-source-start]")) {
        // Two blocks cannot share an anchor; the first one in the document keeps it.
        const anchor = blockAnchorOf(el);
        if (!wanted.has(anchor)) wanted.set(anchor, el);
      }
      for (const [anchor, el] of registered) {
        if (wanted.get(anchor) === el) continue;
        registerAnchor(anchor, null);
        registered.delete(anchor);
      }
      for (const [anchor, el] of wanted) {
        if (registered.has(anchor)) continue;
        registerAnchor(anchor, el);
        registered.set(anchor, el);
      }

      blocks.current = findingsByBlock(findings, [...registered.keys(), DOCUMENT_ANCHOR]);
      for (const [anchor, el] of registered) {
        const block = blocks.current.get(anchor);
        if (block) el.dataset.findingSeverity = block.severity;
        else delete el.dataset.findingSeverity;
      }
      setBlockCount(registered.size);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(element, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      for (const anchor of registered.keys()) registerAnchor(anchor, null);
      registerAnchor(DOCUMENT_ANCHOR, null);
    };
  }, [registerAnchor, root, findings]);

  return { blockCount, blocks };
}

function MarkdownBody({
  text,
  findings,
  line,
  onLineChange,
  renderFindingActions,
  className,
}: Omit<AnnotatedMarkdownProps, "path" | "source"> & { text: string }) {
  const ctx = useCommentContext();
  const root = useRef<HTMLDivElement>(null);
  const { blockCount, blocks } = useBlockAnchors({ ctx, root, findings });
  const findingsById = useMemo(() => {
    const comments = findingsToComments(findings);
    return new Map(comments.map((comment, i) => [comment.id, findings[i]!]));
  }, [findings]);
  const { focusAnchor, scrollToAnchor, commentMeta } = ctx;

  // Reveal waits for blocks: before they render, every line resolves to the
  // document anchor and would scroll to the top.
  useLayoutEffect(() => {
    if (line === undefined || blockCount === 0) return;
    const anchor = lineAnchor(line);
    scrollToAnchor(anchor, { block: "center", behavior: "smooth" });
    if (commentMeta[anchor]) focusAnchor(anchor);
    // commentMeta changes identity with the comments; the reveal is per line.
  }, [line, blockCount, focusAnchor, scrollToAnchor]);

  const focusClickedBlock = (target: EventTarget) => {
    const block = (target as Element).closest<HTMLElement>("[data-finding-severity]");
    const first = block ? blocks.current.get(blockAnchorOf(block))?.lines[0] : undefined;
    if (first === undefined) return;
    focusAnchor(lineAnchor(first));
    onLineChange?.(first);
  };

  return (
    <div className={cn("flex h-full min-h-0", className)} data-annotated-markdown="">
      <div
        ref={ctx.contentRef}
        className={cn("relative min-w-0 flex-1 overflow-y-auto p-density-4", BLOCK_STYLES)}
        onClick={(event) => focusClickedBlock(event.target)}
      >
        <div ref={root}>
          <Markdown sourceBlocks text={text} />
        </div>
      </div>
      <div className="shrink-0 overflow-y-auto border-l border-border px-density-3">
        <CommentSidePanel
          focusedAlignment="anchor"
          formatAnchorLabel={(anchor) => `line ${lineOfAnchor(anchor)}`}
          renderRootDetails={(comment: Comment) => {
            const finding = findingsById.get(comment.id);
            return finding && renderFindingActions ? renderFindingActions(finding) : null;
          }}
        />
      </div>
    </div>
  );
}

/**
 * A markdown file rendered with its findings alongside as read-only comment
 * threads. Each finding is anchored to the rendered block that holds its line;
 * a block with findings gets a severity border and focuses its thread when
 * clicked. Positions are absolute, so `.mdx` files have their preamble blanked
 * rather than removed.
 */
export function AnnotatedMarkdown({ path, source, findings, ...rest }: AnnotatedMarkdownProps) {
  const comments = useMemo(() => findingsToComments(findings), [findings]);
  const text = useMemo(() => (path.toLowerCase().endsWith(".mdx") ? blankMdxPreamble(source) : source), [path, source]);
  return (
    <CommentProvider
      comments={comments}
      config={FINDINGS_COMMENT_CONFIG}
      resolveAnchor={lineRangeAnchorResolver}
      initialRailMode="all"
    >
      <MarkdownBody text={text} findings={findings} {...rest} />
    </CommentProvider>
  );
}
