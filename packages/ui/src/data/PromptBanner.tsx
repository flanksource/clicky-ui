import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/button";
import { Icon } from "./Icon";
import { UiCheck, UiClose, UiComment, UiHourglass, UiQuestion, UiRobotAi } from "../icons";
import { cn } from "../lib/utils";
import { answerPrompt, usePrompts, type PromptFilter, type PromptSnapshot } from "../hooks/use-prompts";
import { PromptDialog } from "./PromptDialog";
import {
  analyzePromptInlineActions,
  buildPromptInlineValues,
  initialPromptComment,
  summarizePromptAnswer,
  summarizePrompts,
  type PromptInlineDecision,
} from "./PromptBanner.model";

export interface PromptBannerProps extends PromptFilter {
  /** Base path the prompt API is mounted under, e.g. "/api/todos". */
  basePath?: string | undefined;
  enabled?: boolean | undefined;
  /** Override the headline; defaults to a count-aware message. */
  title?: string | undefined;
  className?: string | undefined;
  /** Render approve/reject quick actions when the prompt schema supports them. */
  inlineActions?: "auto" | false | undefined;
  /** Show compact counts and recent prompt outcomes, not only the current pending prompt. */
  showSummary?: boolean | undefined;
  /** Maximum recent prompts shown in the summary list. */
  historyLimit?: number | undefined;
}

// PromptBanner subscribes to pending prompts for a scope (owner / session label)
// and surfaces them as an inline affordance, opening a PromptDialog to answer.
// Mount it scoped to a todo (owner) at the top of a detail page, or to a session
// (labels.session) inside a session view using the same component and filters.
export function PromptBanner({
  basePath = "/api/todos",
  enabled,
  title,
  className,
  inlineActions = "auto",
  showSummary = true,
  historyLimit = 5,
  state: _ignoredState,
  ...filter
}: PromptBannerProps) {
  const { prompts, pending } = usePrompts({
    ...filter,
    basePath,
    ...(enabled !== undefined ? { enabled } : {}),
    ...(showSummary ? {} : { state: "pending" }),
  });
  const [active, setActive] = useState<PromptSnapshot | null>(null);
  const [comment, setComment] = useState("");
  const [resolving, setResolving] = useState<PromptInlineDecision | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = pending[0];
  const activePrompt = active ?? next;
  const inlineSpec = useMemo(
    () => (inlineActions === "auto" && activePrompt ? analyzePromptInlineActions(activePrompt) : null),
    [activePrompt, inlineActions],
  );
  const summary = useMemo(() => summarizePrompts(prompts), [prompts]);
  const recent = prompts.slice(0, Math.max(0, historyLimit));

  useEffect(() => {
    setComment(activePrompt ? initialPromptComment(activePrompt, inlineSpec) : "");
    setError(null);
    setResolving(null);
  }, [activePrompt?.id, inlineSpec]);

  if (showSummary ? prompts.length === 0 : !next) return null;
  const headline =
    title ??
    (pending.length > 1
      ? `${pending.length} questions need your input`
      : next?.title ?? "No pending prompts");

  const resolveInline = async (decision: PromptInlineDecision) => {
    if (!activePrompt || !inlineSpec) return;
    setResolving(decision);
    setError(null);
    try {
      await answerPrompt(basePath, activePrompt.id, {
        values: buildPromptInlineValues(activePrompt, inlineSpec, decision, comment),
      });
      setActive(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setResolving(null);
    }
  };

  const commentRequiredButEmpty = Boolean(inlineSpec?.commentRequired && comment.trim().length === 0);

  return (
    <section
      aria-label="Prompt requests"
      className={cn(
        "rounded-md border border-border bg-card px-3 py-2 text-card-foreground",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <Icon icon={next ? UiQuestion : UiRobotAi} className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{headline}</div>
              {next?.description ? (
                <div className="mt-0.5 line-clamp-2 text-xs opacity-80">{next.description}</div>
              ) : null}
            </div>
          </div>
          {showSummary ? <PromptSummaryCounts summary={summary} /> : null}
        </div>

        {next ? (
          <div className="flex flex-col gap-2">
            {inlineSpec ? (
              <div className="flex flex-col gap-2">
                {inlineSpec.commentField ? (
                  <label className="flex min-w-0 flex-col gap-1 text-xs">
                    <span className="font-medium">{inlineSpec.commentLabel ?? "Comment"}</span>
                    <textarea
                      className="min-h-16 w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Add a short note"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                    />
                  </label>
                ) : null}
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {error ? <span className="mr-auto text-xs text-red-600 dark:text-red-300">{error}</span> : null}
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    loading={resolving === "reject"}
                    disabled={resolving !== null || commentRequiredButEmpty}
                    onClick={() => void resolveInline("reject")}
                    className="gap-1.5"
                  >
                    <Icon icon={UiClose} className="size-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    loading={resolving === "approve"}
                    disabled={resolving !== null || commentRequiredButEmpty}
                    onClick={() => void resolveInline("approve")}
                    className="gap-1.5"
                  >
                    <Icon icon={UiCheck} className="size-3.5" />
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => setActive(next)}>
                    More
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <Button size="sm" type="button" onClick={() => setActive(next)}>
                  Answer
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {showSummary && recent.length > 0 ? <PromptHistory prompts={recent} activeId={next?.id} /> : null}
      </div>
      {active ? (
        <PromptDialog
          prompt={active}
          basePath={basePath}
          open={true}
          onClose={() => setActive(null)}
          onResolved={() => setActive(null)}
        />
      ) : null}
    </section>
  );
}

function PromptSummaryCounts({ summary }: { summary: ReturnType<typeof summarizePrompts> }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-85">
      <span className="inline-flex items-center gap-1 font-medium">
        <Icon icon={UiHourglass} className="size-3.5" />
        {summary.pending} pending
      </span>
      <span>{summary.answered} answered</span>
      {(summary.cancelled > 0 || summary.expired > 0) && (
        <span>{summary.cancelled + summary.expired} closed</span>
      )}
    </div>
  );
}

function PromptHistory({ prompts, activeId }: { prompts: PromptSnapshot[]; activeId?: string | undefined }) {
  return (
    <ol className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background text-xs">
      {prompts.map((prompt) => (
        <li
          key={prompt.id}
          className={cn("flex min-w-0 items-start gap-2 px-2 py-1.5", prompt.id === activeId && "bg-muted/60")}
        >
          <PromptStateIcon prompt={prompt} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium text-foreground">{prompt.title}</span>
              {prompt.kind ? <span className="shrink-0 text-muted-foreground">{prompt.kind}</span> : null}
            </div>
            <div className="mt-0.5 truncate text-muted-foreground">{summarizePromptAnswer(prompt)}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function PromptStateIcon({ prompt }: { prompt: PromptSnapshot }) {
  if (prompt.state === "answered") return <Icon icon={UiCheck} className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />;
  if (prompt.state === "cancelled" || prompt.state === "expired") {
    return <Icon icon={UiClose} className="mt-0.5 size-3.5 shrink-0 text-rose-600" />;
  }
  if (prompt.kind === "comment") return <Icon icon={UiComment} className="mt-0.5 size-3.5 shrink-0" />;
  return <Icon icon={UiHourglass} className="mt-0.5 size-3.5 shrink-0" />;
}
