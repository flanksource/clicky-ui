import type { ReactNode } from "react";
import type { HighlightedLine } from "../../data/code-highlight";
import { Icon } from "../../data/Icon";
import { tokenStyle } from "../../data/token-style";
import { cn } from "../../lib/utils";
import { CommentAuthorAvatar } from "../../comments/CommentAuthor";
import type { Comment } from "../../comments/comment-types";
import { getRoots, selectAnchorThreads } from "../../comments/comment-utils";
import { lineAnchor } from "../findings-comments";
import type { FileFinding } from "../types";
import { blameAge, isUncommitted, type BlameLine } from "./blame";
import { SEVERITY_MARK, bySeverityThenLine, severityOf, squiggleUnder } from "./marks";
import { lineSegments, type SourceMark } from "./source-marks";

/** One line's blame cell: the commit where its range opens, and an age bar on every line of the range. */
function BlameCell({ blame }: { blame: BlameLine | undefined }) {
  if (!blame) return <span />;
  const { commit, first, recency } = blame;
  const uncommitted = isUncommitted(commit);
  return (
    <span
      data-blame-sha={first ? commit.sha : undefined}
      title={uncommitted ? "Not committed yet" : `${commit.sha.slice(0, 12)} · ${commit.author} · ${commit.date.slice(0, 10)}\n${commit.summary}`}
      className={cn("relative flex min-w-0 items-start gap-1.5 pl-2 pr-2 font-sans text-[11px] text-muted-foreground", first && "border-t border-border/60")}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-[3px]", uncommitted ? "bg-amber-500" : "bg-sky-500")}
        style={{ opacity: uncommitted ? 1 : 0.15 + 0.85 * recency }}
      />
      {first &&
        (uncommitted ? (
          <span className="italic">Uncommitted</span>
        ) : (
          <>
            <span className="shrink-0 font-mono text-foreground/70">{commit.sha.slice(0, 7)}</span>
            <span className="min-w-0 flex-1 truncate">{commit.author}</span>
            <span className="shrink-0 tabular-nums">{blameAge(commit.date)}</span>
          </>
        ))}
    </span>
  );
}

/**
 * The source with line numbers, syntax colours when `tokens` are given, and a
 * blame column when `blame` is; a line with findings carries its worst
 * severity's rail icon, squiggle and messages. Picking a message selects its
 * finding. With `showFindings` off only the selected line lists its messages,
 * and the rail icon picks a line, the way a comment highlight opens its thread.
 * People's comments highlight their quote and list under the line that ends
 * it; picking one opens its thread there.
 */
export function SourceView({
  source,
  tokens,
  blame,
  findings,
  showFindings,
  marks,
  comments,
  selected,
  onSelect,
  onFocus,
  renderFindingActions,
}: {
  source: string;
  tokens: readonly HighlightedLine[] | null;
  blame: ReadonlyMap<number, BlameLine> | null;
  findings: readonly FileFinding[];
  showFindings: boolean;
  marks: readonly SourceMark[];
  comments: Comment[];
  selected: string | null;
  onSelect: (finding: FileFinding) => void;
  onFocus: (anchor: string | null) => void;
  renderFindingActions?: ((finding: FileFinding) => ReactNode) | undefined;
}) {
  return (
    <ol className="py-2 font-mono text-xs leading-5">
      {source.split("\n").map((text, i) => {
        const line = i + 1;
        const here = findings.filter((f) => f.line === line).sort(bySeverityThenLine);
        const worst = here[0] ? SEVERITY_MARK[severityOf(here[0].severity)] : null;
        const threads = marks.filter((m) => m.spans.at(-1)?.line === line);
        const listed = showFindings || selected === lineAnchor(line) ? here : [];
        return (
          <li
            key={line}
            data-source-line={line}
            className={cn("grid pr-3", blame ? "grid-cols-[13rem_1.25rem_2.5rem_1fr]" : "grid-cols-[1.25rem_2.5rem_1fr]")}
          >
            {blame && <BlameCell blame={blame.get(line)} />}
            {worst && !showFindings ? (
              <button
                type="button"
                data-source-mark={line}
                aria-label={`${here.length} ${here.length === 1 ? "finding" : "findings"} on line ${line}`}
                aria-pressed={selected === lineAnchor(line)}
                onClick={() => (selected === lineAnchor(line) ? onFocus(null) : onSelect(here[0]!))}
                className={cn("flex h-5 items-center justify-center rounded-sm hover:bg-muted", worst.tone)}
              >
                <Icon icon={worst.icon} className="text-[13px]" />
              </button>
            ) : (
              <span className={cn("flex h-5 items-center justify-center", worst?.tone)}>{worst && <Icon icon={worst.icon} className="text-[13px]" />}</span>
            )}
            <span className="select-none pr-3 text-right text-muted-foreground tabular-nums">{line}</span>
            <span className="min-w-0 whitespace-pre-wrap break-words">
              <span data-source-text={line} style={worst ? squiggleUnder(worst.stroke) : undefined}>
                {text
                  ? lineSegments(text, line, marks, tokens?.[i]).map((seg) => {
                      const style = seg.token ? tokenStyle(seg.token) : undefined;
                      return seg.anchors.length === 0 ? (
                        <span key={seg.start} style={style}>
                          {seg.text}
                        </span>
                      ) : (
                        <mark
                          key={seg.start}
                          data-source-comment={JSON.stringify(seg.anchors)}
                          onClick={() => window.getSelection()?.isCollapsed && onFocus(seg.anchors[0]!)}
                          style={style}
                          className={cn(
                            "cursor-pointer rounded-sm text-inherit",
                            seg.anchors.includes(selected ?? "")
                              ? "bg-amber-300 [[data-theme=dark]_&]:bg-amber-400/50"
                              : "bg-amber-200/60 [[data-theme=dark]_&]:bg-amber-400/25",
                          )}
                        >
                          {seg.text}
                        </mark>
                      );
                    })
                  : " "}
              </span>
              {threads.map(({ anchor }) => {
                const thread = selectAnchorThreads(comments, anchor);
                const root = getRoots(thread)[0];
                if (!root) return null;
                return (
                  <button
                    key={anchor}
                    type="button"
                    data-source-thread={anchor}
                    onClick={() => onFocus(anchor)}
                    className="flex w-full items-center gap-1.5 text-left font-sans text-[11px] text-amber-600 hover:underline [[data-theme=dark]_&]:text-amber-400"
                  >
                    <CommentAuthorAvatar author={root.author ?? null} size="xs" bare />
                    <span className="shrink-0 font-medium text-foreground">{root.author?.name}</span>
                    <span className="truncate text-muted-foreground">{root.body}</span>
                    {thread.length > 1 && <span className="shrink-0 text-muted-foreground">· {thread.length - 1} {thread.length === 2 ? "reply" : "replies"}</span>}
                  </button>
                );
              })}
              {listed.map((f) => (
                <span key={`${f.rule}:${f.message}`} data-source-finding={f.line} className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={selected === lineAnchor(f.line)}
                    onClick={() => onSelect(f)}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-1.5 text-left font-sans text-[11px] hover:underline aria-pressed:font-semibold aria-pressed:underline",
                      SEVERITY_MARK[severityOf(f.severity)].tone,
                    )}
                  >
                    <Icon icon={SEVERITY_MARK[severityOf(f.severity)].icon} />
                    <span className="text-foreground">{f.message}</span>
                    <span className="text-muted-foreground">{f.source} {f.rule}</span>
                  </button>
                  {renderFindingActions?.(f)}
                </span>
              ))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
