import { cn } from "../../lib/utils";

export type ThreadStateFilterChipsProps = {
  /** Item count per state; chips are ordered by count, largest first. */
  counts: ReadonlyMap<string, number>;
  selected: ReadonlySet<string>;
  onToggle: (state: string) => void;
  /** Background class of the state's dot, e.g. `threadStateDot`. */
  dot: (state: string) => string;
  className?: string;
};

/** Toggleable per-state count chips shared by the stack dump and the JVM thread tree. */
export function ThreadStateFilterChips({ counts, selected, onToggle, dot, className }: ThreadStateFilterChipsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([state, count]) => {
          const active = selected.has(state);
          return (
            <button
              type="button"
              key={state}
              aria-pressed={active}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground hover:bg-background"
              }`}
              onClick={() => onToggle(state)}
            >
              <span className={`h-2 w-2 rounded-full ${dot(state)}`} />
              {state}
              <span className="text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
    </div>
  );
}
