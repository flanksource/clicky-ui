import { useEffect, useState, type ReactNode } from "react";
import { IconButton } from "../components/IconButton";
import {
  UiCheck,
  UiDotsVertical,
  UiListDashes,
  UiListFlat,
  UiRows,
} from "../icons";
import { cn } from "../lib/utils";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { Icon, type StaticIconComponent } from "./Icon";
import { formatPropertyLabel } from "./properties-utils";

export type PropertiesAction<V = unknown> = {
  /** Stable action id. */
  id: string;
  /** Iconify name or imported icon component. */
  icon: string | StaticIconComponent;
  /** Accessible label and tooltip for this row action. */
  label: (key: string, value: V, item: PropertiesItem<V>) => string;
  /** Return false to hide the action for a specific row. */
  visible?: (key: string, value: V, item: PropertiesItem<V>) => boolean;
  /** Return true to disable the action for a specific row. */
  disabled?: (key: string, value: V, item: PropertiesItem<V>) => boolean;
  /** Called when the row action is clicked. */
  onClick: (key: string, value: V, item: PropertiesItem<V>) => void;
};

export type PropertiesItem<V = unknown> = {
  /** Stable property key. Also used as the default label. */
  key: string;
  /** Property value passed to renderers and actions. */
  value: V;
  /** Secondary text shown below the label. */
  subtitle?: ReactNode;
  /** Hide this row without removing it from the item array. */
  hidden?: boolean;
  /** Enables an expandable child area below the row value. */
  expandable?: boolean;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Called when an expandable row is toggled. */
  onToggle?: (next: boolean) => void;
  /** Child content rendered when the row is expanded. */
  renderChildren?: () => ReactNode;
};

export type PropertiesDensity = "comfortable" | "compact" | "spacious";

export type PropertiesProps<V = unknown> = {
  /** Property rows to render. Hidden items are filtered out. */
  items: PropertiesItem<V>[];
  /** Custom label renderer. */
  renderLabel?: (key: string, value: V, item: PropertiesItem<V>) => ReactNode;
  /** Custom value renderer. */
  renderValue?: (key: string, value: V, item: PropertiesItem<V>) => ReactNode;
  /** Static icon name or function that returns an icon name per row. */
  labelIcon?: string | ((key: string, value: V, item: PropertiesItem<V>) => string | undefined);
  /** Actions rendered before the value. */
  prefixActions?: PropertiesAction<V>[];
  /** Actions rendered after the value. */
  suffixActions?: PropertiesAction<V>[];
  /** Classes applied to the list root. */
  className?: string;
  /** Classes applied to each row. */
  rowClassName?: string;
  /** CSS grid columns applied to each row. Defaults to the selected density preset. */
  gridTemplateColumns?: string;
  /** Classes applied to each label cell. */
  labelClassName?: string;
  /** Classes applied to each value cell. */
  valueClassName?: string;
  /** Row density preset. */
  density?: PropertiesDensity;
  /** Stable reference used to persist this instance's density preference. */
  keyRef?: string;
  /** Show the display-options menu. */
  showDensityMenu?: boolean;
  /** Empty-state content when no rows are visible. */
  emptyMessage?: ReactNode;
};

const PROPERTIES_DENSITY_STORAGE_PREFIX = "clicky-ui-properties";

const PROPERTIES_DENSITY_OPTIONS: Array<{
  value: PropertiesDensity;
  label: string;
  icon: StaticIconComponent;
}> = [
  { value: "compact", label: "Compact", icon: UiRows },
  { value: "comfortable", label: "Comfortable", icon: UiListFlat },
  { value: "spacious", label: "Spacious", icon: UiListDashes },
];

const DENSITY_CLASSES: Record<
  PropertiesDensity,
  { row: string; label: string; value: string; gridTemplateColumns: string }
> = {
  spacious: {
    row: "px-density-4 py-density-3",
    label: "text-sm font-medium text-muted-foreground",
    value: "text-base text-foreground",
    gridTemplateColumns: "minmax(12rem, 20rem) minmax(0, 1fr)",
  },
  comfortable: {
    row: "px-density-3 py-density-2",
    label: "text-xs font-medium text-muted-foreground",
    value: "text-sm text-foreground",
    gridTemplateColumns: "minmax(7rem, 12rem) minmax(0, 1fr)",
  },
  compact: {
    row: "px-density-2 py-density-1.5",
    label: "font-mono text-[11px] text-muted-foreground",
    value: "text-xs text-foreground",
    gridTemplateColumns: "minmax(8rem, 14rem) minmax(0, 1fr)",
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
  gridTemplateColumns,
  labelClassName,
  valueClassName,
  density = "comfortable",
  keyRef,
  showDensityMenu = true,
  emptyMessage = "No properties",
}: PropertiesProps<V>) {
  const [densityOverride, setDensityOverride] = useState<PropertiesDensity>();
  useEffect(() => setDensityOverride(readStoredDensity(keyRef)), [keyRef]);

  const visible = items.filter((item) => !item.hidden);

  if (visible.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  const activeDensity = densityOverride ?? density;
  const styles = DENSITY_CLASSES[activeDensity];

  const updateDensity = (next: PropertiesDensity) => {
    setDensityOverride(next);
    writeStoredDensity(keyRef, next);
  };

  return (
    <dl
      className={cn(
        "divide-y divide-border rounded-md border border-border bg-muted/20",
        className,
      )}
    >
      {showDensityMenu ? (
        <div className="flex items-center justify-end px-density-2 py-density-1">
          <dt className="sr-only">Properties display options</dt>
          <dd>
            <PropertiesDensityMenu density={activeDensity} onChange={updateDensity} />
          </dd>
        </div>
      ) : null}
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
            className={cn("grid min-w-0 gap-density-3", styles.row, rowClassName)}
            style={{ gridTemplateColumns: gridTemplateColumns ?? styles.gridTemplateColumns }}
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

function PropertiesDensityMenu({
  density,
  onChange,
}: {
  density: PropertiesDensity;
  onChange: (density: PropertiesDensity) => void;
}) {
  return (
    <DropdownMenu
      align="right"
      menuLabel="Properties options"
      trigger={
        <IconButton
          icon={UiDotsVertical}
          label="Properties options"
          className="h-6 w-6"
        />
      }
    >
      {(closeMenu) => (
        <div className="min-w-44 py-1 text-popover-foreground">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Density
          </div>
          {PROPERTIES_DENSITY_OPTIONS.map((option) => {
            const active = density === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={densityMenuItemClassName(active)}
                onClick={() => {
                  onChange(option.value);
                  closeMenu();
                }}
              >
                <Icon
                  icon={option.icon}
                  className="text-sm text-muted-foreground"
                />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {active ? (
                  <Icon icon={UiCheck} className="text-sm text-foreground" />
                ) : (
                  <span className="inline-block h-4 w-4" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      )}
    </DropdownMenu>
  );
}

function densityMenuItemClassName(active: boolean): string {
  return cn(
    "flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm",
    "hover:bg-accent focus:bg-accent focus:outline-none",
    active && "bg-accent/60",
  );
}

function readStoredDensity(
  keyRef: string | undefined,
): PropertiesDensity | undefined {
  const storageKey = propertiesDensityStorageKey(keyRef);
  if (!storageKey || typeof window === "undefined") return undefined;

  try {
    const value = window.localStorage.getItem(storageKey);
    return isPropertiesDensity(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredDensity(
  keyRef: string | undefined,
  density: PropertiesDensity,
): void {
  const storageKey = propertiesDensityStorageKey(keyRef);
  if (!storageKey || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, density);
  } catch {
    // Display preferences are best-effort when browser storage is unavailable.
  }
}

function propertiesDensityStorageKey(
  keyRef: string | undefined,
): string | undefined {
  const normalized = keyRef?.trim();
  return normalized
    ? `${PROPERTIES_DENSITY_STORAGE_PREFIX}:${normalized}:density`
    : undefined;
}

function isPropertiesDensity(value: unknown): value is PropertiesDensity {
  return value === "compact" || value === "comfortable" || value === "spacious";
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
    <span className={cn("inline-flex items-center", className)}>
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
      <Icon
        {...(typeof action.icon === "string" ? { name: action.icon } : { icon: action.icon })}
        className="text-xs"
      />
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
