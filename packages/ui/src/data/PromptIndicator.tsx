import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/button";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { Icon } from "./Icon";
import { UiQuestion } from "../icons";
import { cn } from "../lib/utils";
import { usePrompts, type PromptFilter, type PromptSnapshot } from "../hooks/use-prompts";
import type { LookupFetcher } from "../components/json-schema-form-runtime-types";
import { PromptDialog } from "./PromptDialog";
import { PromptList } from "./PromptList";
import { orderPrompts, summarizePrompts } from "./PromptBanner.model";
import { TEST_OUTCOMES } from "./test-runner/marks";

export interface PromptIndicatorProps extends PromptFilter {
  /** Base path the prompt API is mounted under, e.g. "/api/todos". */
  basePath?: string | undefined;
  enabled?: boolean | undefined;
  /** Classes for the trigger button. */
  className?: string | undefined;
  /** Passed to the answer dialog to resolve the schema's `x-clicky-lookup` fields. */
  lookupFetcher?: LookupFetcher | undefined;
  /**
   * Open each prompt's answer dialog once, as soon as it becomes pending:
   * closing it without answering leaves it pending in the panel rather than
   * reopening it.
   */
  autoOpen?: boolean | undefined;
}

// PromptIndicator is the compact form of PromptBanner for a header: "N pending"
// in amber while prompts wait, a muted "Prompts" otherwise. It toggles a panel
// listing the scope's prompts (pending first), and a pending one opens the
// answer dialog.
export function PromptIndicator({
  basePath = "/api/todos",
  enabled,
  className,
  lookupFetcher,
  autoOpen = false,
  state: _ignoredState,
  ...filter
}: PromptIndicatorProps) {
  const { prompts, pending } = usePrompts({ ...filter, basePath, ...(enabled !== undefined ? { enabled } : {}) });
  const [active, setActive] = useState<PromptSnapshot | null>(null);
  const ordered = useMemo(() => orderPrompts(prompts), [prompts]);
  const count = useMemo(() => summarizePrompts(prompts).pending, [prompts]);

  const autoOpened = useRef(new Set<string>());
  const unopened = autoOpen ? pending.find((prompt) => !autoOpened.current.has(prompt.id)) : undefined;
  useEffect(() => {
    if (!unopened || active) return;
    autoOpened.current.add(unopened.id);
    setActive(unopened);
  }, [unopened?.id, active]);

  const label = count > 0 ? `${count} pending` : "Prompts";
  return (
    <>
      <DropdownMenu
        role="dialog"
        menuLabel="Prompts"
        align="right"
        menuClassName="w-80 max-w-[calc(100vw-2rem)] p-1"
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title={count > 0 ? `${label} — answer from the list` : "No pending prompts"}
            className={cn("gap-1.5", count > 0 ? TEST_OUTCOMES.warned.className : "text-muted-foreground", className)}
          >
            <span className="relative inline-flex">
              <Icon icon={UiQuestion} className="size-4" />
              {count > 0 ? (
                <span data-prompt-pulse="" aria-hidden className="absolute -right-0.5 -top-0.5 size-1.5 animate-pulse rounded-full bg-current" />
              ) : null}
            </span>
            {label}
          </Button>
        }
      >
        {(close) =>
          ordered.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">No prompts</div>
          ) : (
            <PromptList
              prompts={ordered}
              activeId={active?.id}
              className="border-0"
              onSelect={(prompt) => {
                close();
                setActive(prompt);
              }}
            />
          )
        }
      </DropdownMenu>
      {active ? (
        <PromptDialog
          key={active.id}
          prompt={active}
          basePath={basePath}
          open={true}
          onClose={() => setActive(null)}
          onResolved={() => setActive(null)}
          lookupFetcher={lookupFetcher}
        />
      ) : null}
    </>
  );
}
