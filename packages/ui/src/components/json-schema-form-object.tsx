import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiAdd, UiTrash } from "../icons";
import { Button } from "./button";
import { Combobox } from "./Combobox";
import type {
  FieldControl,
  JsonSchemaObject,
  JsonSchemaProperty,
  RenderContext,
} from "./json-schema-form-types";
import {
  fieldInputId,
  inputClass,
  isPlainObject,
  keyPickerOptions,
} from "./json-schema-form-utils";
import { FieldsGrid } from "./json-schema-form-fields";
import { fieldInnerGapClass } from "./json-schema-form-size";

// ObjectControl renders a nested structured object as a sub-form: its own
// properties, required markers, if/then, soft errors — all via the shared
// recursive renderer (ctx.render), so pre/post extensions apply at this depth too.
export function ObjectControl({ field, ctx }: { field: FieldControl; ctx: RenderContext }) {
  const obj = isPlainObject(field.value) ? (field.value as Record<string, unknown>) : {};
  const subSchema: JsonSchemaObject = {
    type: "object",
    properties: field.objectProperties ?? {},
    ...(field.objectRequired ? { required: field.objectRequired } : {}),
    ...(Array.isArray(field.schema.allOf) ? { allOf: field.schema.allOf } : {}),
    ...(Array.isArray(field.schema["x-order"]) ? { "x-order": field.schema["x-order"] } : {}),
  };
  // No border/box: nested objects render as flat headed sections (see
  // ObjectSection in renderFieldRow) rather than progressively indented
  // sub-forms, so deep schemas stay readable as a single column.
  // A read-only object marks its whole subtree non-editable: recurse with
  // form-level readOnly on so child inputs are disabled (and any child the
  // schema marks readOnly still renders as a value span).
  return (
    <FieldsGrid layout={ctx.layout} size={ctx.size}>
      {ctx.render.renderObjectFields(subSchema, obj, (next) => field.onChange(next), {
        ...ctx,
        readOnly: ctx.readOnly || field.readOnly === true,
        depth: ctx.depth + 1,
      })}
    </FieldsGrid>
  );
}

// StringMapControl edits an object as key/value rows. Known properties (from the
// schema) render first with derived value controls; unknown keys render as
// editable key/value pairs. "Add field" appears when extra keys are allowed.
// Values recurse through the shared pipeline, so a value that is itself an object
// or array renders structurally and pre/post extensions apply to it.
export function StringMapControl({ field, ctx }: { field: FieldControl; ctx: RenderContext }) {
  // A read-only map marks its whole subtree non-editable: no rename/remove/add
  // and value inputs disabled.
  const readOnly = ctx.readOnly || field.readOnly === true;
  const map = isPlainObject(field.value) ? (field.value as Record<string, unknown>) : {};
  const known = field.knownProperties ?? {};
  const knownKeys = Object.keys(known);
  const extraKeys = Object.keys(map).filter((k) => !(k in known));
  const childCtx: RenderContext = { ...ctx, readOnly, depth: ctx.depth + 1 };
  // What the map key IS (e.g. "Address Role"), from the key-constraint schema.
  const pn = field.schema.propertyNames as JsonSchemaProperty | undefined;
  const keyTitle = typeof pn?.title === "string" && pn.title ? pn.title : undefined;

  // valueSchemaForKey picks an entry's value schema: the first patternProperties
  // entry whose regex matches the key, else the `additionalProperties` schema,
  // else a bare string. Lets the value form vary by key (e.g. House vs Apartment).
  function valueSchemaForKey(key: string): JsonSchemaProperty {
    for (const { pattern, schema } of field.valuePatternSchemas ?? []) {
      let re: RegExp | undefined;
      try {
        re = new RegExp(pattern);
      } catch {
        re = undefined; // a malformed pattern simply never matches
      }
      if (re?.test(key)) return schema;
    }
    return field.valueSchema ?? { type: "string" };
  }

  // When the entry value opts into a stacked layout (`x-layout: "stack"`), the
  // key+value render as one full-width stacked unit instead of a key column
  // beside the value. Resolved per key, since pattern schemas may differ.
  function entryIsStacked(key: string): boolean {
    return valueSchemaForKey(key)["x-layout"] === "stack";
  }

  function setEntry(key: string, next: unknown) {
    field.onChange({ ...map, [key]: next });
  }
  function renameEntry(oldKey: string, newKey: string) {
    if (newKey === oldKey) return;
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map)) next[k === oldKey ? newKey : k] = v;
    field.onChange(next);
  }
  function removeEntry(key: string) {
    const next = { ...map };
    delete next[key];
    field.onChange(next);
  }
  function addEntry() {
    if ("" in map) return;
    field.onChange({ ...map, "": "" });
  }

  function valueControlFor(key: string, valueSchema: JsonSchemaProperty): ReactNode {
    const nodes = ctx.render.renderFieldNodes(
      {
        key,
        prop: valueSchema,
        required: false,
        value: map[key] ?? "",
        onChange: (next) => setEntry(key, next),
      },
      childCtx,
    );
    return nodes?.value ?? null;
  }

  // valueControlForKey resolves the per-key value schema (patternProperties /
  // additionalProperties) before rendering, so the form varies by key.
  function valueControlForKey(key: string): ReactNode {
    return valueControlFor(key, valueSchemaForKey(key));
  }

  return (
    <div className={cn("flex flex-col rounded-md border border-input p-2", fieldInnerGapClass[childCtx.size])}>
      {knownKeys.map((key) => (
        <div key={`known-${key}`} className="grid grid-cols-[10rem_1fr] items-center gap-2">
          <label htmlFor={fieldInputId(key, childCtx.idPrefix)} className="truncate text-xs text-muted-foreground" title={key}>
            {key}
          </label>
          <div className="min-w-0">{valueControlFor(key, known[key] ?? { type: "string" })}</div>
        </div>
      ))}
      {extraKeys.map((key) => {
        const keyControl = field.keyOptions ? (
          <Combobox
            options={keyPickerOptions(field.keyOptions, extraKeys, key)}
            value={key}
            disabled={readOnly}
            size={childCtx.size}
            allowCustomValue={false}
            onChange={(next) => renameEntry(key, next)}
            placeholder="Select…"
          />
        ) : (
          <input
            type="text"
            aria-label="Field name"
            className={cn(inputClass(childCtx.size), "font-mono")}
            value={key}
            disabled={readOnly}
            onChange={(e) => renameEntry(key, e.target.value)}
          />
        );
        const removeButton = !readOnly ? (
          <button
            type="button"
            aria-label={`Remove ${key}`}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => removeEntry(key)}
          >
            <Icon icon={UiTrash} className="text-sm" />
          </button>
        ) : null;
        // When the value is stacked (`x-layout: "stack"` on the entry schema),
        // the key joins the stack: it sits full-width above its value as one
        // unit, rather than cramped in a fixed key column beside it. The key
        // picker is labelled from `propertyNames.title` so a constrained key
        // (e.g. an AsCode role) says what it is.
        if (entryIsStacked(key)) {
          return (
            <div key={`extra-${key}`} className="space-y-1.5 rounded-md border border-input p-2">
              {keyTitle && (
                <span className="block text-xs font-medium text-muted-foreground">{keyTitle}</span>
              )}
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">{keyControl}</div>
                {removeButton}
              </div>
              <div className="min-w-0">{valueControlForKey(key)}</div>
            </div>
          );
        }
        return (
          <div key={`extra-${key}`} className="grid grid-cols-[10rem_1fr_auto] items-center gap-2">
            {keyControl}
            <div className="min-w-0">{valueControlForKey(key)}</div>
            {removeButton}
          </div>
        );
      })}
      {!readOnly && field.allowExtraKeys !== false && (
        <Button type="button" variant="outline" size="sm" onClick={addEntry} className="gap-1.5">
          <Icon icon={UiAdd} className="text-sm" />
          Add field
        </Button>
      )}
    </div>
  );
}
