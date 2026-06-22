import { cn } from "../lib/utils";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { Icon } from "../data/Icon";
import { UiCheck, UiClose } from "../icons";
import { hasActiveFilters, resolveStatusConfig } from "./comment-utils";
import type {
  CommentConfig,
  CommentFacet,
  CommentFilters,
} from "./comment-types";

export type CommentFilterBarProps = {
  config: CommentConfig;
  filters: CommentFilters;
  onChange: (filters: CommentFilters) => void;
  /** Optional per-status counts shown on the toggles. */
  statusCounts?: Record<string, number>;
};

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function StatusToggle({
  value,
  active,
  config,
  count,
  onClick,
}: {
  value: string;
  active: boolean;
  config: CommentConfig;
  count?: number;
  onClick: () => void;
}) {
  const cfg = resolveStatusConfig(config, value);
  if (!cfg) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {cfg.icon && (
        <Icon
          {...(typeof cfg.icon === "string"
            ? { name: cfg.icon }
            : { icon: cfg.icon })}
          className="text-[10px]"
        />
      )}
      {cfg.label}
      {count !== undefined && (
        <span className="text-muted-foreground">{count}</span>
      )}
    </button>
  );
}

function FacetFilter({
  facet,
  selected,
  onChange,
}: {
  facet: CommentFacet;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const label =
    selected.size > 0 ? `${facet.label} (${selected.size})` : facet.label;
  return (
    <DropdownMenu
      label={label}
      size="sm"
      variant={selected.size > 0 ? "secondary" : "outline"}
      menuClassName="min-w-[170px]"
    >
      {() => (
        <div className="py-1">
          {facet.options.map((option) => {
            const checked = selected.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(toggleInSet(selected, option.value))}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <span
                  className={cn(
                    "inline-flex size-3.5 items-center justify-center rounded border",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {checked && <Icon icon={UiCheck} className="text-[9px]" />}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </DropdownMenu>
  );
}

/**
 * Filter controls for a comment list: status toggle pills, a multi-select per
 * configured facet, and a clear action. Fully controlled via `filters` /
 * `onChange`; pair with `applyCommentFilters` to filter the data.
 */
export function CommentFilterBar({
  config,
  filters,
  onChange,
  statusCounts,
}: CommentFilterBarProps) {
  function setStatuses(next: Set<string>) {
    onChange({ ...filters, statuses: next });
  }
  function setFacet(key: string, next: Set<string>) {
    onChange({ ...filters, facets: { ...filters.facets, [key]: next } });
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      data-testid="comment-filter-bar"
    >
      {config.statuses.map((status) => (
        <StatusToggle
          key={status.value}
          value={status.value}
          active={filters.statuses.has(status.value)}
          config={config}
          {...(statusCounts?.[status.value] !== undefined
            ? { count: statusCounts[status.value] }
            : {})}
          onClick={() =>
            setStatuses(toggleInSet(filters.statuses, status.value))
          }
        />
      ))}
      {(config.facets ?? []).map((facet) => (
        <FacetFilter
          key={facet.key}
          facet={facet}
          selected={filters.facets[facet.key] ?? new Set()}
          onChange={(next) => setFacet(facet.key, next)}
        />
      ))}
      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={() =>
            onChange({ statuses: new Set(), facets: {}, authorKind: "all" })
          }
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Icon icon={UiClose} className="text-[10px]" /> Clear
        </button>
      )}
    </div>
  );
}
