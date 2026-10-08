import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { SegmentedControl, type SegmentedOption } from "../components/SegmentedControl";
import { UiAdd, UiColumns, UiFile, UiRows } from "../icons";
import {
  computeLineDiff,
  parseUnifiedDiff,
  type DiffHunk,
  type DiffLine,
  type DiffLineType,
} from "./code-diff";
import { highlightToLines, type HighlightedLine } from "./code-highlight";
import { HighlightedTokens } from "./HighlightedTokens";

export type CodeDiffView = "unified" | "split";

// Rows = stacked/unified; columns = side-by-side/split.
const DIFF_VIEW_OPTIONS: SegmentedOption<CodeDiffView>[] = [
  { id: "unified", label: "Unified", icon: UiRows, title: "Unified view" },
  { id: "split", label: "Split", icon: UiColumns, title: "Split view" },
];

// Either two blobs (diffed in-repo) or a ready unified-diff string (what
// `GitDiffPanel` already receives). `never` on the absent keys keeps the shapes
// mutually exclusive.
type CodeDiffInput =
  | { original: string; modified: string; unified?: never }
  | { unified: string; original?: never; modified?: never };

export type DiffSide = "old" | "new";

/** The diff line a gutter "+" button was clicked on. */
export interface DiffLineTarget {
  side: DiffSide;
  line: number;
  content: string;
}

/** A node rendered as a full-width row directly below the row at `(side, line)`. */
export interface DiffLineWidget {
  key: string;
  side: DiffSide;
  line: number;
  node: ReactNode;
}

type LineAnnotations = {
  onLineAction: ((target: DiffLineTarget) => void) | undefined;
  lineWidgets: DiffLineWidget[] | undefined;
};

export type CodeDiffProps = CodeDiffInput & {
  /**
   * When set, every numbered line shows a "+" button in its gutter (on row hover
   * or keyboard focus). Added/context lines report side `new`, deleted lines
   * `old`; in split view the left column is `old` and the right `new`.
   */
  onLineAction?: ((target: DiffLineTarget) => void) | undefined;
  /**
   * Rendered as a full-width row directly below the row matching `(side, line)`,
   * in array order. A context line matches both its `old` and `new` number.
   */
  lineWidgets?: DiffLineWidget[] | undefined;
  /** Highlighter language hint, e.g. `typescript`, `go`, `python`. */
  language?: string | undefined;
  /** Unified (single column) or split (side-by-side). Defaults to `unified`. */
  view?: CodeDiffView | undefined;
  /** Show old/new line-number gutters. Defaults to `true`. */
  showLineNumbers?: boolean | undefined;
  /** Render only the rows — no border, background, or language header. */
  bare?: boolean | undefined;
  className?: string | undefined;
};

type ResolvedLine = {
  line: DiffLine;
  oldTokens: HighlightedLine | undefined;
  newTokens: HighlightedLine | undefined;
};

type ResolvedHunk = { header: string | undefined; path: string | undefined; lines: ResolvedLine[] };

// Row background tint — theme-aware via `[[data-theme=dark]_&]` (plain `dark:`
// compiles to prefers-color-scheme in the built dist and ignores `data-theme`).
const ROW_TINT: Record<DiffLineType, string | undefined> = {
  context: undefined,
  add: "bg-emerald-500/10",
  remove: "bg-rose-500/10",
};

const MARKER_TONE: Record<DiffLineType, string> = {
  context: "text-muted-foreground",
  add: "text-emerald-700 [[data-theme=dark]_&]:text-emerald-300",
  remove: "text-rose-700 [[data-theme=dark]_&]:text-rose-300",
};

const MARKER: Record<DiffLineType, string> = { context: "", add: "+", remove: "-" };

export function CodeDiff(props: CodeDiffProps) {
  const { language, view: viewProp = "unified", showLineNumbers = true, bare = false, className } = props;
  const { unified, original, modified, onLineAction, lineWidgets } = props;
  const annotations: LineAnnotations = { onLineAction, lineWidgets };

  // `view` prop seeds the default; the header toggle then owns it.
  const [view, setView] = useState<CodeDiffView>(viewProp);

  const hunks = useMemo<DiffHunk[]>(
    () =>
      unified !== undefined
        ? parseUnifiedDiff(unified)
        : computeLineDiff(original ?? "", modified ?? ""),
    [unified, original, modified],
  );

  const { oldSource, newSource } = useMemo(() => buildSides(hunks), [hunks]);

  // Raw first paint, highlighted tokens swap in — matches CodeBlock. `null`
  // means "not highlighted" (empty/unsupported/loading); rows fall back to plain
  // text token-by-token.
  const [tokens, setTokens] = useState<{
    old: HighlightedLine[] | null;
    mod: HighlightedLine[] | null;
  }>({ old: null, mod: null });

  useEffect(() => {
    if (!language) {
      setTokens({ old: null, mod: null });
      return;
    }
    let cancelled = false;
    Promise.all([
      highlightToLines(oldSource, { lang: language }),
      highlightToLines(newSource, { lang: language }),
    ]).then(([old, mod]) => {
      if (!cancelled) setTokens({ old, mod });
    });
    return () => {
      cancelled = true;
    };
  }, [language, oldSource, newSource]);

  const resolved = useMemo(
    () => resolveHunks(hunks, tokens.old, tokens.mod),
    [hunks, tokens],
  );

  // Only a diff that spans more than one file labels its hunks with the path —
  // a single-file diff's path is already known from its surrounding context.
  const multiFile =
    new Set(resolved.map((hunk) => hunk.path).filter((p) => p !== undefined)).size > 1;

  let lastPath: string | undefined;
  const rows = resolved.map((hunk, index) => {
    const filePath =
      multiFile && hunk.path !== undefined && hunk.path !== lastPath ? hunk.path : undefined;
    lastPath = hunk.path;
    return (
      <Fragment key={index}>
        {filePath && <FileHeader path={filePath} />}
        {view === "split" ? (
          <SplitHunk hunk={hunk} showLineNumbers={showLineNumbers} annotations={annotations} />
        ) : (
          <UnifiedHunk hunk={hunk} showLineNumbers={showLineNumbers} annotations={annotations} />
        )}
      </Fragment>
    );
  });

  if (bare) {
    return (
      <div className={cn("overflow-x-auto font-mono text-xs leading-relaxed", className)}>
        {rows}
      </div>
    );
  }
  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-muted/40", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {language || "diff"}
        </span>
        <SegmentedControl
          size="sm"
          aria-label="Diff view"
          value={view}
          onChange={setView}
          options={DIFF_VIEW_OPTIONS}
        />
      </div>
      <div className="overflow-x-auto font-mono text-xs leading-relaxed">{rows}</div>
    </div>
  );
}

// Reconstruct the full old side (context + remove) and new side (context + add)
// as text — highlighting each side as a coherent blob so grammar state is intact.
function buildSides(hunks: DiffHunk[]): { oldSource: string; newSource: string } {
  const oldLines: string[] = [];
  const newLines: string[] = [];
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.type !== "add") oldLines.push(line.content);
      if (line.type !== "remove") newLines.push(line.content);
    }
  }
  return { oldSource: oldLines.join("\n"), newSource: newLines.join("\n") };
}

// Map each diff line to its highlighted tokens via a sequential cursor per side
// (not absolute line number, so unified-diff gaps between hunks stay aligned).
function resolveHunks(
  hunks: DiffHunk[],
  oldTokens: HighlightedLine[] | null,
  newTokens: HighlightedLine[] | null,
): ResolvedHunk[] {
  let oldCursor = 0;
  let newCursor = 0;
  return hunks.map((hunk) => ({
    header: hunk.header,
    path: hunk.path,
    lines: hunk.lines.map((line) => {
      const resolved: ResolvedLine = {
        line,
        oldTokens: line.type === "add" ? undefined : oldTokens?.[oldCursor],
        newTokens: line.type === "remove" ? undefined : newTokens?.[newCursor],
      };
      if (line.type !== "add") oldCursor += 1;
      if (line.type !== "remove") newCursor += 1;
      return resolved;
    }),
  }));
}

type HunkProps = {
  hunk: ResolvedHunk;
  showLineNumbers: boolean;
  annotations: LineAnnotations;
};

// Which side of `line` a widget at (side, number) attaches to: context lines
// carry both numbers, add lines only `new`, remove lines only `old`.
function lineHasPosition(line: DiffLine, side: DiffSide, number: number): boolean {
  if (side === "old") return line.type !== "add" && line.oldNumber === number;
  return line.type !== "remove" && line.newNumber === number;
}

function WidgetRows({ widgets }: { widgets: DiffLineWidget[] }) {
  return (
    <>
      {widgets.map((widget) => (
        <div
          key={widget.key}
          data-diff-widget={widget.key}
          className="whitespace-normal border-y border-border bg-background px-3 py-2 font-sans text-sm leading-normal text-foreground"
        >
          {widget.node}
        </div>
      ))}
    </>
  );
}

function UnifiedHunk({ hunk, showLineNumbers, annotations }: HunkProps) {
  const { onLineAction, lineWidgets } = annotations;
  return (
    <>
      {hunk.header && <HunkHeader header={hunk.header} />}
      {hunk.lines.map((resolved, index) => {
        const { line } = resolved;
        const tokens = line.type === "remove" ? resolved.oldTokens : resolved.newTokens;
        const actionSide: DiffSide = line.type === "remove" ? "old" : "new";
        const widgets = lineWidgets?.filter((w) => lineHasPosition(line, w.side, w.line));
        return (
          <Fragment key={index}>
            <div className={cn("group flex", ROW_TINT[line.type])} data-diff-line={line.type}>
              {showLineNumbers && (
                <>
                  <Gutter
                    value={line.oldNumber}
                    line={line}
                    side="old"
                    actionSide={actionSide}
                    onLineAction={onLineAction}
                  />
                  <Gutter
                    value={line.newNumber}
                    line={line}
                    side="new"
                    actionSide={actionSide}
                    onLineAction={onLineAction}
                  />
                </>
              )}
              <Marker type={line.type} />
              <code className="whitespace-pre pl-1 pr-3">
                <HighlightedTokens tokens={tokens} content={line.content} />
              </code>
            </div>
            {widgets && <WidgetRows widgets={widgets} />}
          </Fragment>
        );
      })}
    </>
  );
}

function SplitHunk({ hunk, showLineNumbers, annotations }: HunkProps) {
  const pairs = useMemo(() => pairLines(hunk.lines), [hunk.lines]);
  const { onLineAction, lineWidgets } = annotations;
  return (
    <>
      {hunk.header && <HunkHeader header={hunk.header} />}
      {pairs.map((pair, index) => {
        const widgets = lineWidgets?.filter(
          (w) =>
            (pair.left !== undefined && lineHasPosition(pair.left.line, w.side, w.line) && w.side === "old") ||
            (pair.right !== undefined && lineHasPosition(pair.right.line, w.side, w.line) && w.side === "new"),
        );
        return (
          <Fragment key={index}>
            <div className="flex">
              <SplitCell
                resolved={pair.left}
                side="old"
                showLineNumbers={showLineNumbers}
                onLineAction={onLineAction}
              />
              <span aria-hidden className="w-px shrink-0 bg-border" />
              <SplitCell
                resolved={pair.right}
                side="new"
                showLineNumbers={showLineNumbers}
                onLineAction={onLineAction}
              />
            </div>
            {widgets && <WidgetRows widgets={widgets} />}
          </Fragment>
        );
      })}
    </>
  );
}

type SplitPair = { left: ResolvedLine | undefined; right: ResolvedLine | undefined };

// Pair consecutive remove/add runs (remove[i] ↔ add[i]); leftovers get a blank
// opposite cell. Context is one aligned row on both sides.
function pairLines(lines: ResolvedLine[]): SplitPair[] {
  const pairs: SplitPair[] = [];
  let removes: ResolvedLine[] = [];
  let adds: ResolvedLine[] = [];
  const flush = () => {
    const max = Math.max(removes.length, adds.length);
    for (let i = 0; i < max; i++) pairs.push({ left: removes[i], right: adds[i] });
    removes = [];
    adds = [];
  };
  for (const resolved of lines) {
    if (resolved.line.type === "remove") removes.push(resolved);
    else if (resolved.line.type === "add") adds.push(resolved);
    else {
      flush();
      pairs.push({ left: resolved, right: resolved });
    }
  }
  flush();
  return pairs;
}

function SplitCell({
  resolved,
  side,
  showLineNumbers,
  onLineAction,
}: {
  resolved: ResolvedLine | undefined;
  side: DiffSide;
  showLineNumbers: boolean;
  onLineAction: LineAnnotations["onLineAction"];
}) {
  if (!resolved) return <div className="min-w-0 flex-1" />;
  const { line } = resolved;
  const active =
    (side === "old" && line.type === "remove") || (side === "new" && line.type === "add");
  const type: DiffLineType = active ? line.type : "context";
  const number = side === "old" ? line.oldNumber : line.newNumber;
  const tokens = side === "old" ? resolved.oldTokens : resolved.newTokens;
  return (
    <div
      className={cn("group flex min-w-0 flex-1", active && ROW_TINT[line.type])}
      data-diff-line={type}
    >
      {showLineNumbers && (
        <Gutter value={number} line={line} side={side} actionSide={side} onLineAction={onLineAction} />
      )}
      <Marker type={type} />
      <code className="min-w-0 whitespace-pre pl-1 pr-3">
        <HighlightedTokens tokens={tokens} content={line.content} />
      </code>
    </div>
  );
}

function FileHeader({ path }: { path: string }) {
  return (
    <div
      data-diff-file={path}
      className="flex items-center gap-1.5 border-b border-border bg-muted px-2 py-1 font-medium text-foreground"
    >
      <UiFile className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{path}</span>
    </div>
  );
}

function HunkHeader({ header }: { header: string }) {
  return (
    <div className="select-none bg-muted/60 px-2 py-0.5 text-muted-foreground">{header}</div>
  );
}

// `side` is the number this gutter shows; the "+" button only renders in the
// `actionSide` gutter so a unified row (two gutters) exposes exactly one.
function Gutter({
  value,
  line,
  side,
  actionSide,
  onLineAction,
}: {
  value: number | undefined;
  line: DiffLine;
  side: DiffSide;
  actionSide: DiffSide;
  onLineAction: LineAnnotations["onLineAction"];
}) {
  const showAction = onLineAction !== undefined && value !== undefined && side === actionSide;
  return (
    <span className="relative w-10 shrink-0 select-none px-2 text-right tabular-nums text-muted-foreground">
      {value ?? ""}
      {showAction && (
        <button
          type="button"
          aria-label={`Comment on line ${value}`}
          onClick={() => onLineAction({ side, line: value, content: line.content })}
          className="absolute inset-y-0 left-0.5 flex items-center rounded-sm bg-background text-primary opacity-0 hover:text-primary/80 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring group-hover:opacity-100"
        >
          <UiAdd className="size-3.5" />
        </button>
      )}
    </span>
  );
}

function Marker({ type }: { type: DiffLineType }) {
  return (
    <span className={cn("w-4 shrink-0 select-none text-center", MARKER_TONE[type])}>
      {MARKER[type]}
    </span>
  );
}
