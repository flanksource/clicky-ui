import { type Density } from "../hooks/use-density";
import { type Theme } from "../hooks/use-theme";
import { cn } from "../lib/utils";
import { UiEyeClosed } from "../icons";
import { Icon } from "./Icon";
import { Modal } from "../overlay/Modal";
import {
  DensityMenuSection,
  MenuActionSection,
  ThemeMenuSection,
} from "./DataTableMenuSections";
import { isColumnHideable, labelText } from "./data-table-utils";
import type { DataTableColumn, DataTableMenuAction } from "./DataTable";

// The phone counterpart to the floating ColumnVisibilityMenu: same section
// order and the same show*/on* contract, but rendered inside a full-height
// Modal sheet with 40px touch targets instead of a positioned popover. Wired
// in DataTable.tsx behind a `(max-width: 639px)` media query.
export type DataTablePreferencesSheetProps<T extends Record<string, unknown>> =
  {
    open: boolean;
    columns: DataTableColumn<T>[];
    hiddenColumns: Record<string, boolean>;
    activeColumnKey?: string | undefined;
    actions: DataTableMenuAction[];
    showColumnVisibilityControl: boolean;
    showDensityControl: boolean;
    showThemeControl: boolean;
    themeMenuValue: Theme | undefined;
    densityOverride: Density | undefined;
    visibleHideableColumnCount: number;
    onToggle: (column: DataTableColumn<T>) => void;
    onShowAll: () => void;
    onDensityChange: (density: Density | undefined) => void;
    onThemeChange?: (theme: Theme) => void;
    onClose: () => void;
  };

export function DataTablePreferencesSheet<T extends Record<string, unknown>>({
  open,
  columns,
  hiddenColumns,
  activeColumnKey,
  actions,
  showColumnVisibilityControl,
  showDensityControl,
  showThemeControl,
  themeMenuValue,
  densityOverride,
  visibleHideableColumnCount,
  onToggle,
  onShowAll,
  onDensityChange,
  onThemeChange,
  onClose,
}: DataTablePreferencesSheetProps<T>) {
  const activeColumn = activeColumnKey
    ? columns.find((column) => column.key === activeColumnKey)
    : undefined;
  const canHideActiveColumn =
    activeColumn &&
    isColumnHideable(activeColumn) &&
    visibleHideableColumnCount > 1;
  const hasActions = actions.length > 0;

  return (
    <Modal open={open} onClose={onClose} title="Table options" size="sm" scrollBody>
      {showColumnVisibilityControl && (
        <>
          <div className="flex items-center justify-between gap-3 px-2 py-1.5 text-xs font-medium text-muted-foreground">
            <span>Columns</span>
            <button
              type="button"
              className="min-h-10 rounded px-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none"
              onClick={onShowAll}
            >
              Show all
            </button>
          </div>

          {activeColumn && (
            <>
              <button
                type="button"
                disabled={!canHideActiveColumn}
                className={cn(
                  "flex min-h-10 w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none",
                  !canHideActiveColumn && "cursor-not-allowed opacity-50",
                )}
                onClick={() => {
                  if (!canHideActiveColumn) return;
                  onToggle(activeColumn);
                  onClose();
                }}
              >
                <Icon
                  icon={UiEyeClosed}
                  className="text-sm text-muted-foreground"
                />
                <span>Hide {labelText(activeColumn)}</span>
              </button>
              <div className="my-1 h-px bg-border" />
            </>
          )}

          <div>
            {columns.map((column) => {
              const hideable = isColumnHideable(column);
              const visible = hiddenColumns[column.key] !== true;
              const disabled =
                !hideable || (visible && visibleHideableColumnCount <= 1);
              return (
                <label
                  key={column.key}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-border"
                    checked={visible}
                    disabled={disabled}
                    onChange={() => onToggle(column)}
                  />
                  <span className="truncate">{labelText(column)}</span>
                </label>
              );
            })}
          </div>
        </>
      )}

      {showDensityControl && (
        <DensityMenuSection
          densityOverride={densityOverride}
          separated={showColumnVisibilityControl}
          onDensityChange={onDensityChange}
          size="sheet"
        />
      )}

      {hasActions && (
        <MenuActionSection
          actions={actions}
          separated={showColumnVisibilityControl || showDensityControl}
          onClose={onClose}
          size="sheet"
        />
      )}

      {showThemeControl && onThemeChange && (
        <ThemeMenuSection
          value={themeMenuValue ?? "system"}
          separated={
            showColumnVisibilityControl || showDensityControl || hasActions
          }
          onChange={onThemeChange}
          size="sheet"
        />
      )}
    </Modal>
  );
}
