import { useCallback, useMemo } from "react";
import { Badge } from "../Badge";
import { HoverCard } from "../../overlay/HoverCard";
import { Icon, type StaticIconComponent } from "../Icon";
import { Properties, type PropertiesItem } from "../Properties";
import { UiCopy, UiZoomIn, UiZoomOut } from "../../icons";
import { useDensityValue } from "../../hooks/use-density";
import { cn } from "../../lib/utils";
import {
  TagActionsContext,
  useTagActions,
  type NormalizedTag,
  type TagActionsContextValue,
} from "./tag-utils";

export function TagActionsProvider({
  value,
  children,
}: {
  value: TagActionsContextValue;
  children: React.ReactNode;
}) {
  return <TagActionsContext.Provider value={value}>{children}</TagActionsContext.Provider>;
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
  /**
   * When `true`, tag badges wrap onto multiple lines instead of staying on a
   * single row with a `+N` overflow popover. Used by detail/expanded views
   * (e.g. LogsTable row details) where vertical space is available.
   */
  wrap?: boolean;
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
  wrap = false,
}: TagListProps) {
  const density = useDensityValue();
  const isCompact = compact ?? density === "compact";

  if (tags.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (wrap) {
    return (
      <span className={cn("flex min-w-0 flex-wrap items-center gap-1", className)}>
        {tags.map((tag, index) => (
          <TagBadge
            key={`${tag.display}-${index}`}
            tag={tag}
            actions={actions}
            compact={isCompact}
          />
        ))}
      </span>
    );
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

export function TagPropertiesList({
  tags,
  rowClassName = "grid-cols-[minmax(4rem,8rem)_minmax(0,1fr)]",
}: {
  tags: NormalizedTag[];
  rowClassName?: string;
}) {
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
      rowClassName={rowClassName}
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

