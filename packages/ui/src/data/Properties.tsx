import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";
import { formatPropertyLabel } from "./properties-utils";

export type PropertiesAction<V = unknown> = {
  id: string;
  icon: string;
  label: (key: string, value: V, item: PropertiesItem<V>) => string;
  visible?: (key: string, value: V, item: PropertiesItem<V>) => boolean;
  disabled?: (key: string, value: V, item: PropertiesItem<V>) => boolean;
  onClick: (key: string, value: V, item: PropertiesItem<V>) => void;
};

export type PropertiesItem<V = unknown> = {
  key: string;
  value: V;
  subtitle?: ReactNode;
  hidden?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
  renderChildren?: () => ReactNode;
};

export type PropertiesDensity = "comfortable" | "compact";

export type PropertiesProps<V = unknown> = {
  items: PropertiesItem<V>[];
  renderLabel?: (key: string, value: V, item: PropertiesItem<V>) => ReactNode;
  renderValue?: (key: string, value: V, item: PropertiesItem<V>) => ReactNode;
  labelIcon?: string | ((key: string, value: V, item: PropertiesItem<V>) => string | undefined);
  prefixActions?: PropertiesAction<V>[];
  suffixActions?: PropertiesAction<V>[];
  className?: string;
  rowClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  density?: PropertiesDensity;
  emptyMessage?: ReactNode;
};

const DENSITY_CLASSES: Record<
  PropertiesDensity,
  { row: string; label: string; value: string; gridCols: string }
> = {
  comfortable: {
    row: "px-density-3 py-density-2",
    label: "text-xs font-medium text-muted-foreground",
    value: "text-sm text-foreground",
    gridCols: "grid-cols-[minmax(7rem,12rem)_minmax(0,1fr)]",
  },
  compact: {
    row: "px-density-2 py-density-1.5",
    label: "font-mono text-[11px] text-muted-foreground",
    value: "text-xs text-foreground",
    gridCols: "grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)]",
  },
};

export function Properties<V = unknown>({
  items,
  renderLabel,
  renderValue,
  labelIcon,
  prefixActions,
  suffixActions,
  className,
  rowClassName,
  labelClassName,
  valueClassName,
  density = "comfortable",
  emptyMessage = "No properties",
}: PropertiesProps<V>) {
  const visible = items.filter((item) => !item.hidden);

  if (visible.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  const styles = DENSITY_CLASSES[density];

  return (
    <dl
      className={cn(
        "divide-y divide-border rounded-md border border-border bg-muted/20",
        className,
      )}
    >
      {visible.map((item) => {
        const iconName =
          typeof labelIcon === "function" ? labelIcon(item.key, item.value, item) : labelIcon;
        const renderedLabel = renderLabel
          ? renderLabel(item.key, item.value, item)
          : formatPropertyLabel(item.key);
        const ariaLabel = typeof renderedLabel === "string" ? renderedLabel : item.key;

        return (
          <div
            key={item.key}
            className={cn("grid min-w-0 gap-density-3", styles.gridCols, styles.row, rowClassName)}
          >
            <dt
              aria-label={ariaLabel}
              className={cn("min-w-0 truncate", styles.label, labelClassName)}
            >
              <div className="flex min-w-0 items-center gap-density-1">
                {iconName ? <Icon name={iconName} className="text-xs shrink-0" /> : null}
                <span className="min-w-0 truncate">{renderedLabel}</span>
              </div>
              {item.subtitle ? (
                <div className="mt-0.5 text-[10px] font-normal text-muted-foreground/80">
                  {item.subtitle}
                </div>
              ) : null}
            </dt>
            <dd className={cn("min-w-0 space-y-density-1", valueClassName)}>
              <div className="flex min-w-0 items-start gap-density-1">
                <ActionList actions={prefixActions} item={item} className="shrink-0 pt-0.5" />
                <div className={cn("min-w-0 max-w-full flex-1", styles.value)}>
                  {renderValue
                    ? renderValue(item.key, item.value, item)
                    : defaultRenderValue(item.value)}
                </div>
                <ActionList actions={suffixActions} item={item} className="shrink-0 pt-0.5" />
              </div>
              {item.expandable && item.expanded && item.renderChildren
                ? item.renderChildren()
                : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function ActionList<V>({
  actions,
  item,
  className,
}: {
  actions: PropertiesAction<V>[] | undefined;
  item: PropertiesItem<V>;
  className?: string;
}) {
  if (!actions || actions.length === 0) return null;
  const rendered = actions.filter(
    (action) => !action.visible || action.visible(item.key, item.value, item),
  );
  if (rendered.length === 0) return null;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {rendered.map((action) => (
        <PropertiesActionButton key={action.id} action={action} item={item} />
      ))}
    </span>
  );
}

function PropertiesActionButton<V>({
  action,
  item,
}: {
  action: PropertiesAction<V>;
  item: PropertiesItem<V>;
}) {
  const label = action.label(item.key, item.value, item);
  const disabled = action.disabled?.(item.key, item.value, item) ?? false;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground",
        "hover:bg-accent hover:text-foreground",
        "disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
      )}
      onClick={(event) => {
        event.stopPropagation();
        action.onClick(item.key, item.value, item);
      }}
    >
      <Icon name={action.icon} className="text-xs" />
    </button>
  );
}

function defaultRenderValue(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return <span className="font-mono italic text-muted-foreground">null</span>;
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="font-mono">{String(value)}</span>;
  }
  try {
    return (
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  } catch {
    return String(value);
  }
}
