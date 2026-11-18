import type { ComponentProps, ComponentType, ReactNode } from "react";
import type { FieldErrorText, FormErrorSummary } from "./json-schema-form-error-display";
import type { FormFieldFilter } from "./json-schema-form-filter-input";
import type { FormNoMatches, FormPreferencesMenu, FormTitle } from "./json-schema-form-chrome";
import type { JsonSchemaFormError } from "./json-schema-form-error-types";
import type { FieldsGridProps, SectionHeading } from "./json-schema-form-layout";
import type {
  FieldControl,
  HelpDisplay,
  LookupFetcher,
  PostExtension,
  PostExtensionContext,
  PreExtension,
  RenderContext,
} from "./json-schema-form-types";

// The form extension API: one bundle that contributes pre/post hooks, custom
// field types, lookup handlers, layout engines and slot replacements. Each is
// opted into through schema/props the form already reads — nothing here adds a
// schema keyword:
//   formats  keyed by the standard JSON Schema `format`
//   lookups  keyed by `x-clicky-lookup.url`
//   layouts  keyed by form `layout.mode` and field `x-layout`
//   slots    replace a piece of form chrome; props are the default component's

export const RESERVED_FORMATS = ["json", "date", "date-time", "textarea", "md", "percent", "connection"] as const;
export const RESERVED_FORM_LAYOUTS = ["stacked", "inline", "properties"] as const;
export const RESERVED_FIELD_LAYOUTS = ["inline", "stack", "table"] as const;
export const FORM_SLOT_NAMES = [
  "Title",
  "PreferencesMenu",
  "FieldFilter",
  "ErrorSummary",
  "NoMatches",
  "SectionHeading",
  "FieldError",
] as const;

export interface FieldTypeProps {
  // The resolved control (kind "custom"). Per-field configuration is read from
  // `field.schema`: standard keywords plus whatever `x-*` the renderer documents.
  field: FieldControl;
  value: unknown;
  onChange: (next: unknown) => void;
  fieldId: string;
  readOnly: boolean;
  ctx: PostExtensionContext;
}

export type FieldTypeRenderer = (props: FieldTypeProps) => ReactNode;

// BuiltFieldRow is one fully built field (control resolved, pre/post applied,
// value rendered) handed to a layout engine to arrange.
export interface BuiltFieldRow {
  field: FieldControl;
  fieldId: string;
  label: ReactNode;
  value: ReactNode;
  headerClear: ReactNode;
  messages: JsonSchemaFormError[];
  help: HelpDisplay;
}

// LayoutEngine arranges rows. `Grid` replaces the container every group of rows
// renders into (the form and each nested object); `Row` replaces how one field
// is laid out. A form-level engine (`layout.mode`) applies at every depth; a
// field-level engine (`x-layout`) applies to that one row.
export interface LayoutEngine {
  Grid: ComponentType<FieldsGridProps>;
  Row(row: BuiltFieldRow, ctx: RenderContext): ReactNode;
}

export interface FormSlots {
  Title: ComponentType<ComponentProps<typeof FormTitle>>;
  PreferencesMenu: ComponentType<ComponentProps<typeof FormPreferencesMenu>>;
  FieldFilter: ComponentType<ComponentProps<typeof FormFieldFilter>>;
  ErrorSummary: ComponentType<ComponentProps<typeof FormErrorSummary>>;
  NoMatches: ComponentType<ComponentProps<typeof FormNoMatches>>;
  SectionHeading: ComponentType<ComponentProps<typeof SectionHeading>>;
  FieldError: ComponentType<ComponentProps<typeof FieldErrorText>>;
}

export interface FormExtension {
  name: string;
  pre?: PreExtension[];
  post?: PostExtension[];
  formats?: Record<string, FieldTypeRenderer>;
  lookups?: Record<string, LookupFetcher>;
  layouts?: Record<string, LayoutEngine>;
  slots?: Partial<FormSlots>;
}

// FormExtensionSource names one extension module: inline TSX, or a `ref` path
// (relative to the project root) the host serves. A schema declares its own in
// the root `x-clicky-extensions` keyword; a host turns on loading them by giving
// the form an `extensionLoader`.
export type FormExtensionSource = { tsx: string; name?: string } | { ref: string };

export interface ResolvedFormExtensions {
  pre: PreExtension[];
  post: PostExtension[];
  formats: ReadonlyMap<string, { extension: string; render: FieldTypeRenderer }>;
  lookups: ReadonlyMap<string, LookupFetcher>;
  layouts: ReadonlyMap<string, LayoutEngine>;
  slots: Partial<FormSlots>;
}

// defineFormExtension is an identity helper: it types an authored extension
// module (`export default defineFormExtension({...})`) without any runtime cost.
export function defineFormExtension(extension: FormExtension): FormExtension {
  return extension;
}

function register<T>(
  registry: Map<string, { extension: string; value: T }>,
  args: { kind: string; name: string; extension: string; value: T },
): void {
  const existing = registry.get(args.name);
  if (existing) {
    throw new Error(
      `form extension "${args.extension}" cannot register ${args.kind} "${args.name}": already registered by extension "${existing.extension}"`,
    );
  }
  registry.set(args.name, { extension: args.extension, value: args.value });
}

function unwrap<T>(registry: Map<string, { extension: string; value: T }>): Map<string, T> {
  return new Map([...registry].map(([name, entry]) => [name, entry.value]));
}

const isReserved = (list: readonly string[], name: string) => list.includes(name);

// mergeFormExtensions folds a list of extensions into the lookup tables the form
// renders from. Hooks concatenate in list order. A format, lookup, layout or slot
// name registered twice — or a built-in name — throws: nothing is overridden
// silently.
export function mergeFormExtensions(list: readonly FormExtension[]): ResolvedFormExtensions {
  const formats = new Map<string, { extension: string; value: FieldTypeRenderer }>();
  const lookups = new Map<string, { extension: string; value: LookupFetcher }>();
  const layouts = new Map<string, { extension: string; value: LayoutEngine }>();
  const slots = new Map<string, { extension: string; value: unknown }>();
  const pre: PreExtension[] = [];
  const post: PostExtension[] = [];

  list.forEach((ext, index) => {
    if (typeof ext?.name !== "string" || ext.name === "") {
      throw new Error(`form extension at index ${index} must have a name`);
    }
    const extension = ext.name;
    pre.push(...(ext.pre ?? []));
    post.push(...(ext.post ?? []));
    for (const [name, value] of Object.entries(ext.formats ?? {})) {
      if (isReserved(RESERVED_FORMATS, name)) {
        throw new Error(`form extension "${extension}" cannot register reserved format "${name}"`);
      }
      register(formats, { kind: "format", name, extension, value });
    }
    for (const [name, value] of Object.entries(ext.lookups ?? {})) {
      register(lookups, { kind: "lookup", name, extension, value });
    }
    for (const [name, value] of Object.entries(ext.layouts ?? {})) {
      if (isReserved(RESERVED_FORM_LAYOUTS, name) || isReserved(RESERVED_FIELD_LAYOUTS, name)) {
        throw new Error(`form extension "${extension}" cannot register reserved layout "${name}"`);
      }
      register(layouts, { kind: "layout", name, extension, value });
    }
    for (const [name, value] of Object.entries(ext.slots ?? {})) {
      if (!isReserved(FORM_SLOT_NAMES, name)) {
        throw new Error(`form extension "${extension}" registers unknown slot "${name}"`);
      }
      register(slots, { kind: "slot", name, extension, value });
    }
  });

  return {
    pre,
    post,
    formats: new Map([...formats].map(([name, entry]) => [name, { extension: entry.extension, render: entry.value }])),
    lookups: unwrap(lookups),
    layouts: unwrap(layouts),
    slots: Object.fromEntries([...slots].map(([name, entry]) => [name, entry.value])) as Partial<FormSlots>,
  };
}

export function isBuiltInFormLayout(mode: string): boolean {
  return isReserved(RESERVED_FORM_LAYOUTS, mode);
}

// registeredLayout returns the engine registered under `name`, or throws: a
// layout value that is neither built in nor registered is a schema/prop error,
// not something to guess a rendering for.
function registeredLayout(args: {
  name: string;
  layouts: ReadonlyMap<string, LayoutEngine>;
  description: string;
}): LayoutEngine {
  const engine = args.layouts.get(args.name);
  if (!engine) {
    throw new Error(
      `${args.description} is not registered by any form extension (registered: ${[...args.layouts.keys()].join(", ") || "none"})`,
    );
  }
  return engine;
}

// assertFormLayoutRegistered throws for a form `layout.mode` that is neither
// built in nor registered.
export function assertFormLayoutRegistered(mode: string, layouts: ReadonlyMap<string, LayoutEngine>): void {
  if (isBuiltInFormLayout(mode)) return;
  registeredLayout({ name: mode, layouts, description: `form layout "${mode}"` });
}

// rowLayoutEngine picks the engine that lays out one field's row: a field-level
// `x-layout` engine wins over the form-level `layout.mode` engine; built-in
// layouts have no engine (undefined) and render as they always did.
export function rowLayoutEngine(args: {
  fieldKey: string;
  fieldLayout: string | undefined;
  formMode: string;
  layouts: ReadonlyMap<string, LayoutEngine>;
}): LayoutEngine | undefined {
  const { fieldKey, fieldLayout, formMode, layouts } = args;
  if (fieldLayout !== undefined && !isReserved(RESERVED_FIELD_LAYOUTS, fieldLayout)) {
    return registeredLayout({ name: fieldLayout, layouts, description: `layout "${fieldLayout}" on field "${fieldKey}"` });
  }
  if (isBuiltInFormLayout(formMode)) return undefined;
  return registeredLayout({ name: formMode, layouts, description: `form layout "${formMode}"` });
}
