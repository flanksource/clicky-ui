import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../components/button";
import { highlightToLines, type HighlightedLine } from "../../data/code-highlight";
import { HighlightedTokens } from "../../data/HighlightedTokens";
import { useResolvedTheme } from "../../hooks/use-theme";
import { cn } from "../../lib/utils";
import type { LineRange } from "../model/class-fold";
import { gutterLabel } from "../model/source-lines";

export type DecompiledSourceReaderProps = {
  source: string;
  /** Original bytecode line per row (index = row), 0 where unmapped. */
  sourceLineNumbers: readonly number[];
  /** Fold the class down to these 1-based lines; the rest stays one click away. */
  focusRange: LineRange | null;
  /** 0-based row to highlight and scroll to, -1 for none. */
  highlightRow: number;
  /** Receives the clicked 0-based row. */
  onSelectRow?: ((row: number) => void) | undefined;
};

function HiddenLines({ count, direction, onShow }: { count: number; direction: "above" | "below"; onShow: () => void }) {
  if (count <= 0) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-5 w-full justify-start rounded-none px-2 font-sans text-[11px] text-muted-foreground"
      aria-label={`Show ${count} hidden line${count === 1 ? "" : "s"} ${direction}`}
      onClick={onShow}
    >
      ⋯ {count} line{count === 1 ? "" : "s"} hidden
    </Button>
  );
}

/**
 * Read-only decompiled source with the bytecode line numbers in the gutter.
 * Painted row by row (not with a code block) because the numbers have gaps an
 * automatic gutter would renumber. Needs no editor, so it works wherever
 * Monaco is not set up.
 */
export function DecompiledSourceReader({ source, sourceLineNumbers, focusRange, highlightRow, onSelectRow }: DecompiledSourceReaderProps) {
  const lines = useMemo(() => source.split("\n"), [source]);
  const theme = useResolvedTheme();
  const [tokens, setTokens] = useState<HighlightedLine[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const highlightedRow = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    void highlightToLines(source, { lang: "java", theme: theme === "dark" ? "github-dark" : "github-light" }).then((out) => {
      if (!cancelled) setTokens(out);
    });
    return () => {
      cancelled = true;
    };
  }, [source, theme]);

  useEffect(() => {
    // jsdom has no scrollIntoView; every browser does.
    highlightedRow.current?.scrollIntoView?.({ block: "center" });
  }, [highlightRow, focusRange?.startLine, expanded, source]);

  // A newly picked method folds again, even if the last one was unfolded.
  useEffect(() => setExpanded(false), [focusRange?.startLine, focusRange?.endLine]);

  const first = focusRange && !expanded ? focusRange.startLine - 1 : 0;
  const last = focusRange && !expanded ? focusRange.endLine - 1 : lines.length - 1;
  const rows = lines.slice(first, last + 1);

  return (
    <div className="flex min-h-0 flex-col">
      {focusRange ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
          <span>
            Method at lines {focusRange.startLine}–{focusRange.endLine} of {lines.length}
          </span>
          <Button type="button" variant="ghost" size="sm" className="h-5 px-2 text-[11px]" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Fold to method" : "Show whole class"}
          </Button>
        </div>
      ) : null}
      <div data-scroll-x className="min-h-0 flex-1 overflow-auto py-1 font-mono text-xs leading-relaxed">
        <HiddenLines count={first} direction="above" onShow={() => setExpanded(true)} />
        {rows.map((text, offset) => {
          const index = first + offset;
          const inFocus = focusRange !== null && index + 1 >= focusRange.startLine && index + 1 <= focusRange.endLine;
          const highlighted = index === highlightRow;
          return (
            <div
              key={index}
              ref={highlighted ? highlightedRow : undefined}
              data-row={index}
              data-highlighted={highlighted ? "true" : undefined}
              data-in-focus={inFocus ? "true" : undefined}
              onClick={onSelectRow ? () => onSelectRow(index) : undefined}
              className={cn(
                "grid min-w-max grid-cols-[3.5rem_1fr] gap-3 px-2",
                onSelectRow && "cursor-pointer hover:bg-accent/50",
                inFocus && "bg-primary/5",
                highlighted && "bg-primary/20 font-semibold",
              )}
            >
              <span data-gutter className="select-none text-right text-muted-foreground">
                {gutterLabel(sourceLineNumbers, index)}
              </span>
              <code className="whitespace-pre">{text ? <HighlightedTokens tokens={tokens?.[index]} content={text} /> : " "}</code>
            </div>
          );
        })}
        <HiddenLines count={lines.length - 1 - last} direction="below" onShow={() => setExpanded(true)} />
      </div>
    </div>
  );
}
