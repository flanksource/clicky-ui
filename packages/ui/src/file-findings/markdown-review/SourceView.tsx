import { Icon } from "../../data/Icon";
import { cn } from "../../lib/utils";
import { CommentAuthorAvatar } from "../../comments/CommentAuthor";
import type { Comment } from "../../comments/comment-types";
import { getRoots, selectAnchorThreads } from "../../comments/comment-utils";
import { lineAnchor } from "../findings-comments";
import type { FileFinding } from "../types";
import { SEVERITY_MARK, bySeverityThenLine, severityOf, squiggleUnder } from "./marks";
import { lineSegments, type SourceMark } from "./source-marks";

/**
 * The raw markdown with line numbers; a line with findings carries its worst severity's rail icon, squiggle and messages.
 * Picking a message selects its finding in place: the view stays on Source, and Preview opens with it focused.
 * People's comments highlight their quote in the line and list under the line that ends it; picking one opens its thread there.
 */
export function SourceView({
  source,
  findings,
  marks,
  comments,
  selected,
  onSelect,
  onFocus,
}: {
  source: string;
  findings: readonly FileFinding[];
  marks: readonly SourceMark[];
  comments: Comment[];
  selected: string | null;
  onSelect: (finding: FileFinding) => void;
  onFocus: (anchor: string | null) => void;
}) {
  return (
    <ol className="py-2 font-mono text-xs leading-5">
      {source.split("\n").map((text, i) => {
        const line = i + 1;
        const here = findings.filter((f) => f.line === line).sort(bySeverityThenLine);
        const worst = here[0] ? SEVERITY_MARK[severityOf(here[0].severity)] : null;
        const threads = marks.filter((m) => m.spans.at(-1)?.line === line);
        return (
          <li key={line} data-source-line={line} className="grid grid-cols-[1.25rem_2.5rem_1fr] pr-3">
            <span className={cn("flex h-5 items-center justify-center", worst?.tone)}>{worst && <Icon icon={worst.icon} className="text-[13px]" />}</span>
            <span className="select-none pr-3 text-right text-muted-foreground tabular-nums">{line}</span>
            <span className="min-w-0 whitespace-pre-wrap break-words">
              <span data-source-text={line} style={worst ? squiggleUnder(worst.stroke) : undefined}>
                {text
                  ? lineSegments(text, line, marks).map((seg) =>
                      seg.anchors.length === 0 ? (
                        seg.text
                      ) : (
                        <mark
                          key={seg.start}
                          data-source-comment={JSON.stringify(seg.anchors)}
                          onClick={() => window.getSelection()?.isCollapsed && onFocus(seg.anchors[0]!)}
                          className={cn(
                            "cursor-pointer rounded-sm text-inherit",
                            seg.anchors.includes(selected ?? "")
                              ? "bg-amber-300 [[data-theme=dark]_&]:bg-amber-400/50"
                              : "bg-amber-200/60 [[data-theme=dark]_&]:bg-amber-400/25",
                          )}
                        >
                          {seg.text}
                        </mark>
                      ),
                    )
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
              {here.map((f) => (
                <button
                  key={`${f.rule}:${f.message}`}
                  type="button"
                  aria-pressed={selected === lineAnchor(f.line)}
                  onClick={() => onSelect(f)}
                  className={cn(
                    "flex w-full items-center gap-1.5 text-left font-sans text-[11px] hover:underline aria-pressed:font-semibold aria-pressed:underline",
                    SEVERITY_MARK[severityOf(f.severity)].tone,
                  )}
                >
                  <Icon icon={SEVERITY_MARK[severityOf(f.severity)].icon} />
                  <span className="text-foreground">{f.message}</span>
                  <span className="text-muted-foreground">{f.source} {f.rule}</span>
                </button>
              ))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
