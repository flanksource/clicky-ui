import type { DropdownMenuItem } from "../overlay/DropdownMenu";
import { ProblemActions } from "../data/diagnostics/ProblemActions";
import type { editor as MonacoEditorApi, IDisposable } from "monaco-editor";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CommentProvider } from "../comments/CommentProvider";
import { CommentSidePanel } from "../comments/CommentSidePanel";
import { useCommentContext } from "../comments/comment-context";
import type { CommentScrollOptions } from "../comments/comment-context";
import type { CommentAnchor } from "../comments/comment-types";
import { severityRank } from "../data/lint/stats";
import { cn } from "../lib/utils";
import type { Monaco } from "../monaco";
import { MonacoEditor } from "../monaco/MonacoEditor";
import {
  FINDINGS_COMMENT_CONFIG,
  findingsToComments,
  lineAnchor,
  lineOfAnchor,
  lineRangeAnchorResolver,
} from "./findings-comments";
import { registerFindingsLanguages } from "./findings-languages";
import { findingsLanguageForPath } from "./monaco-language";
import type { FileFinding, LintSeverity } from "./types";

export type AnnotatedCodeProps = {
  /** Path of the file; picks the language and names the editor model. */
  path: string;
  workDir?: string | undefined;
  source: string;
  findings: readonly FileFinding[];
  /** Line to reveal and, when a finding starts on it, to focus. Controlled by the host. */
  line?: number | undefined;
  /** Called with a finding's first line when the reader clicks a line it covers. */
  onLineChange?: ((line: number) => void) | undefined;
  /** Extra controls under each finding's thread, e.g. an ignore action. */
  getFindingActions?: ((finding: FileFinding) => DropdownMenuItem[]) | undefined;
  /** Makes the editor editable and receives every edit; without it the editor is read-only. */
  onChange?: ((source: string) => void) | undefined;
  /** Shows each line's worst finding as `rule · message` after the line's text. */
  inlineChips?: boolean | undefined;
  className?: string | undefined;
};

type MountedEditor = { editor: MonacoEditorApi.IStandaloneCodeEditor; monaco: Monaco };

const MARKER_OWNER = "findings";

// Tailwind utilities, so the library's own stylesheet scan emits them; Monaco
// only applies the class names to its decoration elements. Monaco replaces
// every character outside [a-zA-Z0-9_-] in a decoration class with a space,
// so none of these may use `/`, `.`, `[` or `:` (no `bg-red-500/10`, `px-1.5`
// or `ml-[5px]`). The tint is a text-free overlay, so `opacity-10` stands in
// for an alpha background.
const LINE_TINT: Record<LintSeverity, string> = {
  error: "bg-red-500 opacity-10",
  warning: "bg-amber-500 opacity-10",
  info: "bg-sky-500 opacity-10",
};
const GLYPH_BASE = "ml-1 mt-1 size-3 rounded-full";
const GLYPH: Record<LintSeverity, string> = {
  error: `${GLYPH_BASE} bg-red-500`,
  warning: `${GLYPH_BASE} bg-amber-500`,
  info: `${GLYPH_BASE} bg-sky-500`,
};
const CHIP_BASE = "ml-6 italic";
const CHIP: Record<LintSeverity, string> = {
  error: `${CHIP_BASE} text-red-500`,
  warning: `${CHIP_BASE} text-amber-500`,
  info: `${CHIP_BASE} text-sky-500`,
};

function markerSeverity(monaco: Monaco, severity: LintSeverity): number {
  const { MarkerSeverity } = monaco;
  return { error: MarkerSeverity.Error, warning: MarkerSeverity.Warning, info: MarkerSeverity.Info }[severity];
}

function modelPath(workDir: string | undefined, file: string): string {
  return encodeURI(`file://${workDir ? (workDir.startsWith("/") ? workDir : `/${workDir}`) : ""}/${file}`);
}

/** The editor-model markers for `findings`: the finding's range when it has one, else the rest of its line. */
function toMarkers(
  findings: readonly FileFinding[],
  model: MonacoEditorApi.ITextModel,
  monaco: Monaco,
): MonacoEditorApi.IMarkerData[] {
  return findings.map((finding) => {
    const endLineNumber = finding.endLine ?? finding.line;
    return {
      severity: markerSeverity(monaco, finding.severity),
      message: finding.message,
      source: finding.source,
      ...(finding.rule ? { code: finding.rule } : {}),
      startLineNumber: finding.line,
      startColumn: finding.column ?? 1,
      endLineNumber,
      endColumn: finding.endColumn ?? model.getLineMaxColumn(endLineNumber),
    };
  });
}

/**
 * One chip per line that has findings: the worst finding's `rule · message`,
 * with `+N` for the line's other findings, injected after the line's text.
 */
function inlineChipDecorations(
  findings: readonly FileFinding[],
  model: Pick<MonacoEditorApi.ITextModel, "getLineMaxColumn">,
): MonacoEditorApi.IModelDeltaDecoration[] {
  const byLine = new Map<number, FileFinding[]>();
  for (const finding of findings) byLine.set(finding.line, [...(byLine.get(finding.line) ?? []), finding]);
  return [...byLine].map(([line, onLine]) => {
    const worst = onLine.reduce((a, b) => (severityRank(b.severity) > severityRank(a.severity) ? b : a));
    const label = worst.rule ? `${worst.rule} · ${worst.message}` : worst.message;
    const column = model.getLineMaxColumn(line);
    return {
      range: { startLineNumber: line, startColumn: column, endLineNumber: line, endColumn: column },
      options: {
        // Monaco drops injected text on an empty range unless told to keep it.
        showIfCollapsed: true,
        after: {
          content: onLine.length > 1 ? `${label} +${onLine.length - 1}` : label,
          inlineClassName: CHIP[worst.severity],
        },
      },
    };
  });
}

/** The first finding whose line range covers `line`. */
function findingCovering(findings: readonly FileFinding[], line: number): FileFinding | undefined {
  return findings.find((f) => f.line <= line && line <= (f.endLine ?? f.line));
}

function CodeBody({
  mounted,
  onMount,
  contentElement,
  path,
  workDir,
  source,
  findings,
  line,
  onLineChange,
  getFindingActions,
  onChange,
  inlineChips,
  className,
}: AnnotatedCodeProps & {
  mounted: MountedEditor | null;
  onMount: (mounted: MountedEditor) => void;
  contentElement: { current: HTMLDivElement | null };
}) {
  const ctx = useCommentContext();
  const { focusAnchor, commentMeta } = ctx;

  const findingsById = useMemo(() => {
    const comments = findingsToComments(findings);
    return new Map(comments.map((comment, i) => [comment.id, findings[i]!]));
  }, [findings]);

  // Markers and gutter decorations follow the findings.
  useEffect(() => {
    if (!mounted) return;
    const { editor, monaco } = mounted;
    const model = editor.getModel();
    if (!model) return;
    editor.updateOptions({ glyphMargin: true });
    monaco.editor.setModelMarkers(model, MARKER_OWNER, toMarkers(findings, model, monaco));
    const decorations = editor.createDecorationsCollection([
      ...findings.map((finding) => ({
        range: {
          startLineNumber: finding.line,
          startColumn: 1,
          endLineNumber: finding.endLine ?? finding.line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: LINE_TINT[finding.severity],
          glyphMarginClassName: GLYPH[finding.severity],
          glyphMarginHoverMessage: { value: finding.message },
        },
      })),
      ...(inlineChips ? inlineChipDecorations(findings, model) : []),
    ]);
    return () => {
      decorations.clear();
      monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
    };
  }, [mounted, findings, inlineChips]);

  // Clicking a line a finding covers focuses its thread in the rail.
  useEffect(() => {
    if (!mounted) return;
    const { editor } = mounted;
    const subscription = editor.onMouseDown((event) => {
      const clicked = event.target.position?.lineNumber;
      const finding = clicked === undefined ? undefined : findingCovering(findings, clicked);
      if (!finding) return;
      focusAnchor(lineAnchor(finding.line));
      onLineChange?.(finding.line);
    });
    return () => subscription.dispose();
  }, [mounted, findings, focusAnchor, onLineChange]);

  // The rail aligns to the editor's scroll position by listening for `scroll`
  // on the content element, which an editor's internal scrolling never fires.
  useEffect(() => {
    const element = contentElement.current;
    if (!mounted || !element) return;
    const notify = () => element.dispatchEvent(new Event("scroll"));
    const subscription: IDisposable = mounted.editor.onDidScrollChange(notify);
    notify();
    return () => subscription.dispose();
  }, [mounted, contentElement]);

  useLayoutEffect(() => {
    if (!mounted || line === undefined) return;
    mounted.editor.revealLineInCenter(line);
    if (commentMeta[lineAnchor(line)]) focusAnchor(lineAnchor(line));
    // commentMeta changes identity with the comments; the reveal is per line.
  }, [mounted, line, focusAnchor]);

  return (
    <div className={cn("flex h-full min-h-0", className)} data-annotated-code="">
      <div
        ref={(element) => {
          ctx.contentRef.current = element;
          contentElement.current = element;
        }}
        className="min-w-0 flex-1 [&_[data-slot=monaco-editor]]:h-full [&_[data-slot=monaco-editor]]:rounded-none [&_[data-slot=monaco-editor]]:border-0"
      >
        <MonacoEditor
          {...(onChange ? { onChange } : { readOnly: true })}
          value={source}
          language={findingsLanguageForPath(path)}
          path={modelPath(workDir, path)}
          height="100%"
          beforeMount={(monaco) => registerFindingsLanguages(monaco.languages)}
          onMount={(editor, monaco) => onMount({ editor, monaco })}
        />
      </div>
      <div className="shrink-0 overflow-y-auto border-l border-border px-density-3">
        <CommentSidePanel
          focusedAlignment="anchor"
          formatAnchorLabel={(anchor) => `line ${lineOfAnchor(anchor)}`}
          renderRootDetails={(comment) => {
            const finding = findingsById.get(comment.id);
            return finding && getFindingActions ? <ProblemActions items={getFindingActions(finding)} /> : null;
          }}
        />
      </div>
    </div>
  );
}

/**
 * A source file in a Monaco editor with its findings as markers, as gutter
 * dots and as read-only comment threads in a rail beside it. The editor is
 * read-only unless `onChange` is given. Needs a
 * `MonacoProvider` above it. The rail and the editor share one anchor scheme
 * (`line:<n>`): the rail asks the editor where a line is and tells it to
 * reveal one.
 */
export function AnnotatedCode({ findings, ...props }: AnnotatedCodeProps) {
  const [mounted, setMounted] = useState<MountedEditor | null>(null);
  const contentElement = useRef<HTMLDivElement | null>(null);
  const comments = useMemo(() => findingsToComments(findings), [findings]);

  const getAnchorTop = useCallback(
    (anchor: CommentAnchor): number | null => {
      const container = contentElement.current;
      const model = mounted?.editor.getModel();
      const dom = mounted?.editor.getDomNode();
      if (!mounted || !container || !model || !dom) return null;
      const line = lineOfAnchor(anchor);
      if (line > model.getLineCount()) return null;
      const editorOffset = dom.getBoundingClientRect().top - container.getBoundingClientRect().top;
      return editorOffset + mounted.editor.getTopForLineNumber(line) - mounted.editor.getScrollTop();
    },
    [mounted],
  );

  const onScrollToAnchor = useCallback(
    (anchor: CommentAnchor, options: CommentScrollOptions): boolean => {
      if (!mounted) return false;
      const { editor, monaco } = mounted;
      const line = lineOfAnchor(anchor);
      if (line > (editor.getModel()?.getLineCount() ?? 0)) return false;
      editor.revealLineInCenter(
        line,
        options.behavior === "smooth" ? monaco.editor.ScrollType.Smooth : monaco.editor.ScrollType.Immediate,
      );
      return true;
    },
    [mounted],
  );

  return (
    <CommentProvider
      comments={comments}
      config={FINDINGS_COMMENT_CONFIG}
      resolveAnchor={lineRangeAnchorResolver}
      getAnchorTop={getAnchorTop}
      onScrollToAnchor={onScrollToAnchor}
      initialRailMode="all"
    >
      <CodeBody
        mounted={mounted}
        onMount={setMounted}
        contentElement={contentElement}
        findings={findings}
        {...props}
      />
    </CommentProvider>
  );
}
