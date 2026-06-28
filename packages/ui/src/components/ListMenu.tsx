import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "./button";
import {
  ListMenuSelectionContext,
  useListMenuSelectionContext,
  type ListMenuSelection,
} from "./use-list-menu-selection";

export type ListMenuProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Enables multi-select. Pass the object returned by `useListMenuSelection`;
   * rows that set `itemKey` then become selectable via checkbox or Shift+Click.
   */
  selection?: ListMenuSelection;
  /** Render a leading checkbox on selectable rows (default true when `selection` is set). */
  showCheckboxes?: boolean;
};

export function ListMenu({
  className,
  selection,
  showCheckboxes = true,
  children,
  ...props
}: ListMenuProps) {
  const menu = (
    <div className={cn("divide-y divide-border", className)} {...props}>
      {children}
    </div>
  );
  if (!selection) return menu;
  return (
    <ListMenuSelectionContext.Provider value={{ selection, showCheckboxes }}>
      {menu}
    </ListMenuSelectionContext.Provider>
  );
}

export type ListMenuSectionProps = HTMLAttributes<HTMLDivElement>;

export function ListMenuSection({ className, ...props }: ListMenuSectionProps) {
  return <div className={className} {...props} />;
}

export type ListMenuHeaderProps = HTMLAttributes<HTMLDivElement>;

export function ListMenuHeader({ className, ...props }: ListMenuHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex w-full items-center gap-2 border-b border-border bg-muted px-3 py-1.5",
        className,
      )}
      {...props}
    />
  );
}

export type ListMenuItemProps = HTMLAttributes<HTMLDivElement> & {
  /** Applies the primary selected-row treatment used for the open/detail row. */
  active?: boolean;
  /** Applies the softer selected treatment used for checkbox or multi-select rows. */
  selected?: boolean;
  /** Left-border class when neither active nor selected. */
  accentClassName?: string;
  /** Whether the row gets pointer and hover affordances. */
  interactive?: boolean;
  /** Stable key that opts the row into `ListMenu` multi-select. */
  itemKey?: string;
  /** Hide the leading checkbox for this row even when selection is enabled. */
  hideCheckbox?: boolean;
};

export function ListMenuItem({
  active = false,
  selected = false,
  accentClassName = "border-transparent",
  interactive = true,
  itemKey,
  hideCheckbox = false,
  className,
  onClick,
  children,
  ...props
}: ListMenuItemProps) {
  const ctx = useListMenuSelectionContext();
  const selectable = ctx !== null && itemKey !== undefined;
  const rowSelected = selectable ? ctx.selection.isSelected(itemKey) : selected;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (selectable && event.shiftKey) {
      event.preventDefault();
      ctx.selection.toggle(itemKey, { shiftKey: true });
      return;
    }
    onClick?.(event);
  };

  const showCheckbox = selectable && ctx.showCheckboxes && !hideCheckbox;
  const body =
    selectable && showCheckbox ? (
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 rounded border-input"
          checked={rowSelected}
          aria-label="Select item"
          onClick={(event) => {
            event.stopPropagation();
            if (event.shiftKey) {
              event.preventDefault();
              ctx.selection.toggle(itemKey, { shiftKey: true });
            }
          }}
          onChange={() => ctx.selection.toggle(itemKey)}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    ) : (
      children
    );

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden border-l-2 transition-colors",
        interactive && "cursor-pointer",
        active
          ? "border-primary bg-primary/10"
          : rowSelected
            ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
            : cn(accentClassName, interactive && "hover:bg-muted"),
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {body}
    </div>
  );
}

export type ListMenuAction = {
  label: ReactNode;
  /** Receives the currently selected keys (ordered as in the menu). */
  onClick: (selectedKeys: string[]) => void;
  icon?: ReactNode;
  disabled?: boolean;
  variant?: ButtonProps["variant"];
};

export type ListMenuActionBarProps = HTMLAttributes<HTMLDivElement> & {
  /** Selection to act on; falls back to the enclosing `ListMenu` selection context. */
  selection?: ListMenuSelection;
  /** Bulk actions executed across every selected key. */
  actions?: ListMenuAction[];
  /** Override the "{n} selected" summary. */
  renderLabel?: (count: number) => ReactNode;
  /** Hide the whole bar when nothing is selected (default true). */
  hideWhenEmpty?: boolean;
  /** Label for the clear button; pass null to hide it. */
  clearLabel?: ReactNode;
};

export function ListMenuActionBar({
  selection: selectionProp,
  actions = [],
  renderLabel,
  hideWhenEmpty = true,
  clearLabel = "Clear",
  className,
  children,
  ...props
}: ListMenuActionBarProps) {
  const ctx = useListMenuSelectionContext();
  const selection = selectionProp ?? ctx?.selection;
  if (!selection) return null;
  const { count } = selection;
  if (hideWhenEmpty && count === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-border bg-muted px-3 py-1.5",
        className,
      )}
      {...props}
    >
      <span className="text-sm font-medium text-foreground">
        {renderLabel ? renderLabel(count) : `${count} selected`}
      </span>
      <div className="ml-auto flex items-center gap-1">
        {actions.map((action, i) => (
          <Button
            key={i}
            type="button"
            size="sm"
            variant={action.variant ?? "outline"}
            disabled={action.disabled || count === 0}
            onClick={() => action.onClick(selection.selectedKeys)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
        {children}
        {clearLabel !== null && (
          <Button type="button" size="sm" variant="ghost" onClick={() => selection.clear()}>
            {clearLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
