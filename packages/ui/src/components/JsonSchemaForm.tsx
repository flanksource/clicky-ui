import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { Loading } from "./loading";
import { FormFieldFilter } from "./json-schema-form-filter-input";
import { useSchemaExtensions, withoutExtensionSources } from "./json-schema-form-schema-extensions";
import { FieldsGrid } from "./json-schema-form-layout";
import { FormErrorSummary } from "./json-schema-form-error-display";
import { unmatchedFormErrors } from "./json-schema-form-errors";
import { FormLookupProvider } from "./FormLookupProvider";
import { FormConnectionContext } from "./form-connection-context";
import { FormLayoutEnginesContext } from "./form-layout-context";
import { DiscriminatedForm } from "./json-schema-form-discriminator";
import { rehydrateRefs } from "./json-schema-form-refs";
import { renderApi, renderObjectFields } from "./json-schema-form-render";
import { applySchemaDefaults } from "./json-schema-form-defaults";
import {
  assertFormLayoutRegistered,
  isBuiltInFormLayout,
  mergeFormExtensions,
  type FormExtension,
  type LayoutEngine,
} from "./json-schema-form-extension-api";
import { FormNoMatches, FormPreferencesMenu, FormTitle } from "./json-schema-form-chrome";
import {
  cssLength,
  DEFAULT_COLUMN_MIN_WIDTH,
  normalizeColumns,
} from "./json-schema-form-utils";
import { DEFAULT_FORM_SIZE, fieldInnerGapClass } from "./json-schema-form-size";
import {
  BUILT_IN_LAYOUT_OPTIONS,
  DEFAULT_PREFERENCES_STORAGE_KEY,
  readPreferences,
  writePreferences,
  type FormPreferences,
  type LayoutMode,
} from "./json-schema-form-preferences";
import type { FormLayout, JsonSchemaFormProps, RenderContext } from "./json-schema-form-types";

const DEFAULT_LABEL_MAX_WIDTH = "40ch";
const DEFAULT_VALUE_MAX_WIDTH = "600px";
const NO_EXTENSIONS: FormExtension[] = [];

// resolveFormLayout maps the `layout`/`inline` props plus an optional menu-driven
// `modeOverride` to a single resolved FormLayout. An explicit `layout` sets the
// base; `inline` is the shorthand for it; `modeOverride` (from the preferences
// menu) wins over both but only flips the mode — width caps from `layout` are
// preserved. Both modes fill valueMaxWidth (inline value column / stacked
// label+value stack); the label cap only applies inline. A mode that is not
// built in must be a layout engine a form extension registered, else it throws.
function resolveFormLayout(
  layout: FormLayout | undefined,
  inline: boolean,
  modeOverride: LayoutMode | undefined,
  engines: ReadonlyMap<string, LayoutEngine>,
): FormLayout {
  const baseMode = layout?.mode ?? (inline ? "inline" : "stacked");
  const mode = modeOverride ?? baseMode;
  assertFormLayoutRegistered(mode, engines);
  const valueMaxWidth = layout?.valueMaxWidth ?? DEFAULT_VALUE_MAX_WIDTH;
  // `help` and `emptyArrays` are orthogonal to mode, so they survive a menu-driven mode flip.
  const help = {
    ...(layout?.help ? { help: layout.help } : {}),
    ...(layout?.emptyArrays ? { emptyArrays: layout.emptyArrays } : {}),
  };
  if (mode === "properties") return { ...layout, mode, ...help };
  if (!isBuiltInFormLayout(mode)) return { ...layout, mode, valueMaxWidth, ...help };
  if (mode !== "inline") return { mode: "stacked", valueMaxWidth, ...help };
  return {
    mode: "inline",
    labelMaxWidth: layout?.labelMaxWidth ?? DEFAULT_LABEL_MAX_WIDTH,
    valueMaxWidth,
    ...help,
  };
}

// JsonSchemaForm renders an object subschema as a form: one control per
// (effective) property. It resolves if/then conditionals internally and recurses
// through array items and object/map values; every other behaviour is layered on
// by the pre/post extension functions and form extensions the consumer supplies.
// The component holds no domain knowledge.
//
// This wrapper loads the extensions the schema declares (`x-clicky-extensions`)
// through `extensionLoader` and renders the form once they are ready, with the
// keyword stripped from the schema the form walks.
export function JsonSchemaForm({ extensionLoader, extensions, schema, ...props }: JsonSchemaFormProps) {
  const loaded = useSchemaExtensions(schema["x-clicky-extensions"], extensionLoader);
  const bodySchema = useMemo(() => withoutExtensionSources(schema), [schema]);
  const merged = useMemo(
    () => (loaded === undefined || loaded.length === 0 ? extensions : [...(extensions ?? []), ...loaded]),
    [extensions, loaded],
  );
  if (loaded === undefined) return <Loading label="Loading form extensions" />;
  return <JsonSchemaFormBody schema={bodySchema} {...props} {...(merged ? { extensions: merged } : {})} />;
}

function JsonSchemaFormBody({
  showTypeIcons = false,
  objectDisplay = "flat",
  schema,
  value,
  onChange,
  rootValue,
  onRootChange,
  instancePath = "",
  errors = [],
  readOnly = false,
  inline = false,
  layout,
  size = DEFAULT_FORM_SIZE,
  idPrefix,
  hideReadOnlyFields = false,
  hideEmpty = false,
  autoSave = false,
  hiddenKeys,
  requiredFirst = false,
  title,
  pre,
  post,
  extensions: formExtensions = NO_EXTENSIONS,
  showPreferencesMenu = true,
  showFilter,
  persistPreferences = true,
  preferencesStorageKey = DEFAULT_PREFERENCES_STORAGE_KEY,
  lookupFetcher,
  connectionApiBase,
  expressionEvaluator,
  applyDefaults = true,
}: Omit<JsonSchemaFormProps, "extensionLoader">) {
  const extensions = useMemo(() => mergeFormExtensions(formExtensions), [formExtensions]);
  const { slots } = extensions;
  const Title = slots.Title ?? FormTitle;
  const PreferencesMenu = slots.PreferencesMenu ?? FormPreferencesMenu;
  const FieldFilter = slots.FieldFilter ?? FormFieldFilter;
  const ErrorSummary = slots.ErrorSummary ?? FormErrorSummary;
  const NoMatches = slots.NoMatches ?? FormNoMatches;
  const layoutOptions = useMemo(
    () => [
      ...BUILT_IN_LAYOUT_OPTIONS,
      ...[...extensions.layouts.keys()].map((name) => ({ value: name, label: name })),
    ],
    [extensions],
  );

  // When the menu is hidden, never touch localStorage and start from an empty
  // override so behaviour is identical to before this feature existed.
  const [prefs, setPrefs] = useState<FormPreferences>(() =>
    showPreferencesMenu && persistPreferences
      ? readPreferences(preferencesStorageKey, [...extensions.layouts.keys()])
      : {},
  );
  // The field filter is transient view state (a "find" over the fields), never
  // persisted — reopening the form should never start with fields hidden.
  const [fieldFilter, setFieldFilter] = useState("");

  const effectiveSize = prefs.size ?? size;
  const resolvedLayout = resolveFormLayout(layout, inline, prefs.layoutMode, extensions.layouts);
  const filterVisible = showFilter ?? (showPreferencesMenu && resolvedLayout.mode === "properties");
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
  // Suppressing at the value (not only at the commit effect below) is deliberate:
  // renderObjectFields spreads `effectiveValue` when a single field changes, so a
  // render-only application would still leak the defaults on the first edit.
  const effectiveValue = useMemo(
    () => (applyDefaults ? applySchemaDefaults(resolvedSchema, value) : value),
    [applyDefaults, resolvedSchema, value],
  );
  // The hook stacks: the props first, then each form extension's, so they run in
  // one order at every depth (and unmatchedFormErrors sees the same pre-hooks).
  const preExtensions = useMemo(() => [...(pre ?? []), ...extensions.pre], [pre, extensions]);
  const postExtensions = useMemo(() => [...(post ?? []), ...extensions.post], [post, extensions]);
  const unmatchedErrors = useMemo(
    () =>
      unmatchedFormErrors({
        schema: resolvedSchema,
        value: effectiveValue,
        errors,
        viewOnly: readOnly,
        hideReadOnlyFields,
        hideEmpty,
        pre: preExtensions,
        extensions,
        rootValue: rootValue ?? effectiveValue,
        instancePath,
        ...(hiddenKeys ? { hiddenKeys } : {}),
        ...(fieldFilter.trim() ? { fieldFilter: fieldFilter.trim() } : {}),
        ...(expressionEvaluator ? { expressionEvaluator } : {}),
      }),
    [effectiveValue, errors, expressionEvaluator, extensions, fieldFilter, hiddenKeys, hideEmpty, hideReadOnlyFields, instancePath, preExtensions, readOnly, resolvedSchema, rootValue],
  );
  // Defaults are part of the submitted form value, not only presentation. This
  // is especially important for required discriminator fields whose default
  // selects an if/then branch.
  useEffect(() => {
    if (!readOnly && effectiveValue !== value) onChange(effectiveValue);
  }, [effectiveValue, onChange, readOnly, value]);

  const ctx: RenderContext = {
    showTypeIcons,
    objectDisplay,
    readOnly,
    viewOnly: readOnly,
    hideReadOnlyFields,
    hideEmpty,
    autoSave,
    layout: resolvedLayout,
    size: effectiveSize,
    sortMode: effectiveSortMode,
    pre: preExtensions,
    post: postExtensions,
    extensions,
    rootValue: rootValue ?? effectiveValue,
    onRootChange: onRootChange ?? onChange,
    instancePath,
    errors,
    depth: 0,
    render: renderApi,
    ...(expressionEvaluator ? { expressionEvaluator } : {}),
    ...(idPrefix ? { idPrefix } : {}),
    ...(fieldFilter.trim() ? { fieldFilter: fieldFilter.trim() } : {}),
    ...(prefs.debug ? { debug: true } : {}),
  };
  // A schema may name a discriminator property whose value selects a "kind"; the
  // form then runs a two-phase pick-then-fill flow (see DiscriminatedForm).
  const discKey = typeof resolvedSchema["x-discriminator"] === "string" ? resolvedSchema["x-discriminator"] : undefined;
  const inPickerPhase = discKey != null && (effectiveValue[discKey] == null || effectiveValue[discKey] === "");

  const objectRows = discKey
    ? null
    : renderObjectFields(resolvedSchema, effectiveValue, onChange, ctx, hiddenKeys ? { hiddenKeys } : undefined);
  const noMatches = objectRows != null && objectRows.length === 0 && fieldFilter.trim() !== "";

  return (
    <FormLookupProvider handlers={extensions.lookups} {...(lookupFetcher ? { fetcher: lookupFetcher } : {})}>
      <FormConnectionContext.Provider value={connectionApiBase}>
      <FormLayoutEnginesContext.Provider value={extensions.layouts}>
      <div data-json-schema-form className={cn("relative flex flex-col", fieldInnerGapClass[effectiveSize])}>
        {showPreferencesMenu && !inPickerPhase && (
          <PreferencesMenu
            size={effectiveSize}
            layoutMode={resolvedLayout.mode}
            layoutOptions={layoutOptions}
            sortMode={effectiveSortMode}
            fieldFilter={fieldFilter}
            filterInMenu={!filterVisible}
            onFilterChange={setFieldFilter}
            onSelectSize={(next) => applyPrefs({ ...prefs, size: next })}
            onSelectLayout={(next) => applyPrefs({ ...prefs, layoutMode: next })}
            onSelectSort={(next) => applyPrefs({ ...prefs, sortMode: next })}
            debug={prefs.debug === true}
            onToggleDebug={() => applyPrefs({ ...prefs, debug: !prefs.debug })}
          />
        )}
        {title && <Title title={title} size={effectiveSize} />}
        {filterVisible && !inPickerPhase && (
          <div className="max-w-md pr-9">
            <FieldFilter value={fieldFilter} onChange={setFieldFilter} />
          </div>
        )}
        {unmatchedErrors.length > 0 && <ErrorSummary errors={unmatchedErrors} />}
        <FieldsGrid
          layout={resolvedLayout}
          size={effectiveSize}
          columns={normalizeColumns(resolvedSchema["x-columns"])}
          columnMinWidth={cssLength(resolvedSchema["x-column-min-width"], DEFAULT_COLUMN_MIN_WIDTH)}
          {...(typeof resolvedSchema["x-columns-max-width"] === "string"
            ? { columnsMaxWidth: resolvedSchema["x-columns-max-width"] }
            : {})}
          {...(typeof resolvedSchema["x-classes"] === "string" ? { className: resolvedSchema["x-classes"] } : {})}
        >
          {discKey ? (
            <DiscriminatedForm
              schema={resolvedSchema}
              value={effectiveValue}
              onChange={onChange}
              ctx={ctx}
              discKey={discKey}
              {...(hiddenKeys ? { hiddenKeys } : {})}
            />
          ) : (
            objectRows
          )}
        </FieldsGrid>
        {noMatches && <NoMatches filter={fieldFilter.trim()} size={effectiveSize} />}
      </div>
      </FormLayoutEnginesContext.Provider>
      </FormConnectionContext.Provider>
    </FormLookupProvider>
  );
}
