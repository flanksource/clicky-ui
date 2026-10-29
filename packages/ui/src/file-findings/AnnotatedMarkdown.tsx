import { useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "../lib/utils";
import { CommentProvider } from "../comments/CommentProvider";
import { CommentSidePanel } from "../comments/CommentSidePanel";
import { useCommentContext, type CommentContextValue } from "../comments/comment-context";
import { DOCUMENT_ANCHOR, type Comment } from "../comments/comment-types";
import { Markdown } from "../data/Markdown";
import { LintSeverityIcon } from "../data/test-runner/MarkIcons";
import { HoverCard } from "../overlay/HoverCard";
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
  /** Classes for the rendered markdown column, e.g. a max width; the side panel keeps its own width. */
  bodyClassName?: string | undefined;
  /**
   * Show findings as threads in a side panel (default). Off, each block with
   * findings gets a marker in a gutter beside it and the markdown flows in the
   * host's scroll container, for a host that has a comment rail of its own.
   */
  rail?: boolean | undefined;
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
/** A gutter marker: a block's findings and its offset from the top of the markdown body. */
type GutterMarker = BlockFindings & { anchor: string; top: number };

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
  const [markers, setMarkers] = useState<GutterMarker[]>([]);
  const blocks = useRef(new Map<string, BlockFindings>());
  const elements = useRef(new Map<string, HTMLElement>());
  const { registerAnchor } = ctx;

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const registered = new Map<string, HTMLElement>();
    elements.current = registered;
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
      const origin = element.getBoundingClientRect().top;
      setMarkers(
        [...registered].flatMap(([anchor, el]) => {
          const block = blocks.current.get(anchor);
          return block ? [{ ...block, anchor, top: el.getBoundingClientRect().top - origin }] : [];
        }),
      );
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(element, { childList: true, subtree: true });
    // Reflow (a wider window, a loaded image) moves blocks without DOM churn.
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    resizeObserver?.observe(element);
    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      for (const anchor of registered.keys()) registerAnchor(anchor, null);
      registerAnchor(DOCUMENT_ANCHOR, null);
    };
  }, [registerAnchor, root, findings]);

  return { blockCount, blocks, elements, markers };
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** One marker beside each block with findings; hovering lists them, clicking reports the first line. */
function FindingsGutter({
  markers,
  findings,
  onSelect,
}: {
  markers: GutterMarker[];
  findings: readonly FileFinding[];
  onSelect: (line: number) => void;
}) {
  return (
    <div className="absolute inset-y-0 left-0 w-7">
      {markers.map((marker) => {
        const own = findings.filter((finding) => marker.lines.includes(finding.line));
        const lines = `${marker.lines.length === 1 ? "line" : "lines"} ${marker.lines.join(", ")}`;
        return (
          <HoverCard
            key={marker.anchor}
            placement="right"
            className="absolute left-0"
            cardClassName="max-w-sm space-y-1.5 p-2 text-xs"
            trigger={
              <button
                type="button"
                aria-label={`${plural(own.length, "finding")} on ${lines}`}
                data-severity={marker.severity}
                style={{ top: marker.top }}
                className="absolute left-0 inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11"
                onClick={() => onSelect(marker.lines[0]!)}
              >
                <LintSeverityIcon severity={marker.severity} />
                {own.length > 1 && own.length}
              </button>
            }
          >
            {own.map((finding, index) => (
              <div key={index} className="flex items-start gap-1.5">
                <LintSeverityIcon severity={finding.severity} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div>{finding.message}</div>
                  <div className="font-mono text-muted-foreground">
                    {finding.rule ? `${finding.rule} · ` : ""}line {finding.line}
                  </div>
                </div>
              </div>
            ))}
          </HoverCard>
        );
      })}
    </div>
  );
}

function MarkdownBody({
  text,
  findings,
  line,
  onLineChange,
  renderFindingActions,
  className,
  bodyClassName,
  rail = true,
}: Omit<AnnotatedMarkdownProps, "path" | "source"> & { text: string }) {
  const ctx = useCommentContext();
  const root = useRef<HTMLDivElement>(null);
  const { blockCount, blocks, elements, markers } = useBlockAnchors({ ctx, root, findings });
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
    if (rail) scrollToAnchor(anchor, { block: "center", behavior: "smooth" });
    else {
      // Without a rail the host's container scrolls, not the provider's content box.
      const block = lineRangeAnchorResolver(anchor, [...elements.current.keys()]);
      elements.current.get(block ?? "")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    if (commentMeta[anchor]) focusAnchor(anchor);
    // commentMeta changes identity with the comments; the reveal is per line.
  }, [line, blockCount, focusAnchor, scrollToAnchor, rail, elements]);

  const focusClickedBlock = (target: EventTarget) => {
    const block = (target as Element).closest<HTMLElement>("[data-finding-severity]");
    const first = block ? blocks.current.get(blockAnchorOf(block))?.lines[0] : undefined;
    if (first === undefined) return;
    focusAnchor(lineAnchor(first));
    onLineChange?.(first);
  };

  if (!rail) {
    return (
      <div className={cn("min-w-0", className)} data-annotated-markdown="">
        <div
          ref={ctx.contentRef}
          className={cn("relative pl-8", BLOCK_STYLES)}
          onClick={(event) => focusClickedBlock(event.target)}
        >
          <FindingsGutter
            markers={markers}
            findings={findings}
            onSelect={(first) => {
              focusAnchor(lineAnchor(first));
              onLineChange?.(first);
            }}
          />
          <div ref={root} className={bodyClassName}>
            <Markdown sourceBlocks text={text} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0", className)} data-annotated-markdown="">
      <div
        ref={ctx.contentRef}
        className={cn("relative min-w-0 flex-1 overflow-y-auto p-density-4", BLOCK_STYLES)}
        onClick={(event) => focusClickedBlock(event.target)}
      >
        <div ref={root} className={bodyClassName}>
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
