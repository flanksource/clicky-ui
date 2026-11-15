import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiCheck, UiEllipsisBold } from "../icons";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { FormFieldFilter } from "./json-schema-form-filter-input";
import { labelSizeClass, type FormSize } from "./json-schema-form-size";
import type { LayoutMode, SortMode } from "./json-schema-form-preferences";

// The form's own chrome — title, display-options menu, "no matches" line. Each
// is a slot a form extension can replace (see FormSlots); the exports here are
// the defaults, so a replacement can wrap them.

export function FormTitle({ title, size }: { title: string; size: FormSize }) {
  return <h3 className={cn("font-semibold", labelSizeClass[size])}>{title}</h3>;
}

export function FormNoMatches({ filter, size }: { filter: string; size: FormSize }) {
  return (
    <p className={cn("text-muted-foreground", labelSizeClass[size])}>
      No fields match “{filter}”.
    </p>
  );
}

const SIZE_OPTIONS: { value: FormSize; label: string }[] = [
  { value: "xs", label: "Extra small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "schema", label: "Schema order" },
  { value: "required-first", label: "Required first" },
  { value: "priority", label: "Required & filled first" },
];

// FormPreferencesMenu is the compact top-right ellipsis menu controlling this
// form's size, layout, sort, and a live field filter. Selecting an option fires
// the matching callback and closes the menu; typing in the filter updates fields
// live without closing. The parent decides whether to persist. `layoutOptions`
// is the built-in layouts followed by any engines a form extension registered.
export function FormPreferencesMenu({
  size,
  layoutMode,
  layoutOptions,
  sortMode,
  fieldFilter,
  filterInMenu,
  onFilterChange,
  onSelectSize,
  onSelectLayout,
  onSelectSort,
  debug,
  onToggleDebug,
}: {
  size: FormSize;
  layoutMode: LayoutMode;
  layoutOptions: { value: LayoutMode; label: string }[];
  sortMode: SortMode;
  fieldFilter: string;
  filterInMenu: boolean;
  onFilterChange: (value: string) => void;
  onSelectSize: (size: FormSize) => void;
  onSelectLayout: (mode: LayoutMode) => void;
  onSelectSort: (mode: SortMode) => void;
  debug: boolean;
  onToggleDebug: () => void;
}) {
  const filterActive = fieldFilter.trim() !== "" || debug;
  return (
    <DropdownMenu
      align="right"
      menuLabel="Form display options"
      className="absolute right-0 top-0 z-10"
      trigger={
        <button
          type="button"
          aria-label="Form display options"
          aria-haspopup="menu"
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            filterActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon icon={UiEllipsisBold} className="text-lg" />
        </button>
      }
    >
      {(closeMenu) => (
        <>
          {filterInMenu && <div className="px-2 pb-1.5 pt-1">
            <FormFieldFilter value={fieldFilter} onChange={onFilterChange} />
          </div>}
          <PreferenceSection title="Size" />
          {SIZE_OPTIONS.map((opt) => (
            <PreferenceItem
              key={opt.value}
              label={opt.label}
              selected={opt.value === size}
              onSelect={() => {
                onSelectSize(opt.value);
                closeMenu();
              }}
            />
          ))}
          <PreferenceSection title="Layout" />
          {layoutOptions.map((opt) => (
            <PreferenceItem
              key={opt.value}
              label={opt.label}
              selected={opt.value === layoutMode}
              onSelect={() => {
                onSelectLayout(opt.value);
                closeMenu();
              }}
            />
          ))}
          <PreferenceSection title="Sort" />
          {SORT_OPTIONS.map((opt) => (
            <PreferenceItem
              key={opt.value}
              label={opt.label}
              selected={opt.value === sortMode}
              onSelect={() => {
                onSelectSort(opt.value);
                closeMenu();
              }}
            />
          ))}
          <PreferenceSection title="Debug" />
          <PreferenceItem
            role="menuitemcheckbox"
            label="Show hidden fields & sources"
            selected={debug}
            onSelect={() => {
              onToggleDebug();
              closeMenu();
            }}
          />
        </>
      )}
    </DropdownMenu>
  );
}

function PreferenceSection({ title }: { title: string }) {
  return (
    <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </div>
  );
}

function PreferenceItem({
  label,
  selected,
  onSelect,
  role = "menuitemradio",
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  role?: "menuitemradio" | "menuitemcheckbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
      onClick={onSelect}
    >
      <span className="flex w-3.5 shrink-0 justify-center">
        {selected && <Icon icon={UiCheck} className="text-xs" />}
      </span>
      {label}
    </button>
  );
}
