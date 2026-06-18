import { useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiCheck, UiEllipsis } from "../icons";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { FieldsGrid } from "./json-schema-form-fields";
import { rehydrateRefs } from "./json-schema-form-refs";
import { renderApi, renderObjectFields } from "./json-schema-form-render";
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
}: JsonSchemaFormProps) {
  // When the menu is hidden, never touch localStorage and start from an empty
  // override so behaviour is identical to before this feature existed.
  const [prefs, setPrefs] = useState<FormPreferences>(() =>
    showPreferencesMenu && persistPreferences ? readPreferences(preferencesStorageKey) : {},
  );

  const effectiveSize = prefs.size ?? size;
  const resolvedLayout = resolveFormLayout(layout, inline, prefs.layoutMode);
  // The `requiredFirst` prop sets the base sort; a menu selection overrides it.
  const effectiveSortMode = prefs.sortMode ?? (requiredFirst ? "required-first" : "schema");

  const applyPrefs = (next: FormPreferences) => {
    setPrefs(next);
    if (persistPreferences) writePreferences(preferencesStorageKey, next);
  };

  const ctx: RenderContext = {
    readOnly,
    hideReadOnlyFields,
    layout: resolvedLayout,
    size: effectiveSize,
    sortMode: effectiveSortMode,
    pre: pre ?? [],
    post: post ?? [],
    depth: 0,
    render: renderApi,
    ...(idPrefix ? { idPrefix } : {}),
  };
  // A bundled schema (components under `$defs`, referenced by local `#/$defs`
  // pointers) is resolved once into a self-contained tree the renderer walks
  // directly; a non-bundled schema passes through untouched.
  const resolvedSchema = useMemo(() => rehydrateRefs(schema), [schema]);
  const rows = renderObjectFields(resolvedSchema, value, onChange, ctx, hiddenKeys ? { hiddenKeys } : undefined);

  return (
    <div className={cn("relative flex flex-col", fieldInnerGapClass[effectiveSize])}>
      {showPreferencesMenu && (
        <PreferencesMenu
          size={effectiveSize}
          layoutMode={resolvedLayout.mode}
          sortMode={effectiveSortMode}
          onSelectSize={(next) => applyPrefs({ ...prefs, size: next })}
          onSelectLayout={(next) => applyPrefs({ ...prefs, layoutMode: next })}
          onSelectSort={(next) => applyPrefs({ ...prefs, sortMode: next })}
        />
      )}
      {title && <h3 className={cn("font-semibold", labelSizeClass[effectiveSize])}>{title}</h3>}
      <FieldsGrid layout={resolvedLayout} size={effectiveSize}>
        {rows}
      </FieldsGrid>
    </div>
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
// size and layout mode. Selecting an item fires the matching callback and closes
// the menu; the parent decides whether to persist.
function PreferencesMenu({
  size,
  layoutMode,
  sortMode,
  onSelectSize,
  onSelectLayout,
  onSelectSort,
}: {
  size: FormSize;
  layoutMode: LayoutMode;
  sortMode: SortMode;
  onSelectSize: (size: FormSize) => void;
  onSelectLayout: (mode: LayoutMode) => void;
  onSelectSort: (mode: SortMode) => void;
}) {
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
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon icon={UiEllipsis} className="text-sm" />
        </button>
      }
    >
      {(closeMenu) => (
        <>
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
