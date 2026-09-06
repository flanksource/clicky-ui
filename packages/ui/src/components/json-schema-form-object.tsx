import { type ReactNode } from "react";
import { isPlainObject } from "../lib/collections";
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
  cssLength,
  DEFAULT_COLUMN_MIN_WIDTH,
  fieldInputId,
  inputClass,
  keyPickerOptions,
  normalizeColumns,
} from "./json-schema-form-utils";
import { FieldsGrid } from "./json-schema-form-layout";
import { PropertyValueEditor } from "./json-schema-form-properties";
import { propertyControlSize } from "./json-schema-form-properties-size";
import { appendInstancePath } from "./json-schema-form-errors";
import {
  controlHeightClass,
  fieldInnerGapClass,
  inputSizeClass,
} from "./json-schema-form-size";

// ObjectControl renders a nested structured object as a sub-form: its own
// properties, required markers, if/then, soft errors — all via the shared
// recursive renderer (ctx.render), so pre/post extensions apply at this depth too.
export function ObjectControl({
  field,
  ctx,
}: {
  field: FieldControl;
  ctx: RenderContext;
}) {
  const obj = isPlainObject(field.value)
    ? (field.value as Record<string, unknown>)
    : {};
  const subSchema: JsonSchemaObject = {
    type: "object",
    properties: field.objectProperties ?? {},
    ...(field.objectRequired ? { required: field.objectRequired } : {}),
    ...(Array.isArray(field.schema.allOf) ? { allOf: field.schema.allOf } : {}),
    ...(Array.isArray(field.schema["x-order"])
      ? { "x-order": field.schema["x-order"] }
      : {}),
    // Every object-level layout keyword must be copied here or it works at the
    // top level and silently dies one level down — which is exactly where these
    // matter (an array item's body is a nested object).
    ...(typeof field.schema["x-columns"] === "number" ||
    field.schema["x-columns"] === "auto"
      ? { "x-columns": field.schema["x-columns"] }
      : {}),
    ...(typeof field.schema["x-column-min-width"] === "string"
      ? { "x-column-min-width": field.schema["x-column-min-width"] }
      : {}),
    ...(typeof field.schema["x-columns-max-width"] === "string"
      ? { "x-columns-max-width": field.schema["x-columns-max-width"] }
      : {}),
    ...(typeof field.schema["x-classes"] === "string"
      ? { "x-classes": field.schema["x-classes"] }
      : {}),
  };
  // No border/box: nested objects render as flat headed sections (see
  // ObjectSection in renderFieldRow) rather than progressively indented
  // sub-forms, so deep schemas stay readable as a single column.
  // A read-only object marks its whole subtree non-editable: recurse with
  // form-level readOnly on so child inputs are disabled (and any child the
  // schema marks readOnly still renders as a value span).
  return (
    <FieldsGrid
      layout={ctx.layout}
      size={ctx.size}
      columns={normalizeColumns(subSchema["x-columns"])}
      columnMinWidth={cssLength(
        subSchema["x-column-min-width"],
        DEFAULT_COLUMN_MIN_WIDTH,
      )}
      {...(typeof subSchema["x-columns-max-width"] === "string"
        ? { columnsMaxWidth: subSchema["x-columns-max-width"] }
        : {})}
      {...(typeof subSchema["x-classes"] === "string"
        ? { className: subSchema["x-classes"] }
        : {})}
    >
      {ctx.render.renderObjectFields(
        subSchema,
        obj,
        (next) => field.onChange(next),
        {
          ...ctx,
          readOnly: ctx.readOnly || field.readOnly === true,
          depth: ctx.depth + 1,
        },
      )}
    </FieldsGrid>
  );
}

// StringMapControl edits an object as key/value rows. Known properties (from the
// schema) render first with derived value controls; unknown keys render as
// editable key/value pairs. "Add field" appears when extra keys are allowed.
// Values recurse through the shared pipeline, so a value that is itself an object
// or array renders structurally and pre/post extensions apply to it.
export function StringMapControl({
  field,
  ctx,
}: {
  field: FieldControl;
  ctx: RenderContext;
}) {
  // A read-only map marks its whole subtree non-editable: no rename/remove/add
  // and value inputs disabled.
  const readOnly = ctx.readOnly || field.readOnly === true;
  const map = isPlainObject(field.value)
    ? (field.value as Record<string, unknown>)
    : {};
  const known = field.knownProperties ?? {};
  const knownKeys = Object.keys(known);
  const extraKeys = Object.keys(map).filter((k) => !(k in known));
  const childCtx: RenderContext = { ...ctx, readOnly, depth: ctx.depth + 1 };
  const properties = ctx.layout.mode === "properties";
  // What the map key IS (e.g. "Address Role"), from the key-constraint schema.
  const pn = field.schema.propertyNames as JsonSchemaProperty | undefined;
  const keyTitle =
    typeof pn?.title === "string" && pn.title ? pn.title : undefined;

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
    for (const [k, v] of Object.entries(map))
      next[k === oldKey ? newKey : k] = v;
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

  function valueControlFor(
    key: string,
    valueSchema: JsonSchemaProperty,
  ): ReactNode {
    const nodes = ctx.render.renderFieldNodes(
      {
        key,
        prop: valueSchema,
        required: false,
        value: map[key] ?? "",
        onChange: (next) => setEntry(key, next),
        instancePath: appendInstancePath(ctx.instancePath, key),
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

  function keyEditor({
    key,
    value,
    onChange,
  }: {
    key: string;
    value: string;
    onChange: (next: string) => void;
  }) {
    const size = properties ? propertyControlSize[ctx.size] : ctx.size;
    return field.keyOptions ? (
      <Combobox
        options={keyPickerOptions(
          field.keyOptions,
          [...knownKeys, ...extraKeys],
          key,
        )}
        value={value}
        disabled={readOnly}
        size={size}
        allowCustomValue={false}
        onChange={onChange}
        placeholder="Select…"
      />
    ) : (
      <input
        type="text"
        aria-label="Field name"
        className={cn(inputClass(size), "font-mono")}
        value={value}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <div
      className={cn(
        properties ? "col-span-full grid grid-cols-subgrid" : "flex flex-col",
        !properties &&
          !ctx.presentation &&
          "rounded-md border border-input p-2",
        !properties && fieldInnerGapClass[childCtx.size],
      )}
    >
      {knownKeys.map((key) =>
        properties ? (
          <div key={`known-${key}`} className="contents">
            {ctx.render.renderFieldRow(
              {
                key,
                prop: known[key]!,
                required:
                  Array.isArray(field.schema.required) &&
                  field.schema.required.includes(key),
                value: map[key],
                onChange: (next) => setEntry(key, next),
                instancePath: appendInstancePath(ctx.instancePath, key),
              },
              childCtx,
            )}
          </div>
        ) : (
          <div
            key={`known-${key}`}
            className="grid grid-cols-[10rem_1fr] items-center gap-2"
          >
            <label
              htmlFor={fieldInputId(
                appendInstancePath(ctx.instancePath, key),
                childCtx.idPrefix,
              )}
              className="truncate text-xs text-muted-foreground"
              title={key}
            >
              {key}
            </label>
            <div className="min-w-0">
              {valueControlFor(key, known[key] ?? { type: "string" })}
            </div>
          </div>
        ),
      )}
      {extraKeys.map((key) => {
        const keyControl = ctx.presentation ? (
          <span
            className={cn(
              "flex min-w-0 items-center break-words text-xs",
              controlHeightClass[childCtx.size],
              field.keyOptions
                ? "text-foreground"
                : "font-mono text-muted-foreground",
            )}
          >
            {field.keyOptions?.find((option) => option.value === key)?.label ??
              key}
          </span>
        ) : (
          keyEditor({
            key,
            value: key,
            onChange: (next) => renameEntry(key, next),
          })
        );
        const removeButton = !readOnly ? (
          <button
            type="button"
            aria-label={`Remove ${key}`}
            className={cn(
              "inline-flex aspect-square shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground",
              controlHeightClass[childCtx.size],
            )}
            onClick={() => removeEntry(key)}
          >
            <Icon icon={UiTrash} className="text-sm" />
          </button>
        ) : null;
        if (properties) {
          const instancePath = appendInstancePath(ctx.instancePath, key);
          const keyLabel =
            field.keyOptions?.find((option) => option.value === key)?.label ??
            (key || "New field");
          return (
            <div key={`extra-${key}`} className="contents">
              {ctx.render.renderFieldRow(
                {
                  key,
                  prop: { ...valueSchemaForKey(key), title: keyLabel },
                  required: false,
                  value: map[key],
                  onChange: (next) => setEntry(key, next),
                  instancePath,
                },
                {
                  ...childCtx,
                  post: [
                    ...childCtx.post,
                    (entry, nodes, postCtx) =>
                      postCtx?.instancePath !== instancePath
                        ? nodes
                        : {
                            ...nodes,
                            label: (
                              <>
                                <span className="sr-only">{nodes.label}</span>
                                <PropertyValueEditor
                                  actionsPlacement="row"
                                  field={{
                                    ...entry,
                                    kind: "string",
                                    label: `${keyLabel} key`,
                                    value: key,
                                    onChange: (next) =>
                                      renameEntry(key, String(next)),
                                  }}
                                  fieldId={`${fieldInputId(instancePath, ctx.idPrefix)}-key`}
                                  ctx={{
                                    ...childCtx,
                                    size: propertyControlSize[ctx.size],
                                  }}
                                  preview={<span>{keyLabel}</span>}
                                  renderEditor={(draft) => (
                                    <div className="flex min-w-0 items-center gap-1">
                                      {keyEditor({
                                        key,
                                        value: String(draft.value),
                                        onChange: draft.onChange,
                                      })}
                                      {removeButton}
                                    </div>
                                  )}
                                />
                              </>
                            ),
                          },
                  ],
                },
              )}
            </div>
          );
        }
        // When the value is stacked (`x-layout: "stack"` on the entry schema),
        // the key joins the stack: it sits full-width above its value as one
        // unit, rather than cramped in a fixed key column beside it. The key
        // picker is labelled from `propertyNames.title` so a constrained key
        // (e.g. an AsCode role) says what it is.
        if (entryIsStacked(key)) {
          return (
            <div
              key={`extra-${key}`}
              className={cn(
                "space-y-1.5",
                !ctx.presentation && "rounded-md border border-input p-2",
              )}
            >
              {keyTitle && (
                <span className="block text-xs font-medium text-muted-foreground">
                  {keyTitle}
                </span>
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
          <div
            key={`extra-${key}`}
            className={cn(
              "grid items-center gap-2",
              ctx.presentation
                ? "grid-cols-[minmax(0,10rem)_minmax(0,1fr)]"
                : "grid-cols-[10rem_1fr_auto]",
            )}
          >
            {keyControl}
            <div className="min-w-0">{valueControlForKey(key)}</div>
            {removeButton}
          </div>
        );
      })}
      {!readOnly && field.allowExtraKeys !== false && (
        <Button
          type="button"
          variant={properties ? "ghost" : "outline"}
          onClick={addEntry}
          className={cn(
            "gap-1.5",
            properties && "col-span-full justify-self-start m-1",
            inputSizeClass[
              properties ? propertyControlSize[ctx.size] : childCtx.size
            ],
          )}
        >
          <Icon icon={UiAdd} className="text-sm" />
          Add field
        </Button>
      )}
    </div>
  );
}
