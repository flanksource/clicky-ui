import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Button } from "../../components/button";
import { highlightToLines, languageFromPath, type HighlightedLine } from "../../data/code-highlight";
import { Icon } from "../../data/Icon";
import { useResolvedTheme } from "../../hooks/use-theme";
import { Markdown } from "../../data/Markdown";
import { Tabs } from "../../layout/Tabs";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { cn } from "../../lib/utils";
import { resolveCommentStage, selectCommentThreadsByStage } from "../../lib/comment-stage";
import { CommentThread } from "../../comments/CommentThread";
import { DEFAULT_COMMENT_STATUSES, type Comment, type CommentCallbacks, type CommentConfig } from "../../comments/comment-types";
import { getRoots, selectAnchorThreads } from "../../comments/comment-utils";
import { UiCheck, UiDotsVertical, UiEye, UiFileCode, UiGitCommit, UiListChecks } from "../../icons";
import { FINDINGS_COMMENT_CONFIG, findingsToComments, lineAnchor } from "../findings-comments";
import { AnnotatedCode } from "../LazyAnnotatedCode";
import { blankMdxPreamble } from "../mdx-source";
import type { FileFinding } from "../types";
import { layoutCards, type AnchorMode, type Box } from "./geometry";
import { useAnchorBoxes, useCardHeights, useNarrow } from "./hooks";
import { SEVERITY_MARK, SEVERITY_RANK, severityOf, squiggle, type Severity } from "./marks";
import { ProblemsList } from "./ProblemsList";
import {
  QUOTE_PREFIX,
  describeQuote,
  locateSelection,
  locateSourceSelection,
  parseQuoteAnchor,
  quoteAnchor,
  sourceSpans,
  type QuoteLocator,
} from "./quote-anchor";
import { SourceView } from "./SourceView";
import { markAnchors, sourceRangeOf, sourceSpanOf, type SourceMark } from "./source-marks";
import { SOURCE_PREFIX, describeSource, locateSource, parseSourceAnchor, resolveSource, sourceAnchor } from "./source-anchor";
import { blameLines, type BlameRange } from "./blame";
import { InlineThread } from "./InlineThread";
import { InlineAuthors } from "./InlineAuthors";
import { CommentDraft, type CommentDraftPosition } from "./CommentDraft";

const DEFAULT_CONFIG: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES };
const ESTIMATED_CARD_HEIGHT = 96;
/** How long the pointer rests on a highlight before its inline box opens. */
const HOVER_OPEN_MS = 450;
/** Grace period for the pointer to travel from a highlight into its inline box. */
const HOVER_CLOSE_MS = 300;
/** Width left of a block, over its severity bar, that previews a finding on hover. */
const BAR_HOVER_WIDTH = 16;
// Stable defaults: a fresh `[]` per render would re-derive every anchor and re-measure forever.
const NO_FINDINGS: readonly FileFinding[] = [];
const NO_COMMENTS: Comment[] = [];
const NO_CALLBACKS: CommentCallbacks = {};

/** Findings anchor on their line (`lineAnchor`); people's threads on a quote. */
const FINDING_ANCHOR_PREFIX = lineAnchor(1).replace(/\d+$/, "");
const isFindingAnchor = (anchor: string) => anchor.startsWith(FINDING_ANCHOR_PREFIX);

type AuthorFilter = "all" | "user" | "agent";
/** A selection offered for commenting: a Comment pill that morphs into a composer card once `expanded`. */
type Draft = { anchor: string; label: string; position: CommentDraftPosition; expanded: boolean; surface: "preview" | "source" };

const isMarkdownPath = (path: string) => /\.mdx?$/i.test(path);
/** Anchors on quoted text: words in rendered markdown (`q:`) or characters in a source file (`s:`). */
const isTextAnchor = (anchor: string) => anchor.startsWith(QUOTE_PREFIX) || anchor.startsWith(SOURCE_PREFIX);
const quoteDraft = (locator: QuoteLocator) => ({ anchor: quoteAnchor(locator), label: describeQuote(locator) });

function boxClass({ mode, active }: { mode: AnchorMode; active: boolean }) {
  if (mode === "block") {
    return cn(
      "border-l-[3px] border-amber-400",
      active ? "bg-amber-200/50 [[data-theme=dark]_&]:bg-amber-400/20" : "bg-amber-100/30 [[data-theme=dark]_&]:bg-amber-400/5",
    );
  }
  return cn(
    "rounded-sm",
    active ? "bg-amber-300 [[data-theme=dark]_&]:bg-amber-400/50" : "bg-amber-200/60 [[data-theme=dark]_&]:bg-amber-400/25",
  );
}

function anchorLabel(anchor: string, found: boolean): string {
  const label = anchor.startsWith(QUOTE_PREFIX)
    ? describeQuote(parseQuoteAnchor(anchor))
    : anchor.startsWith(SOURCE_PREFIX)
      ? describeSource(parseSourceAnchor(anchor))
      : anchor.replace("line:", "line ");
  return found ? label : `Text not found · ${label}`;
}

const WORD = /[\p{L}\p{N}'’-]/u;

/** The word under a viewport point, or null when the point is not over a word. */
function wordAt(x: number, y: number): Range | null {
  const caret = document.caretRangeFromPoint?.(x, y);
  const node = caret?.startContainer;
  if (!caret || !node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent ?? "";
  let start = caret.startOffset;
  let end = caret.startOffset;
  while (start > 0 && WORD.test(text[start - 1]!)) start--;
  while (end < text.length && WORD.test(text[end]!)) end++;
  if (start === end) return null;
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  return range;
}

export type FileReviewView = "preview" | "source" | "problems";

export type FileReviewLayout = "margin" | "inline";

/** People's threads on the document and what they may do with them. */
export type FileReviewComments = {
  /** Every comment on the document; quote threads carry `q:` anchors from `quoteAnchor`. */
  items: Comment[];
  callbacks: CommentCallbacks;
  /** Statuses and facets of the host's comments; lint statuses are added for findings. */
  config?: CommentConfig | undefined;
};

export type FileReviewProps = {
  /**
   * File path. Markdown (`.md`, `.mdx`) gets a rendered Preview, with an
   * `.mdx` file's frontmatter and ESM statements blanked; any other file is
   * reviewed as syntax-highlighted Source, its language taken from the extension.
   */
  path: string;
  /** The file being reviewed. */
  source: string;
  /** "preview" is only valid for markdown. */
  view: FileReviewView;
  onViewChange: (view: FileReviewView) => void;
  /** Lint findings: a severity rail and squiggle on each flagged block, read-only threads, and a Problems tab. */
  findings?: readonly FileFinding[] | undefined;
  /** People's comments: quote highlights, threads and author avatars. Without it the document has no comment UI. */
  comments?: FileReviewComments | undefined;
  /** Draw a quote as its exact text, or as the whole block holding it. */
  mode?: AnchorMode | undefined;
  /** Selecting or right-clicking text offers a Comment button that starts a thread on it; needs `comments.callbacks.onCreate`. */
  selectToComment?: boolean | undefined;
  /** Show People / Tools chips that filter threads by author kind. */
  authorFilter?: boolean | undefined;
  /** Threads in a margin rail, or in a box under the highlight that opens on hover. */
  layout?: FileReviewLayout | undefined;
  /** Offers the thread layouts in the tab bar's overflow menu. */
  onLayoutChange?: ((layout: FileReviewLayout) => void) | undefined;
  /**
   * Makes Source an editor: the findings show in Monaco (host renders a
   * MonacoProvider) and each edit is reported here. Without it Source is a
   * read-only listing where text can be commented on.
   */
  onSourceChange?: ((source: string) => void) | undefined;
  /**
   * `git blame` for `source`: offers a Blame toggle that shows who last
   * changed each line in a gutter, in the read-only Source listing. Must cover
   * the same revision as `source`, so omit it while the text has unsaved edits.
   */
  blame?: readonly BlameRange[] | undefined;
  /** Line to reveal and focus, e.g. from the host's URL. Controlled with `onLineChange`. */
  line?: number | undefined;
  /** Called with a finding's line when the reader picks it. */
  onLineChange?: ((line: number) => void) | undefined;
  /** Extra controls on each finding's thread and Source message, e.g. an ignore action. */
  renderFindingActions?: ((finding: FileFinding) => ReactNode) | undefined;
  /** Host controls in the header row, e.g. lint, save or revert buttons. */
  toolbar?: ReactNode;
  /** Sizes the frame; the document and sidebar scroll inside it. Defaults to a fixed 520px pane. */
  className?: string | undefined;
};

const LAYOUTS: { id: FileReviewLayout; label: string }[] = [
  { id: "inline", label: "Inline comments" },
  { id: "margin", label: "Comment sidebar" },
];

/** Sidebar cards level with their anchored line, or stacked in document order. */
type SidebarAlign = "line" | "stack";

const SIDEBAR_ALIGNS: { id: SidebarAlign; label: string }[] = [
  { id: "line", label: "Align to line" },
  { id: "stack", label: "Stacked list" },
];

/** Space kept above a target scrolled into view. */
const REVEAL_OFFSET = 48;

/**
 * Google Docs-style review of one file. Markdown gets a rendered Preview with
 * threads in the margin or inline; any file gets a syntax-highlighted Source
 * listing with threads under their lines. Each feature is on when its prop is
 * given: lint `findings` (rail, squiggles, Problems), people's `comments`
 * (quote highlights and threads), text selection to comment, `blame`, and an
 * editable source.
 */
export function FileReview({
  path,
  source: raw,
  view,
  onViewChange,
  findings: findingsProp,
  comments,
  mode = "text",
  selectToComment = false,
  authorFilter = false,
  layout = "margin",
  onLayoutChange,
  onSourceChange,
  blame,
  line,
  onLineChange,
  renderFindingActions,
  toolbar,
  className,
}: FileReviewProps) {
  const lint = findingsProp !== undefined;
  const findings = findingsProp ?? NO_FINDINGS;
  const prose = isMarkdownPath(path);
  if (view === "problems" && !lint) throw new Error("FileReview: view \"problems\" needs `findings`");
  if (view === "preview" && !prose) throw new Error(`FileReview: view "preview" needs a markdown file, got ${path}`);
  const [showBlame, setShowBlame] = useState(false);
  const blaming = showBlame && blame !== undefined;
  // Blame annotates committed lines, so it shows in the read-only listing even for an editable file.
  const editing = onSourceChange !== undefined && !blaming;
  const people = comments?.items ?? NO_COMMENTS;
  const callbacks = comments?.callbacks ?? NO_CALLBACKS;
  const hostConfig = comments?.config ?? DEFAULT_CONFIG;
  const config = useMemo<CommentConfig>(
    () => ({
      ...hostConfig,
      statuses: [...hostConfig.statuses, ...FINDINGS_COMMENT_CONFIG.statuses],
      // Severity is already the status badge; repeating it as a facet chip crowds a 300px card.
      facets: [...(hostConfig.facets ?? []), ...(FINDINGS_COMMENT_CONFIG.facets ?? []).filter((facet) => facet.key !== "severity")],
    }),
    [hostConfig],
  );
  const canComment = selectToComment && Boolean(callbacks.onCreate);
  const source = useMemo(() => (path.endsWith(".mdx") ? blankMdxPreamble(raw) : raw), [path, raw]);
  const sourceLines = useMemo(() => source.split("\n"), [source]);
  const blamed = useMemo(() => (blaming ? blameLines(blame, sourceLines.length) : null), [blaming, blame, sourceLines.length]);
  const theme = useResolvedTheme();
  const listing = view === "source" && !editing;
  const [tokens, setTokens] = useState<{ source: string; lines: HighlightedLine[] | null } | null>(null);
  useEffect(() => {
    if (!listing) return;
    let current = true;
    const shiki = theme === "dark" ? "github-dark" : "github-light";
    void highlightToLines(source, { lang: languageFromPath(path), theme: shiki }).then(
      (lines) => current && setTokens({ source, lines }),
    );
    return () => {
      current = false;
    };
  }, [listing, source, path, theme]);
  // Tokens of an earlier text would colour the wrong characters; show plain text until the new ones arrive.
  const sourceTokens = tokens?.source === source ? tokens.lines : null;
  const [align, setAlign] = useState<SidebarAlign>("line");
  const [focused, setFocused] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [filter, setFilter] = useState<AuthorFilter>("all");
  const [editorLine, setEditorLine] = useState<number | undefined>(undefined);
  /** A finding picked from Source or Problems: the preview scrolls to it once its box is measured. */
  const [revealing, setRevealing] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  /** The rendered document's own scroll pane, beside the sidebar's (wide layouts only). */
  const bodyPane = useRef<HTMLDivElement>(null);
  const sidebarPane = useRef<HTMLDivElement>(null);
  const outer = useRef<HTMLDivElement>(null);
  const origin = useRef<HTMLDivElement>(null);
  const markdown = useRef<HTMLDivElement>(null);
  const narrow = useNarrow(outer);
  const { heights, refFor } = useCardHeights();

  const findingComments = useMemo(() => findingsToComments(findings), [findings]);
  const all = useMemo(() => [...findingComments, ...people], [findingComments, people]);
  // findingsToComments keeps the findings' order, so a thread's id leads back to its finding.
  const findingById = useMemo(() => new Map(findingComments.map((c, i) => [c.id, findings[i]!])), [findingComments, findings]);
  const renderRootDetails = useMemo(() => {
    if (!renderFindingActions) return undefined;
    return (comment: Comment) => {
      const finding = findingById.get(comment.id);
      return finding ? renderFindingActions(finding) : null;
    };
  }, [renderFindingActions, findingById]);
  const filtered = useMemo(
    () => all.filter((c) => c.parentId || filter === "all" || (c.author?.kind ?? "user") === filter),
    [all, filter],
  );
  const open = useMemo(() => selectCommentThreadsByStage(filtered, config, "active"), [filtered, config]);
  const resolvedCount = getRoots(filtered).filter((c) => resolveCommentStage(config, c.status) !== "active").length;
  const threadAnchors = useMemo(() => [...new Set(getRoots(open).map((c) => c.anchor ?? ""))].filter(Boolean), [open]);
  // An expanded draft highlights its selection, but has no thread to place in the sidebar until posted.
  const draftAnchor = draft?.expanded ? draft.anchor : null;
  const unposted = draftAnchor && !threadAnchors.includes(draftAnchor) ? draftAnchor : null;
  const anchors = useMemo(() => (unposted ? [...threadAnchors, unposted] : threadAnchors), [threadAnchors, unposted]);
  // A line with several findings shows its most severe one.
  const severity = useMemo(() => {
    const worst = new Map<string, Severity>();
    for (const c of getRoots(open)) {
      if (!c.anchor || !isFindingAnchor(c.anchor)) continue;
      const level = severityOf(c.status);
      const current = worst.get(c.anchor);
      if (!current || SEVERITY_RANK[level] > SEVERITY_RANK[current]) worst.set(c.anchor, level);
    }
    return worst;
  }, [open]);
  const { boxes, height, width } = useAnchorBoxes({ origin, markdown, anchors, mode, visible: view === "preview" });
  const sourceOrigin = useRef<HTMLDivElement>(null);
  const [sourceWidth, setSourceWidth] = useState(0);
  const [sourceMarks, setSourceMarks] = useState<SourceMark[]>([]);
  // Source quotes (`s:`) resolve against the text; markdown quotes (`q:`) against the
  // rendered preview, which stays mounted while hidden.
  useLayoutEffect(() => {
    if (view !== "source" || !sourceOrigin.current) return;
    const root = markdown.current;
    const mark = () =>
      setSourceMarks(
        anchors
          .flatMap((anchor) => {
            if (anchor.startsWith(SOURCE_PREFIX)) return [{ anchor, spans: resolveSource(source, parseSourceAnchor(anchor)) }];
            if (root && anchor.startsWith(QUOTE_PREFIX)) return [{ anchor, spans: sourceSpans(root, sourceLines, parseQuoteAnchor(anchor)) }];
            return [];
          })
          .filter((m) => m.spans.length > 0),
      );
    mark();
    // Opened straight on Source, the hidden preview may still be rendering the quotes resolve against.
    const renders = new MutationObserver(mark);
    if (root) renders.observe(root, { childList: true, subtree: true, characterData: true });
    const el = sourceOrigin.current;
    const resizes = new ResizeObserver(() => setSourceWidth(el.offsetWidth));
    resizes.observe(el);
    return () => {
      renders.disconnect();
      resizes.disconnect();
    };
  }, [view, anchors, source, sourceLines, editing]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The anchor the pointer is heading for; `hovered` catches up once the timer fires. */
  const intended = useRef<string | null>(null);
  // A pinned box stays put while the pointer previews other highlights.
  const inlineAnchor = focused ?? hovered;
  useEffect(() => () => clearTimeout(hoverTimer.current ?? undefined), []);
  /** The hovered or pinned quote thread in Source, floating under its highlighted words. */
  const [sourceThread, setSourceThread] = useState<{ anchor: string; boxes: Box[] } | null>(null);
  useLayoutEffect(() => {
    const root = sourceOrigin.current;
    if (view !== "source" || !root || !inlineAnchor || !isTextAnchor(inlineAnchor)) return setSourceThread(null);
    const base = root.getBoundingClientRect();
    const boxes = [...root.querySelectorAll<HTMLElement>("[data-source-comment]")]
      .filter((el) => markAnchors(el).includes(inlineAnchor))
      .flatMap((el) => [...el.getClientRects()])
      .map((r) => ({ top: r.top - base.top, left: r.left - base.left, width: r.width, height: r.height }));
    setSourceThread(boxes.length > 0 ? { anchor: inlineAnchor, boxes } : null);
  }, [view, inlineAnchor, sourceMarks, sourceWidth]);

  const target = revealing ? boxes.get(revealing)?.[0] : undefined;
  // Narrow layouts stack the sidebar under the document, so the whole frame scrolls as one.
  useEffect(() => {
    const pane = (narrow ? scroller : bodyPane).current;
    if (view !== "preview" || !target || !pane || !origin.current) return;
    const top = origin.current.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop + target.top;
    const visible = top >= pane.scrollTop && top + target.height <= pane.scrollTop + pane.clientHeight;
    if (!visible) pane.scrollTop = top - REVEAL_OFFSET;
    setRevealing(null);
  }, [view, target, narrow]);
  // In the Source listing a picked finding scrolls its line into view.
  useEffect(() => {
    const pane = scroller.current;
    if (view !== "source" || !revealing || !pane) return;
    const line = isFindingAnchor(revealing) ? revealing.slice(FINDING_ANCHOR_PREFIX.length) : null;
    const row = line ? pane.querySelector<HTMLElement>(`[data-source-line="${line}"]`) : null;
    if (row) {
      const top = row.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop;
      const visible = top >= pane.scrollTop && top + row.offsetHeight <= pane.scrollTop + pane.clientHeight;
      if (!visible) pane.scrollTop = top - REVEAL_OFFSET;
    }
    setRevealing(null);
  }, [view, revealing]);

  const sidebarScrolls = layout === "margin" && !narrow;
  /** Aligned cards sit at their anchor's offset, so matching the document's scroll puts each level with its line. */
  const levelSidebar = () => {
    if (sidebarScrolls && align === "line" && sidebarPane.current && bodyPane.current) {
      sidebarPane.current.scrollTop = bodyPane.current.scrollTop;
    }
  };
  // Re-level after the user scrolled the sidebar on its own and then picked a thread.
  useEffect(levelSidebar, [focused, align, sidebarScrolls]);
  // A stacked list scrolls the focused card into view instead.
  useEffect(() => {
    const pane = sidebarPane.current;
    if (!sidebarScrolls || align !== "stack" || !focused || !pane) return;
    const card = [...pane.querySelectorAll<HTMLElement>("[data-card-anchor]")].find((el) => el.dataset.cardAnchor === focused);
    if (!card) return;
    const top = card.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop;
    const visible = top >= pane.scrollTop && top + card.offsetHeight <= pane.scrollTop + pane.clientHeight;
    if (!visible) pane.scrollTop = top - REVEAL_OFFSET;
  }, [focused, align, sidebarScrolls]);

  /** Picking a card focuses its thread and brings the anchored text into view. */
  function focusCard(anchor: string) {
    setFocused(anchor);
    setRevealing(anchor);
    if (isFindingAnchor(anchor)) onLineChange?.(Number(anchor.slice(FINDING_ANCHOR_PREFIX.length)));
  }

  function openFinding(finding: FileFinding) {
    const anchor = lineAnchor(finding.line);
    onViewChange(prose ? "preview" : "source");
    setFocused(anchor);
    setRevealing(anchor);
    if (!prose) setEditorLine(finding.line);
    onLineChange?.(finding.line);
  }

  // A line named by the host (its URL) is revealed and focused like a picked finding.
  useEffect(() => {
    if (line === undefined) return;
    const anchor = lineAnchor(line);
    setFocused(anchor);
    setRevealing(anchor);
    setEditorLine(line);
  }, [line]);

  const documentOrder = [...boxes.keys()];
  const tops = layoutCards({
    cards: threadAnchors.map((anchor) => ({
      anchor,
      desired: boxes.get(anchor)?.[0]?.top ?? height,
      order: boxes.has(anchor) ? documentOrder.indexOf(anchor) : documentOrder.length,
      height: heights[anchor] ?? ESTIMATED_CARD_HEIGHT,
    })),
    focused,
  });
  const railHeight = Math.max(height, ...threadAnchors.map((a) => (tops.get(a) ?? 0) + (heights[a] ?? ESTIMATED_CARD_HEIGHT)));
  const ordered = [...threadAnchors].sort((a, b) => (tops.get(a) ?? 0) - (tops.get(b) ?? 0));

  /**
   * The anchor under the pointer, preferring an exact quote over the block holding it.
   * A click takes the whole block; a hover only an exact quote or a block's severity
   * bar, so reading a paragraph with a finding in it does not open anything.
   */
  function anchorAt(event: MouseEvent<HTMLDivElement>, intent: "click" | "hover"): string | null {
    const base = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - base.left;
    const y = event.clientY - base.top;
    const hits = [...boxes]
      .filter(([anchor, list]) => {
        if (anchor === unposted) return false;
        if (isFindingAnchor(anchor)) {
          const last = list[list.length - 1]!;
          const inRail = x <= BAR_HOVER_WIDTH && y >= list[0]!.top && y <= last.top + last.height;
          return inRail || (intent === "click" && list.some((b) => y >= b.top && y <= b.top + b.height && x >= b.left && x <= b.left + b.width));
        }
        return list.some((b) => {
          if (y < b.top || y > b.top + b.height) return false;
          const exact = mode === "text";
          if (intent === "click" || exact) return x >= b.left - (exact ? 0 : 12) && x <= b.left + b.width;
          return x >= b.left - BAR_HOVER_WIDTH && x <= b.left;
        });
      })
      .map(([anchor]) => anchor);
    return hits.find((a) => a.startsWith(QUOTE_PREFIX)) ?? hits[0] ?? null;
  }

  const fromInlineThread = (event: MouseEvent) =>
    (event.target as Element).closest("[data-inline-thread], [data-comment-draft], [data-source-thread]") !== null;

  /**
   * The anchor a selection makes. In markdown, a Source selection is mapped onto
   * the rendered text so the thread shows in Preview too; in any other file it
   * anchors on the source characters.
   */
  function locate(surface: Draft["surface"], range: Range): Pick<Draft, "anchor" | "label"> | null {
    if (!prose) {
      const covered = sourceRangeOf(range);
      const locator = covered && locateSource(source, covered.start, covered.end);
      return locator ? { anchor: sourceAnchor(locator), label: describeSource(locator) } : null;
    }
    if (!markdown.current) return null;
    if (surface === "preview") {
      const locator = locateSelection(markdown.current, range);
      return locator && quoteDraft(locator);
    }
    const span = sourceSpanOf(range);
    const locator = span && locateSourceSelection(markdown.current, sourceLines, span);
    return locator && quoteDraft(locator);
  }

  const surfaceOrigin = (surface: Draft["surface"]) => (surface === "preview" ? origin : sourceOrigin).current!;

  function focusAt(event: MouseEvent<HTMLDivElement>) {
    if (!window.getSelection()?.isCollapsed || fromInlineThread(event) || (event.target as Element).closest("button, a")) return;
    setFocused(anchorAt(event, "click"));
  }

  /**
   * Hover intent: the pointer has to rest on a highlight before its box opens,
   * and leaving starts a grace period so the pointer can still reach the box.
   * Re-targeting only on a change keeps continuous movement from resetting the timer.
   */
  function hoverTo(anchor: string | null) {
    if (anchor === intended.current) return;
    intended.current = anchor;
    clearTimeout(hoverTimer.current ?? undefined);
    hoverTimer.current = setTimeout(() => setHovered(anchor), anchor ? HOVER_OPEN_MS : HOVER_CLOSE_MS);
  }

  function keepHover(anchor: string) {
    clearTimeout(hoverTimer.current ?? undefined);
    intended.current = anchor;
  }

  function closeInlineThread() {
    clearTimeout(hoverTimer.current ?? undefined);
    intended.current = null;
    setFocused(null);
    setHovered(null);
  }

  /** Source previews a thread while the pointer rests on its highlighted words. */
  function hoverSourceAt(event: MouseEvent<HTMLDivElement>) {
    if (fromInlineThread(event)) return;
    const selecting = event.buttons !== 0 || !window.getSelection()?.isCollapsed;
    const mark = (event.target as Element).closest<HTMLElement>("[data-source-comment]");
    hoverTo(selecting || !mark ? null : markAnchors(mark)[0]!);
  }

  /** Clicking away from a highlight and its box unpins it. */
  function unpinSourceAt(event: MouseEvent<HTMLDivElement>) {
    if (fromInlineThread(event) || (event.target as Element).closest("[data-source-comment], button, a")) return;
    if (focused && isTextAnchor(focused) && window.getSelection()?.isCollapsed) closeInlineThread();
  }

  function hoverAt(event: MouseEvent<HTMLDivElement>) {
    if (layout !== "inline" || fromInlineThread(event)) return;
    // Dragging out a selection is reading or commenting, not asking to preview.
    const selecting = event.buttons !== 0 || !window.getSelection()?.isCollapsed;
    hoverTo(selecting ? null : anchorAt(event, "hover"));
  }

  function offerComment(event: MouseEvent<HTMLDivElement>, surface: Draft["surface"]) {
    if (!canComment || fromInlineThread(event) || (event.target as Element).closest("[data-comment-author]")) return;
    const selection = window.getSelection();
    const range = selection && !selection.isCollapsed && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const locator = range ? locate(surface, range) : null;
    if (!range || !locator) {
      // An open composer may hold typed text: only Escape or its close button discards it.
      setDraft((current) => (current?.expanded ? current : null));
      return;
    }
    const base = surfaceOrigin(surface).getBoundingClientRect();
    const rect = range.getBoundingClientRect();
    setDraft({
      ...locator,
      position: { top: rect.top - base.top, bottom: rect.bottom - base.top, left: rect.left - base.left + rect.width / 2 },
      expanded: false,
      surface,
    });
  }

  /**
   * Right-click offers Comment at the pointer: on the selection when the pointer
   * is inside it, else on the word under the pointer, which it selects.
   */
  function commentMenu(event: MouseEvent<HTMLDivElement>, surface: Draft["surface"]) {
    if (!canComment || fromInlineThread(event) || (event.target as Element).closest("[data-comment-author], button, a")) return;
    const selection = window.getSelection();
    const current = selection && !selection.isCollapsed && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const inside = current && [...current.getClientRects()].some((r) => event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom);
    const range = inside ? current : wordAt(event.clientX, event.clientY);
    const locator = range ? locate(surface, range) : null;
    if (!range || !locator) return;
    event.preventDefault();
    if (!inside) {
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    const base = surfaceOrigin(surface).getBoundingClientRect();
    const rect = range.getBoundingClientRect();
    setDraft({
      ...locator,
      position: { top: rect.top - base.top, bottom: rect.bottom - base.top, left: event.clientX - base.left },
      expanded: false,
      surface,
    });
  }

  /** The pill morphs into its composer card; the measured highlight replaces the browser selection. */
  function expandDraft() {
    setDraft((current) => current && { ...current, expanded: true });
    window.getSelection()?.removeAllRanges();
  }

  const closeDraft = useCallback(() => setDraft(null), []);

  /** An open card follows its measured highlight, so a reflow (width, layout) keeps it beside the text. */
  function draftPosition(current: Draft): CommentDraftPosition {
    const list = current.expanded && current.surface === "preview" ? boxes.get(current.anchor) : undefined;
    const first = list?.[0];
    const last = list?.at(-1);
    if (!first || !last) return current.position;
    return { top: first.top, bottom: last.top + last.height, left: first.left + first.width / 2 };
  }

  function renderDraft(current: Draft, containerWidth: number) {
    const onCreate = callbacks.onCreate;
    if (!onCreate) return null;
    const { anchor, label } = current;
    return (
      <CommentDraft
        key={anchor}
        anchor={anchor}
        label={label}
        position={draftPosition(current)}
        containerWidth={containerWidth}
        expanded={current.expanded}
        config={config}
        onExpand={expandDraft}
        onClose={closeDraft}
        onCreate={async (input) => {
          await onCreate(input);
          setDraft(null);
          setFocused(anchor);
        }}
      />
    );
  }

  return (
    <div ref={outer} data-file-review={path} className={cn("flex min-h-0 flex-col gap-2", className ?? "h-[600px]")}>
      <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {toolbar}
        {(comments || lint) && (
          <span>
            {getRoots(open).length} open · {resolvedCount} resolved (hidden)
          </span>
        )}
        {comments && layout === "inline" && <span>· hover a highlight to view or reply</span>}
        {canComment && <span>· select or right-click text to comment</span>}
        {authorFilter && (
          <div role="radiogroup" aria-label="Authors" className="ml-auto inline-flex rounded-md border border-border p-0.5">
            {(["all", "user", "agent"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded px-2 py-0.5 font-medium",
                  filter === value ? "bg-primary text-primary-foreground" : "hover:text-foreground",
                )}
              >
                {value === "all" ? "All" : value === "user" ? "People" : "Tools"}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center border-b border-border">
        <Tabs
          className="min-w-0 flex-1 border-b-0"
          value={view}
          onChange={(id) => {
            onViewChange(id as FileReviewView);
            setDraft(null);
          }}
          tabs={[
            ...(prose ? [{ id: "preview", label: "Preview", icon: UiEye }] : []),
            { id: "source", label: "Source", icon: UiFileCode },
            ...(lint ? [{ id: "problems", label: "Problems", icon: UiListChecks, count: findings.length }] : []),
          ]}
        />
        {blame && view === "source" && (
          <Button
            size="sm"
            variant={showBlame ? "secondary" : "ghost"}
            aria-pressed={showBlame}
            title={showBlame ? "Hide who last changed each line" : "Show who last changed each line"}
            onClick={() => setShowBlame((shown) => !shown)}
            className="shrink-0 gap-1.5"
          >
            <Icon icon={UiGitCommit} />
            Blame
          </Button>
        )}
        {comments && onLayoutChange && prose && (
          <DropdownMenu
            align="right"
            icon={UiDotsVertical}
            hideChevron
            variant="ghost"
            size="sm"
            title="View options"
            menuLabel="View options"
            className="shrink-0"
            items={[
              ...LAYOUTS.map((entry) => ({
                label: entry.label,
                group: "Comments",
                icon: UiCheck,
                iconClassName: entry.id === layout ? undefined : "invisible",
                onSelect: () => onLayoutChange(entry.id),
              })),
              ...(layout === "margin"
                ? SIDEBAR_ALIGNS.map((entry) => ({
                    label: entry.label,
                    group: "Sidebar cards",
                    icon: UiCheck,
                    iconClassName: entry.id === align ? undefined : "invisible",
                    onSelect: () => setAlign(entry.id),
                  }))
                : []),
            ]}
          />
        )}
      </div>
      <div
        ref={scroller}
        className={cn(
          "relative min-h-0 flex-1 rounded-md border border-border bg-background",
          editing && view === "source" ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        {editing && view === "source" && (
          <AnnotatedCode
            path={path}
            source={raw}
            findings={findings}
            line={editorLine}
            onLineChange={setEditorLine}
            onChange={onSourceChange}
            inlineChips
          />
        )}
        {!editing && view === "source" && (
          <div
            ref={sourceOrigin}
            className="relative"
            onMouseUp={(event) => event.button === 0 && offerComment(event, "source")}
            onContextMenu={(event) => commentMenu(event, "source")}
            onClick={unpinSourceAt}
            onMouseMove={hoverSourceAt}
            onMouseLeave={() => hoverTo(null)}
          >
            <SourceView
              source={source}
              tokens={sourceTokens}
              blame={blamed}
              findings={findings}
              marks={sourceMarks}
              comments={open}
              selected={inlineAnchor ?? draftAnchor}
              onSelect={(f) => {
                setFocused(lineAnchor(f.line));
                onLineChange?.(f.line);
              }}
              renderFindingActions={renderFindingActions}
              onFocus={setFocused}
            />
            {draft?.surface === "source" && renderDraft(draft, sourceWidth)}
            {sourceThread && (
              <InlineThread
                key={sourceThread.anchor}
                seamless
                anchor={sourceThread.anchor}
                label={anchorLabel(sourceThread.anchor, true)}
                boxes={sourceThread.boxes}
                containerWidth={sourceWidth}
                thread={selectAnchorThreads(open, sourceThread.anchor)}
                config={config}
                callbacks={callbacks}
                pinned={focused === sourceThread.anchor}
                onPin={() => setFocused(sourceThread.anchor)}
                onClose={closeInlineThread}
                onPointerEnter={() => keepHover(sourceThread.anchor)}
                onPointerLeave={() => hoverTo(null)}
              />
            )}
          </div>
        )}
        {view === "problems" && <ProblemsList source={source} findings={findings} onOpen={openFinding} openLabel={prose ? "Open in preview" : "Open in source"} />}
        {/* Hidden rather than unmounted, so anchor boxes stay measured and a picked finding scrolls straight to its line. */}
        {prose && (
        <div className={cn("flex", narrow ? "flex-col gap-4 p-4" : "h-full", view !== "preview" && "hidden")}>
          {/* Wide layouts give the document and the sidebar their own scroll panes. */}
          <div ref={bodyPane} onScroll={levelSidebar} className={cn("min-w-0 flex-1", !narrow && "overflow-y-auto p-4")}>
          <div
            ref={origin}
            className="relative"
            onMouseUp={(event) => event.button === 0 && offerComment(event, "preview")}
            onContextMenu={(event) => commentMenu(event, "preview")}
            onClick={focusAt}
            onMouseMove={hoverAt}
            onMouseLeave={() => layout === "inline" && hoverTo(null)}
          >
            {[...boxes].flatMap(([anchor, list]) => {
              const active = anchor === focused || anchor === hovered || anchor === draftAnchor;
              if (isFindingAnchor(anchor)) {
                const level = severity.get(anchor);
                if (!level) throw new Error(`lint anchor ${anchor} has no open finding`);
                const mark = SEVERITY_MARK[level];
                const first = list[0]!;
                return [
                  <span
                    key={`${anchor}:rail`}
                    data-lint-rail={level}
                    aria-hidden
                    className={cn("pointer-events-none absolute z-20 flex size-4 items-center justify-center rounded-sm", mark.tone, active && mark.tint)}
                    style={{ top: first.top + first.height / 2 - 8, left: 0 }}
                  >
                    <Icon icon={mark.icon} className="text-[13px]" />
                  </span>,
                  ...list.map((box, i) => (
                    <div
                      key={`${anchor}:${i}`}
                      data-anchor-box={anchor}
                      data-lint-squiggle={level}
                      aria-hidden
                      className={cn("pointer-events-none absolute z-0 transition-colors", active && mark.tint)}
                      style={{ top: box.top, left: box.left, width: box.width, height: box.height + 3 }}
                    >
                      <span
                        className="absolute inset-x-0 bottom-0 h-[3px]"
                        style={{ backgroundImage: squiggle(mark.stroke), backgroundRepeat: "repeat-x", backgroundSize: "6px 3px" }}
                      />
                    </div>
                  )),
                ];
              }
              return list.map((box, i) => (
                <div
                  key={`${anchor}:${i}`}
                  data-anchor-box={anchor}
                  aria-hidden
                  className={cn("pointer-events-none absolute z-0 transition-colors", boxClass({ mode, active }))}
                  style={
                    mode === "text"
                      ? { top: box.top, left: box.left, width: box.width, height: box.height }
                      : { top: box.top - 2, left: box.left - 10, width: box.width + 10, height: box.height + 4 }
                  }
                />
              ));
            })}
            <div ref={markdown} data-annotated-markdown="" className="relative z-10 pl-4">
              <Markdown sourceBlocks text={source} />
            </div>
            {comments && layout === "inline" && <InlineAuthors markdown={markdown} comments={open} focused={focused} onFocus={setFocused} />}
            {draft?.surface === "preview" && renderDraft(draft, width)}
            {layout === "inline" && inlineAnchor && (
              <InlineThread
                key={inlineAnchor}
                anchor={inlineAnchor}
                label={anchorLabel(inlineAnchor, true)}
                boxes={boxes.get(inlineAnchor) ?? []}
                containerWidth={width}
                thread={selectAnchorThreads(open, inlineAnchor)}
                config={config}
                callbacks={isFindingAnchor(inlineAnchor) ? NO_CALLBACKS : callbacks}
                renderRootDetails={renderRootDetails}
                pinned={focused === inlineAnchor}
                onPin={() => setFocused(inlineAnchor)}
                onClose={closeInlineThread}
                onPointerEnter={() => keepHover(inlineAnchor)}
                onPointerLeave={() => hoverTo(null)}
              />
            )}
          </div>
          </div>
          {layout === "margin" && (
            <div
              ref={sidebarPane}
              data-comment-sidebar={narrow ? "below" : align}
              className={cn(narrow ? "w-full" : "w-[316px] shrink-0 overflow-y-auto overscroll-contain border-l border-border py-4 pl-2 pr-4")}
            >
            <div
              className={cn("relative", (narrow || align === "stack") && "space-y-2")}
              style={sidebarScrolls && align === "line" ? { height: railHeight } : undefined}
            >
              {ordered.map((anchor) => {
                const thread = selectAnchorThreads(open, anchor);
                const isFocused = anchor === focused;
                return (
                  <div
                    key={`${anchor}:${isFocused}`}
                    ref={refFor(anchor)}
                    data-card-anchor={anchor}
                    onMouseEnter={() => setHovered(anchor)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => focusCard(anchor)}
                    className={cn(
                      "rounded-lg border bg-card transition-[top,transform] duration-150",
                      sidebarScrolls && align === "line" && "absolute inset-x-0",
                      isFocused ? "z-10 -translate-x-2 border-primary/50 shadow-lg" : "border-border shadow-sm",
                    )}
                    style={sidebarScrolls && align === "line" ? { top: tops.get(anchor) ?? 0 } : undefined}
                  >
                    <div className="truncate px-2 pt-2 text-[11px] text-muted-foreground">
                      {anchorLabel(anchor, boxes.has(anchor))}
                    </div>
                    <CommentThread
                      comments={thread}
                      config={config}
                      anchor={anchor}
                      compact
                      defaultExpanded={isFocused || isFindingAnchor(anchor)}
                      hideComposer={thread.length > 0}
                      autoFocusComposer={thread.length === 0}
                      composerPlaceholder="Add a comment…"
                      {...(isFindingAnchor(anchor) ? NO_CALLBACKS : callbacks)}
                      {...(renderRootDetails ? { renderRootDetails } : {})}
                    />
                  </div>
                );
              })}
            </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
