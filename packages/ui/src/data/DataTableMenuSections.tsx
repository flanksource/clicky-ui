import { useState } from "react";
import { cn } from "../lib/utils";
import { type Density } from "../hooks/use-density";
import { type Theme } from "../hooks/use-theme";
import {
  UiCheck,
  UiChevronRight,
  UiDesktop,
  UiListDashes,
  UiListFlat,
  UiMoon,
  UiResizeVertical,
  UiRows,
  UiSun,
} from "../icons";
import { Icon, type StaticIconComponent } from "./Icon";
import type { DataTableMenuAction } from "./DataTable";

// Shared by every section rendered inside the table's ⋯ preferences surface:
// "menu" is the existing desktop floating menu (unchanged rows), "sheet" is
// the mobile Modal sheet, whose rows grow to a 40px touch target.
export type MenuSectionSize = "menu" | "sheet";

const DENSITY_OPTIONS: Array<{
  value: Density;
  icon: StaticIconComponent;
  label: string;
}> = [
  { value: "compact", icon: UiRows, label: "Compact" },
  { value: "comfortable", icon: UiListFlat, label: "Comfortable" },
  { value: "spacious", icon: UiListDashes, label: "Spacious" },
];

// Groups menu actions by their `section` heading, preserving the order each
// section first appears. Actions without a section fall under "Download" so the
// existing download menu is unchanged.
function groupMenuActions(
  actions: DataTableMenuAction[],
): { section: string; actions: DataTableMenuAction[] }[] {
  const groups: { section: string; actions: DataTableMenuAction[] }[] = [];
  for (const action of actions) {
    const section = action.section ?? "Download";
    let group = groups.find((g) => g.section === section);
    if (!group) {
      group = { section, actions: [] };
      groups.push(group);
    }
    group.actions.push(action);
  }
  return groups;
}

export function MenuActionSection({
  actions,
  separated,
  onClose,
  size = "menu",
}: {
  actions: DataTableMenuAction[];
  separated: boolean;
  onClose: () => void;
  size?: MenuSectionSize;
}) {
  const groups = groupMenuActions(actions);
  // Which submenu is open, if any. One at a time: hovering a sibling takes the
  // flyout with it, which is what every menu does and what stops two levels
  // from being open over each other.
  const [openSubmenu, setOpenSubmenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  return (
    <>
      {groups.map((group, index) => (
        <div
          key={group.section}
          className={cn(
            (separated || index > 0) && "mt-1 border-t border-border pt-1",
          )}
        >
          {group.section && (
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {group.section}
            </div>
          )}
          {group.actions.map((action) => (
            <MenuActionItem
              key={action.id}
              action={action}
              submenu={openSubmenu?.id === action.id ? openSubmenu : null}
              onOpenSubmenu={setOpenSubmenu}
              onClose={onClose}
              size={size}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function MenuActionItem({
  action,
  submenu,
  onOpenSubmenu,
  onClose,
  size,
}: {
  action: DataTableMenuAction;
  submenu: { id: string; x: number; y: number } | null;
  onOpenSubmenu: (state: { id: string; x: number; y: number } | null) => void;
  onClose: () => void;
  size: MenuSectionSize;
}) {
  const hasDescription = Boolean(action.description);
  const children = action.children ?? [];
  const isSubmenu = children.length > 0;

  const openFrom = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    // Flip to the left when the flyout would run off the right edge, using the
    // same minimum width the panel below is given.
    const width = 224;
    const x =
      rect.right + width > window.innerWidth ? rect.left - width : rect.right;
    onOpenSubmenu({ id: action.id, x, y: rect.top });
  };

  return (
    <>
      <button
        type="button"
        role="menuitem"
        aria-haspopup={isSubmenu ? "menu" : undefined}
        aria-expanded={isSubmenu ? submenu != null : undefined}
        disabled={action.disabled}
        className={cn(
          "flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none",
          hasDescription ? "items-start" : "items-center",
          size === "sheet" && "min-h-10 py-2 text-sm",
          action.disabled && "cursor-not-allowed opacity-50",
          submenu && "bg-accent text-accent-foreground",
        )}
        onClick={(event) => {
          if (action.disabled) return;
          // Click, never hover: a flyout that opens on the way past is one the
          // user did not ask for, and it covers the rows they were reaching for.
          if (isSubmenu) {
            if (submenu) onOpenSubmenu(null);
            else openFrom(event.currentTarget);
            return;
          }
          action.onSelect();
          onClose();
        }}
      >
        {action.icon && (
          <Icon
            icon={action.icon}
            className={cn(
              "shrink-0 text-sm",
              hasDescription && "mt-0.5",
              action.iconClassName ?? "text-muted-foreground",
            )}
          />
        )}
        <span className="min-w-0 flex-1">
          <span className={cn(hasDescription && "font-medium")}>
            {action.label}
          </span>
          {action.description && (
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {action.description}
            </span>
          )}
        </span>
        {isSubmenu && (
          <Icon
            icon={UiChevronRight}
            className="shrink-0 text-sm text-muted-foreground"
          />
        )}
      </button>

      {isSubmenu && submenu && (
        <div
          role="menu"
          aria-label={
            typeof action.label === "string" ? action.label : "Submenu"
          }
          className="fixed z-50 max-h-[calc(100vh-1rem)] min-w-[14rem] max-w-[calc(100vw-1rem)] overflow-auto rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-black/5"
          style={{ left: submenu.x, top: submenu.y }}
        >
          {children.map((child) => (
            <MenuActionItem
              key={child.id}
              action={child}
              submenu={null}
              onOpenSubmenu={onOpenSubmenu}
              onClose={onClose}
              size={size}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function DensityMenuSection({
  densityOverride,
  separated,
  onDensityChange,
  size = "menu",
}: {
  densityOverride: Density | undefined;
  separated: boolean;
  onDensityChange: (density: Density | undefined) => void;
  size?: MenuSectionSize;
}) {
  const current = densityOverride ?? "inherit";

  return (
    <div className={cn(separated && "mt-1 border-t border-border pt-1")}>
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Density
      </div>
      <button
        type="button"
        role="menuitemradio"
        aria-checked={current === "inherit"}
        className={densityMenuItemClassName(current === "inherit", size)}
        onClick={() => onDensityChange(undefined)}
      >
        <Icon
          icon={UiResizeVertical}
          className="text-sm text-muted-foreground"
        />
        <span className="min-w-0 flex-1 truncate">Use page density</span>
        {current === "inherit" ? (
          <Icon icon={UiCheck} className="text-sm text-foreground" />
        ) : (
          <span className="inline-block h-4 w-4" aria-hidden />
        )}
      </button>
      {DENSITY_OPTIONS.map((option) => {
        const active = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            className={densityMenuItemClassName(active, size)}
            onClick={() => onDensityChange(option.value)}
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
  );
}

function densityMenuItemClassName(active: boolean, size: MenuSectionSize) {
  return cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none",
    size === "sheet" && "min-h-10 py-2 text-sm",
    active && "text-foreground",
  );
}

const THEME_MENU_OPTIONS: Array<{
  value: Theme;
  icon: StaticIconComponent;
  label: string;
}> = [
  { value: "system", icon: UiDesktop, label: "Use system theme" },
  { value: "light", icon: UiSun, label: "Light" },
  { value: "dark", icon: UiMoon, label: "Dark" },
];

export function ThemeMenuSection({
  value,
  separated,
  onChange,
  size = "menu",
}: {
  value: Theme;
  separated: boolean;
  onChange: (theme: Theme) => void;
  size?: MenuSectionSize;
}) {
  return (
    <div className={cn(separated && "mt-1 border-t border-border pt-1")}>
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Theme
      </div>
      {THEME_MENU_OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            className={densityMenuItemClassName(active, size)}
            onClick={() => onChange(option.value)}
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
  );
}
