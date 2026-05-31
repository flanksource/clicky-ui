import { createContext, useCallback, useContext, useMemo } from "react";
import { Badge } from "../Badge";
import { HoverCard } from "../../overlay/HoverCard";
import { Icon, type StaticIconComponent } from "../Icon";
import { Properties, type PropertiesItem } from "../Properties";
import { UiCopy, UiZoomIn, UiZoomOut } from "../../icons";
import { useDensityValue } from "../../hooks/use-density";
import { cn } from "../../lib/utils";
import type { FilterMode } from "../FilterPill";

export type TagInput = string | { key: string; value: string } | { name: string; value: string };

export type NormalizedTag = {
  key?: string;
  value: string;
  display: string;
  token: string;
};

export type TagsValue =
  | TagInput[]
  | Record<string, string | number | boolean | null>
  | null
  | undefined;

export type TagsOptions = {
  /** Number of tags to show inline before using the `+N` overflow popover. */
  maxVisible?: number;
  /** Separator between tag keys and values. Defaults to `=`. */
  separator?: string;
};

export function normalizeTags(value: TagsValue, separator = "="): NormalizedTag[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeOne(entry, separator)).filter((tag) => tag.value !== "");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, raw]): NormalizedTag | null => {
        if (raw == null) return null;
        const valueStr = String(raw).trim();
        if (!valueStr) return null;
        return {
          key,
          value: valueStr,
          display: `${key}${separator}${valueStr}`,
          token: `${key}${separator}${valueStr}`,
        } satisfies NormalizedTag;
      })
      .filter((tag): tag is NormalizedTag => tag !== null);
  }

  return [];
}

function normalizeOne(entry: TagInput, separator: string): NormalizedTag {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    const eq = trimmed.indexOf("=");
    const colon = trimmed.indexOf(":");
    const splitAt =
      eq >= 0 && (colon < 0 || eq < colon)
        ? eq
        : colon >= 0 && colon < trimmed.length - 1
          ? colon
          : -1;

    if (splitAt > 0) {
      const key = trimmed.slice(0, splitAt);
      const value = trimmed.slice(splitAt + 1);
      return {
        key,
        value,
        display: `${key}${separator}${value}`,
        token: `${key}${separator}${value}`,
      };
    }

    return { value: trimmed, display: trimmed, token: trimmed };
  }

  const key =
    "key" in entry && typeof entry.key === "string"
      ? entry.key
      : "name" in entry && typeof entry.name === "string"
        ? entry.name
        : undefined;
  const value = String(entry.value ?? "").trim();

  if (key) {
    return {
      key,
      value,
      display: `${key}${separator}${value}`,
      token: `${key}${separator}${value}`,
    };
  }
  return { value, display: value, token: value };
}

export function tagFilterTokens(value: TagsValue, separator = "="): string[] {
  return normalizeTags(value, separator).map((tag) => tag.token);
}

/**
 * Splits a token previously produced by `normalizeTags`/`tagFilterTokens`
 * back into its key and value parts using the same separator. Tokens
 * without a separator (bare tags) return `{ key: "", value: token }`.
 */
export function splitTagToken(token: string, separator = "="): { key: string; value: string } {
  const idx = token.indexOf(separator);
  if (idx <= 0) return { key: "", value: token };
  return {
    key: token.slice(0, idx),
    value: token.slice(idx + separator.length),
  };
}

// Filter mode mapping (re-using FilterPill's tri-state vocabulary so the wire
// shape matches DataTable's existing multiFilters state).
export type TagFilterMode = Extract<FilterMode, "include" | "exclude">;

export type TagActionsContextValue = {
  /** Returns the current mode for a token; "neutral" if the user hasn't acted on it. */
  getMode: (token: string) => FilterMode;
  /** Toggle include for this token (off → include → off). */
  toggleInclude: (token: string) => void;
  /** Toggle exclude for this token (off → exclude → off). */
  toggleExclude: (token: string) => void;
};

const noop: TagActionsContextValue = {
  getMode: () => "neutral",
  toggleInclude: () => {},
  toggleExclude: () => {},
};

const TagActionsContext = createContext<TagActionsContextValue>(noop);

export function TagActionsProvider({
  value,
  children,
}: {
  value: TagActionsContextValue;
  children: React.ReactNode;
}) {
  return <TagActionsContext.Provider value={value}>{children}</TagActionsContext.Provider>;
}

export function useTagActions(): TagActionsContextValue {
  return useContext(TagActionsContext);
}

export type TagListProps = {
  /** Normalized tags to render. */
  tags: NormalizedTag[];
  /** Number of tags to show inline before the overflow popover. */
  maxVisible?: number;
  /** Classes applied to the tag row. */
  className?: string;
  /** Whether copy/zoom actions appear on hover or inline. */
  actions?: "hover" | "inline";
  /**
   * When `true`, visible tag badges render only their value — the key is
   * dropped from the inline display. The full `key=value` text is still
   * available in `tag.display` (used for tooltips, copy actions, and the
   * overflow `+N` popover). Defaults to whether the surrounding density
   * (via {@link useDensityValue}) is `"compact"`.
   */
  compact?: boolean;
};

function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => undefined);
  }
}

function TagBadge({
  tag,
  actions: actionMode,
  compact = false,
}: {
  tag: NormalizedTag;
  actions: "hover" | "inline";
  compact?: boolean;
}) {
  const actions = useTagActions();
  const mode = actions.getMode(tag.token);

  const onPlus = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      actions.toggleInclude(tag.token);
    },
    [actions, tag.token],
  );
  const onMinus = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      actions.toggleExclude(tag.token);
    },
    [actions, tag.token],
  );
  const onCopy = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      copyToClipboard(tag.value);
    },
    [tag.value],
  );

  // Active state colors mirror FilterPill: include = green, exclude = red.
  const includeActive = mode === "include";
  const excludeActive = mode === "exclude";

  const showTooltip = compact && !!tag.key;
  const badge = (
    <span
      {...(showTooltip ? { title: tag.display } : {})}
      className={cn(
        "inline-flex items-center rounded-md border bg-background align-middle",
        includeActive
          ? "border-green-500/50 bg-green-500/5"
          : excludeActive
            ? "border-red-500/50 bg-red-500/5"
            : "border-border",
      )}
    >
      {tag.key && !compact ? (
        <Badge
          size="xs"
          variant="label"
          tone="neutral"
          label={tag.key}
          value={tag.value}
          maxWidth={32}
          truncate="auto"
          clickToCopy={false}
          className="border-transparent shadow-none"
        />
      ) : (
        <Badge
          size="xs"
          variant="soft"
          tone="neutral"
          maxWidth={32}
          truncate="auto"
          clickToCopy={false}
        >
          {tag.value}
        </Badge>
      )}
    </span>
  );

  const toolbar = (
    <span className="inline-flex items-center gap-0.5">
      <TagActionButton
        ariaLabel={`Include ${tag.display}`}
        onClick={onPlus}
        active={includeActive}
        activeClassName="bg-green-500/20 text-green-700 dark:text-green-400"
        icon={UiZoomIn}
      />
      <TagActionButton
        ariaLabel={`Exclude ${tag.display}`}
        onClick={onMinus}
        active={excludeActive}
        activeClassName="bg-red-500/20 text-red-700 dark:text-red-400"
        icon={UiZoomOut}
      />
      <TagActionButton ariaLabel={`Copy ${tag.display}`} onClick={onCopy} icon={UiCopy} />
    </span>
  );

  if (actionMode === "inline") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-md border border-border bg-background pr-0.5">
        {badge}
        {toolbar}
      </span>
    );
  }

  // Action icons live in a hover popover above the tag — the cell stays
  // clean, and hovering reveals the magnifier-plus / magnifier-minus / copy
  // toolbar.
  return (
    <HoverCard placement="top" delay={120} arrow={false} trigger={badge} cardClassName="!p-1">
      {toolbar}
    </HoverCard>
  );
}

function TagActionButton({
  ariaLabel,
  onClick,
  active,
  activeClassName,
  icon,
}: {
  ariaLabel: string;
  onClick: (event: React.MouseEvent) => void;
  active?: boolean;
  activeClassName?: string;
  icon: StaticIconComponent;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onClick}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground",
        "hover:bg-accent hover:text-foreground",
        active && activeClassName,
      )}
    >
      <Icon icon={icon} className="text-xs" />
    </button>
  );
}

export function TagList({
  tags,
  maxVisible = 3,
  className,
  actions = "hover",
  compact,
}: TagListProps) {
  const density = useDensityValue();
  const isCompact = compact ?? density === "compact";

  if (tags.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const visible = tags.slice(0, maxVisible);
  const overflow = tags.slice(maxVisible);

  return (
    <span className={cn("flex min-w-0 items-center gap-1", className)}>
      <span className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
        {visible.map((tag, index) => (
          <TagBadge
            key={`${tag.display}-${index}`}
            tag={tag}
            actions={actions}
            compact={isCompact}
          />
        ))}
      </span>
      {overflow.length > 0 && (
        <HoverCard
          placement="top"
          trigger={
            <Badge
              size="xs"
              variant="outlined"
              tone="neutral"
              clickToCopy={false}
              className="shrink-0"
            >
              +{overflow.length}
            </Badge>
          }
          cardClassName="min-w-72 max-w-[90vw] whitespace-normal !p-0"
        >
          <TagPropertiesList tags={overflow} />
        </HoverCard>
      )}
    </span>
  );
}

function TagPropertiesList({ tags }: { tags: NormalizedTag[] }) {
  const tagActions = useTagActions();
  const items = useMemo<PropertiesItem<NormalizedTag>[]>(
    () => tags.map((tag, index) => ({ key: `${tag.token}-${index}`, value: tag })),
    [tags],
  );

  return (
    <Properties<NormalizedTag>
      items={items}
      density="compact"
      className="border-0 bg-transparent"
      rowClassName="grid-cols-[minmax(4rem,8rem)_minmax(0,1fr)]"
      renderLabel={(_key, tag) =>
        tag.key ? (
          <span className="font-mono">{tag.key}</span>
        ) : (
          <span className="italic text-muted-foreground">tag</span>
        )
      }
      renderValue={(_key, tag) => (
        <span className="block truncate font-mono" title={tag.value}>
          {tag.value}
        </span>
      )}
      suffixActions={[
        {
          id: "include",
          icon: UiZoomIn,
          label: (_key, tag) => `Include ${tag.display}`,
          onClick: (_key, tag) => tagActions.toggleInclude(tag.token),
        },
        {
          id: "exclude",
          icon: UiZoomOut,
          label: (_key, tag) => `Exclude ${tag.display}`,
          onClick: (_key, tag) => tagActions.toggleExclude(tag.token),
        },
        {
          id: "copy",
          icon: UiCopy,
          label: (_key, tag) => `Copy ${tag.display}`,
          onClick: (_key, tag) => copyToClipboard(tag.value),
        },
      ]}
    />
  );
}

/**
 * Builds a TagActionsContextValue from a flat record-of-modes (the same
 * shape used by FilterBar's multi/nested-multi filters). Useful when
 * connecting DataTable's multiFilters state to the in-cell + / − buttons.
 */
export function tagActionsFromRecord(
  value: Record<string, TagFilterMode>,
  onChange: (next: Record<string, TagFilterMode>) => void,
): TagActionsContextValue {
  return {
    getMode: (token) => value[token] ?? "neutral",
    toggleInclude: (token) => {
      const next = { ...value };
      if (next[token] === "include") delete next[token];
      else next[token] = "include";
      onChange(next);
    },
    toggleExclude: (token) => {
      const next = { ...value };
      if (next[token] === "exclude") delete next[token];
      else next[token] = "exclude";
      onChange(next);
    },
  };
}

// Memoizing the context value avoids re-rendering every TagList cell on
// unrelated state changes.
export function useTagActionsValue(
  value: Record<string, TagFilterMode>,
  onChange: (next: Record<string, TagFilterMode>) => void,
): TagActionsContextValue {
  return useMemo(() => tagActionsFromRecord(value, onChange), [value, onChange]);
}
