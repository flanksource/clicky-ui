import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiAdd, UiRemove } from "../../icons";
import { frameworkIcon } from "./frameworkIcon";
import { formatCount, type StatusCounts } from "./status";
import { cycleFilterState, type FilterMode, type TestFilters } from "./filterState";

export type TestFilterBarProps = {
  filters: TestFilters;
  onChange: (next: TestFilters) => void;
  counts: StatusCounts;
  frameworks: string[];
  className?: string;
};

type StatusDef = { key: keyof StatusCounts; label: string; badge: string };

const STATUS_DEFS: StatusDef[] = [
  { key: "failed", label: "Failed", badge: "bg-red-500" },
  { key: "warned", label: "Warned", badge: "bg-amber-400" },
  { key: "timedout", label: "Timed out", badge: "bg-amber-500" },
  { key: "passed", label: "Passed", badge: "bg-green-500" },
  { key: "skipped", label: "Skipped", badge: "bg-yellow-400" },
  { key: "running", label: "Running", badge: "bg-blue-500" },
  { key: "pending", label: "Queued", badge: "bg-muted-foreground" },
];

function pillClass(mode: FilterMode | undefined): string {
  if (mode === "include") return "bg-accent border-border font-medium text-foreground";
  if (mode === "exclude") return "bg-foreground text-background border-foreground font-medium";
  return "border-border text-muted-foreground hover:bg-accent";
}

function StateMarker({ mode }: { mode: FilterMode | undefined }) {
  if (mode === "include") return <Icon icon={UiAdd} className="text-xs" />;
  if (mode === "exclude") return <Icon icon={UiRemove} className="text-xs" />;
  return <span className="h-2 w-2 rounded-full bg-current opacity-30" aria-hidden />;
}

/**
 * Tri-state status + framework filter pills. Named TestFilterBar to avoid the
 * pre-existing generic `FilterBar` export in clicky-ui/components.
 */
export function TestFilterBar({
  filters,
  onChange,
  counts,
  frameworks,
  className,
}: TestFilterBarProps) {
  const hasActive = filters.status.size > 0 || filters.framework.size > 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {STATUS_DEFS.map((sf) => {
        const count = counts[sf.key];
        if (count === 0) return null;
        const mode = filters.status.get(sf.key);
        return (
          <button
            key={sf.key}
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-colors",
              pillClass(mode),
            )}
            onClick={() => onChange({ ...filters, status: cycleFilterState(filters.status, sf.key) })}
            title={`${sf.label}: ${mode ?? "neutral"}`}
          >
            <span
              className={cn(
                "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                sf.badge,
              )}
            >
              {formatCount(count)}
            </span>
            <StateMarker mode={mode} />
            {sf.label}
          </button>
        );
      })}

      {frameworks.length > 1 && (
        <>
          <span className="mx-0.5 text-border">|</span>
          {frameworks.map((fw) => {
            const icon = frameworkIcon(fw);
            const mode = filters.framework.get(fw);
            return (
              <button
                key={fw}
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                  pillClass(mode),
                )}
                onClick={() =>
                  onChange({ ...filters, framework: cycleFilterState(filters.framework, fw) })
                }
                title={`${fw}: ${mode ?? "neutral"}`}
              >
                <StateMarker mode={mode} />
                {icon && <Icon icon={icon} className="text-sm" />}
                {fw}
              </button>
            );
          })}
        </>
      )}

      {hasActive && (
        <button
          type="button"
          className="ml-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onChange({ status: new Map(), framework: new Map() })}
        >
          Clear
        </button>
      )}
    </div>
  );
}
