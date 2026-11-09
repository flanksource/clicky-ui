import { Icon } from "./Icon";
import { UiCheck, UiClose, UiComment, UiHourglass } from "../icons";
import { cn } from "../lib/utils";
import type { PromptSnapshot } from "../hooks/use-prompts";
import { summarizePromptAnswer } from "./PromptBanner.model";

export interface PromptListProps {
  /** Rendered in the given order; `orderPrompts` puts pending first. */
  prompts: readonly PromptSnapshot[];
  /** Highlights the prompt currently being answered. */
  activeId?: string | undefined;
  /** Makes each pending prompt a button that answers it; answered and closed prompts stay read-only. */
  onSelect?: ((prompt: PromptSnapshot) => void) | undefined;
  className?: string | undefined;
}

/** Each prompt's state, title, kind and answer summary — the list PromptBanner and PromptIndicator share. */
export function PromptList({ prompts, activeId, onSelect, className }: PromptListProps) {
  return (
    <ol className={cn("divide-y divide-border overflow-hidden rounded-md border border-border bg-background text-xs", className)}>
      {prompts.map((prompt) => {
        const rowClass = cn("flex w-full min-w-0 items-start gap-2 px-2 py-1.5 text-left", prompt.id === activeId && "bg-muted/60");
        return (
          <li key={prompt.id}>
            {onSelect && prompt.state === "pending" ? (
              <button type="button" className={cn(rowClass, "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none")} onClick={() => onSelect(prompt)}>
                <PromptRow prompt={prompt} />
              </button>
            ) : (
              <div className={rowClass}>
                <PromptRow prompt={prompt} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function PromptRow({ prompt }: { prompt: PromptSnapshot }) {
  return (
    <>
      <PromptStateIcon prompt={prompt} />
      <span className="block min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-foreground" data-testid="prompt-list-title">{prompt.title}</span>
          {prompt.kind ? <span className="shrink-0 text-muted-foreground">{prompt.kind}</span> : null}
        </span>
        <span className="mt-0.5 block truncate text-muted-foreground">{summarizePromptAnswer(prompt)}</span>
      </span>
    </>
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
