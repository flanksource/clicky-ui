import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiCheck, UiClose, UiEllipsisBold, UiSearch } from "../icons";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { FieldsGrid } from "./json-schema-form-fields";
import { FormLookupProvider } from "./FormLookupProvider";
import { DiscriminatedForm } from "./json-schema-form-discriminator";
import { rehydrateRefs } from "./json-schema-form-refs";
import { renderApi, renderObjectFields } from "./json-schema-form-render";
import { applySchemaDefaults } from "./json-schema-form-resolve";
import { normalizeColumns } from "./json-schema-form-utils";
import {
  DEFAULT_FORM_SIZE,
  fieldInnerGapClass,
  labelSizeClass,
  type FormSize,
} from "./json-schema-form-size";
import {
  DEFAULT_PREFERENCES_STORAGE_KEY,
  readPreferences,
  writePreferences,
  type FormPreferences,
  type LayoutMode,
  type SortMode,
} from "./json-schema-form-preferences";
import type { FormLayout, JsonSchemaFormProps, RenderContext } from "./json-schema-form-types";

const DEFAULT_LABEL_MAX_WIDTH = "40ch";
const DEFAULT_VALUE_MAX_WIDTH = "600px";

// resolveFormLayout maps the `layout`/`inline` props plus an optional menu-driven
// `modeOverride` to a single resolved FormLayout. An explicit `layout` sets the
// base; `inline` is the shorthand for it; `modeOverride` (from the preferences
// menu) wins over both but only flips the mode — width caps from `layout` are
// preserved. Both modes fill valueMaxWidth (inline value column / stacked
// label+value stack); the label cap only applies inline.
function resolveFormLayout(
  layout: FormLayout | undefined,
  inline: boolean,
  modeOverride: LayoutMode | undefined,
): FormLayout {
  const baseMode = layout?.mode ?? (inline ? "inline" : "stacked");
  const mode = modeOverride ?? baseMode;
  const valueMaxWidth = layout?.valueMaxWidth ?? DEFAULT_VALUE_MAX_WIDTH;
  if (mode !== "inline") return { mode: "stacked", valueMaxWidth };
  return {
    mode: "inline",
    labelMaxWidth: layout?.labelMaxWidth ?? DEFAULT_LABEL_MAX_WIDTH,
    valueMaxWidth,
  };
}

// JsonSchemaForm renders an object subschema as a form: one control per
// (effective) property. It resolves if/then conditionals internally and recurses
// through array items and object/map values; every other behaviour is layered on
// by the pre/post extension functions the consumer supplies. The component holds
// no domain knowledge.
export function JsonSchemaForm({
  schema,
  value,
  onChange,
  readOnly = false,
  inline = false,
  layout,
  size = DEFAULT_FORM_SIZE,
  idPrefix,
  hideReadOnlyFields = false,
  hiddenKeys,
  requiredFirst = false,
  title,
  pre,
  post,
  showPreferencesMenu = true,
  persistPreferences = true,
  preferencesStorageKey = DEFAULT_PREFERENCES_STORAGE_KEY,
  lookupFetcher,
}: JsonSchemaFormProps) {
  // When the menu is hidden, never touch localStorage and start from an empty
  // override so behaviour is identical to before this feature existed.
  const [prefs, setPrefs] = useState<FormPreferences>(() =>
    showPreferencesMenu && persistPreferences ? readPreferences(preferencesStorageKey) : {},
  );
  // The field filter is transient view state (a "find" over the fields), never
  // persisted — reopening the form should never start with fields hidden.
  const [fieldFilter, setFieldFilter] = useState("");

  const effectiveSize = prefs.size ?? size;
  const resolvedLayout = resolveFormLayout(layout, inline, prefs.layoutMode);
  // The `requiredFirst` prop sets the base sort; a menu selection overrides it.
  const effectiveSortMode = prefs.sortMode ?? (requiredFirst ? "required-first" : "schema");

  const applyPrefs = (next: FormPreferences) => {
    setPrefs(next);
    if (persistPreferences) writePreferences(preferencesStorageKey, next);
  };

  // A bundled schema (components under `$defs`, referenced by local `#/$defs`
  // pointers) is resolved once into a self-contained tree the renderer walks
  // directly; a non-bundled schema passes through untouched.
  const resolvedSchema = useMemo(() => rehydrateRefs(schema), [schema]);
  const effectiveValue = useMemo(
    () => applySchemaDefaults(resolvedSchema, value),
    [resolvedSchema, value],
  );
  // Defaults are part of the submitted form value, not only presentation. This
  // is especially important for required discriminator fields whose default
  // selects an if/then branch.
  useEffect(() => {
    if (!readOnly && effectiveValue !== value) onChange(effectiveValue);
  }, [effectiveValue, onChange, readOnly, value]);

  const ctx: RenderContext = {
    readOnly,
    hideReadOnlyFields,
    layout: resolvedLayout,
    size: effectiveSize,
    sortMode: effectiveSortMode,
    pre: pre ?? [],
    post: post ?? [],
    rootValue: effectiveValue,
    onRootChange: onChange,
    depth: 0,
    render: renderApi,
    ...(idPrefix ? { idPrefix } : {}),
    ...(fieldFilter.trim() ? { fieldFilter: fieldFilter.trim() } : {}),
  };
  // A schema may name a discriminator property whose value selects a "kind"; the
  // form then runs a two-phase pick-then-fill flow (see DiscriminatedForm).
  const discKey =
    typeof resolvedSchema["x-discriminator"] === "string" ? resolvedSchema["x-discriminator"] : undefined;
  const inPickerPhase =
    discKey != null &&
    (effectiveValue[discKey] == null || effectiveValue[discKey] === "");

  const objectRows = discKey
    ? null
    : renderObjectFields(
        resolvedSchema,
        effectiveValue,
        onChange,
        ctx,
        hiddenKeys ? { hiddenKeys } : undefined,
      );
  const noMatches = objectRows != null && objectRows.length === 0 && fieldFilter.trim() !== "";

  return (
    <FormLookupProvider {...(lookupFetcher ? { fetcher: lookupFetcher } : {})}>
    <div className={cn("relative flex flex-col", fieldInnerGapClass[effectiveSize])}>
      {showPreferencesMenu && !inPickerPhase && (
        <PreferencesMenu
          size={effectiveSize}
          layoutMode={resolvedLayout.mode}
          sortMode={effectiveSortMode}
          fieldFilter={fieldFilter}
          onFilterChange={setFieldFilter}
          onSelectSize={(next) => applyPrefs({ ...prefs, size: next })}
          onSelectLayout={(next) => applyPrefs({ ...prefs, layoutMode: next })}
          onSelectSort={(next) => applyPrefs({ ...prefs, sortMode: next })}
        />
      )}
      {title && <h3 className={cn("font-semibold", labelSizeClass[effectiveSize])}>{title}</h3>}
      <FieldsGrid
        layout={resolvedLayout}
        size={effectiveSize}
        columns={normalizeColumns(resolvedSchema["x-columns"])}
        {...(typeof resolvedSchema["x-classes"] === "string"
          ? { className: resolvedSchema["x-classes"] }
          : {})}
      >
        {discKey ? (
          <DiscriminatedForm
            schema={resolvedSchema}
            value={effectiveValue}
            onChange={onChange}
            ctx={ctx}
            discKey={discKey}
          />
        ) : (
          objectRows
        )}
      </FieldsGrid>
      {noMatches && (
        <p className={cn("text-muted-foreground", labelSizeClass[effectiveSize])}>
          No fields match “{fieldFilter.trim()}”.
        </p>
      )}
    </div>
    </FormLookupProvider>
  );
}

const SIZE_OPTIONS: { value: FormSize; label: string }[] = [
  { value: "xs", label: "Extra small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

const LAYOUT_OPTIONS: { value: LayoutMode; label: string }[] = [
  { value: "stacked", label: "Stacked" },
  { value: "inline", label: "Inline" },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "schema", label: "Schema order" },
  { value: "required-first", label: "Required first" },
  { value: "priority", label: "Required & filled first" },
];

// PreferencesMenu is the compact top-right ellipsis menu controlling this form's
// size, layout, sort, and a live field filter. Selecting an option fires the
// matching callback and closes the menu; typing in the filter updates fields
// live without closing. The parent decides whether to persist.
function PreferencesMenu({
  size,
  layoutMode,
  sortMode,
  fieldFilter,
  onFilterChange,
  onSelectSize,
  onSelectLayout,
  onSelectSort,
}: {
  size: FormSize;
  layoutMode: LayoutMode;
  sortMode: SortMode;
  fieldFilter: string;
  onFilterChange: (value: string) => void;
  onSelectSize: (size: FormSize) => void;
  onSelectLayout: (mode: LayoutMode) => void;
  onSelectSort: (mode: SortMode) => void;
}) {
  const filterActive = fieldFilter.trim() !== "";
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
          <div className="px-2 pb-1.5 pt-1">
            <div className="relative">
              <Icon
                icon={UiSearch}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              />
              <input
                type="text"
                aria-label="Filter fields"
                placeholder="Filter fields…"
                value={fieldFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                // Keep arrow/space/enter keys inside the input instead of driving
                // the menu's list navigation or closing it.
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full rounded-md border border-input bg-background py-1 pl-7 pr-6 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              {filterActive && (
                <button
                  type="button"
                  aria-label="Clear filter"
                  onClick={() => onFilterChange("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Icon icon={UiClose} className="text-xs" />
                </button>
              )}
            </div>
          </div>
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
          {LAYOUT_OPTIONS.map((opt) => (
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
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
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
