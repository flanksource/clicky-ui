import { type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiAdd, UiChevronDown, UiChevronUp, UiClose, UiTrash } from "../icons";
import { Button } from "./button";
import { controlMinHeightClass, fieldInnerGapClass, labelSizeClass, type FormSize } from "./json-schema-form-size";
import { isScalarStringItems } from "./json-schema-form-resolve";
import {
  defaultPlaceholder,
  isPlainObject,
  moveItem,
  removeIndex,
  seedFromSchema,
  setIndex,
} from "./json-schema-form-utils";
import type { FieldControl, JsonSchemaProperty, RenderContext } from "./json-schema-form-types";

// ArrayControl is a hybrid: plain string-item arrays keep the compact tag UI;
// anything richer (objects, numbers, enums, nested arrays) renders one recursive
// control per item with add / remove / reorder. Recursion goes through
// ctx.render so this module never imports the renderer (no import cycle).
export function ArrayControl({
  field,
  fieldId,
  ctx,
}: {
  field: FieldControl;
  fieldId: string;
  ctx: RenderContext;
}) {
  // A read-only array marks its whole subtree non-editable: no add/remove/reorder
  // and item inputs disabled (a child the schema marks readOnly still renders as
  // a value span).
  const readOnly = ctx.readOnly || field.readOnly === true;
  if (isScalarStringItems(field.itemSchema)) {
    return <TagArray field={field} fieldId={fieldId} readOnly={readOnly} size={ctx.size} />;
  }
  // `x-layout: table` renders object-item arrays as compact rows with one column
  // per item property — a denser alternative to the per-item stacked sub-form.
  if (field.layout === "table" && hasObjectItemProperties(field.itemSchema)) {
    return <TableArray field={field} ctx={ctx} readOnly={readOnly} />;
  }
  const items = Array.isArray(field.value) ? field.value : [];
  const itemSchema = field.itemSchema ?? { type: "string" };
  const childCtx: RenderContext = { ...ctx, readOnly, depth: ctx.depth + 1 };

  return (
    <div className={cn("flex flex-col rounded-md border border-input p-2", fieldInnerGapClass[ctx.size])}>
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-2">
          <div className="min-w-0">
            {ctx.render.renderFieldRow(
              {
                key: `${field.key}[${i}]`,
                prop: itemSchema,
                required: false,
                value: item,
                onChange: (next) => field.onChange(setIndex(items, i, next)),
              },
              childCtx,
              { labelOverride: `Item ${i + 1}` },
            )}
          </div>
          {!readOnly && (
            <ItemControls
              onUp={i > 0 ? () => field.onChange(moveItem(items, i, i - 1)) : undefined}
              onDown={i < items.length - 1 ? () => field.onChange(moveItem(items, i, i + 1)) : undefined}
              onRemove={() => field.onChange(removeIndex(items, i))}
              index={i}
            />
          )}
        </div>
      ))}
      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => field.onChange([...items, seedFromSchema(itemSchema)])}
        >
          <Icon icon={UiAdd} className="text-sm" />
          Add item
        </Button>
      )}
    </div>
  );
}

// hasObjectItemProperties reports whether the array's items are objects with a
// fixed `properties` set — the precondition for a column-per-property table.
function hasObjectItemProperties(items: JsonSchemaProperty | undefined): boolean {
  return !!items && !!items.properties && Object.keys(items.properties).length > 0;
}

// TableArray renders an object-item array as a table: a header row of the item's
// property names and one row per item with value-only controls, plus per-row
// remove and an add button. Driven by `x-layout: table`.
function TableArray({
  field,
  ctx,
  readOnly,
}: {
  field: FieldControl;
  ctx: RenderContext;
  readOnly: boolean;
}) {
  const items = Array.isArray(field.value) ? field.value : [];
  const itemSchema = field.itemSchema ?? { type: "object" };
  const columns = Object.entries(itemSchema.properties ?? {});
  const childCtx: RenderContext = { ...ctx, readOnly, depth: ctx.depth + 1 };

  function cell(item: unknown, rowIndex: number, col: string, prop: JsonSchemaProperty): ReactNode {
    const obj = isPlainObject(item) ? item : {};
    const nodes = ctx.render.renderFieldNodes(
      {
        key: `${field.key}[${rowIndex}].${col}`,
        prop,
        required: false,
        value: obj[col],
        onChange: (next) => field.onChange(setIndex(items, rowIndex, { ...obj, [col]: next })),
      },
      childCtx,
    );
    return nodes?.value ?? null;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-input">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-input bg-muted/40 text-left">
            {columns.map(([col, prop]) => (
              <th key={col} className="px-2 py-1 text-xs font-medium text-muted-foreground">
                {typeof prop.title === "string" && prop.title ? prop.title : col}
              </th>
            ))}
            {!readOnly && <th className="w-10 px-2 py-1" />}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-input last:border-b-0 align-top">
              {columns.map(([col, prop]) => (
                <td key={col} className="px-2 py-1">
                  {cell(item, i, col, prop)}
                </td>
              ))}
              {!readOnly && (
                <td className="px-2 py-1">
                  <button
                    type="button"
                    aria-label={`Remove item ${i + 1}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => field.onChange(removeIndex(items, i))}
                  >
                    <Icon icon={UiTrash} className="text-sm" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!readOnly && (
        <div className="p-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => field.onChange([...items, seedFromSchema(itemSchema)])}
          >
            <Icon icon={UiAdd} className="text-sm" />
            Add item
          </Button>
        </div>
      )}
    </div>
  );
}

function ItemControls({
  onUp,
  onDown,
  onRemove,
  index,
}: {
  onUp: (() => void) | undefined;
  onDown: (() => void) | undefined;
  onRemove: () => void;
  index: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Move item ${index + 1} up`}
        disabled={!onUp}
        className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        onClick={onUp}
      >
        <Icon icon={UiChevronUp} className="text-sm" />
      </button>
      <button
        type="button"
        aria-label={`Move item ${index + 1} down`}
        disabled={!onDown}
        className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
        onClick={onDown}
      >
        <Icon icon={UiChevronDown} className="text-sm" />
      </button>
      <button
        type="button"
        aria-label={`Remove item ${index + 1}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={onRemove}
      >
        <Icon icon={UiTrash} className="text-sm" />
      </button>
    </div>
  );
}

// TagArray is the compact tag editor for plain string-item arrays.
function TagArray({
  field,
  fieldId,
  readOnly,
  size,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
}) {
  const tags = toStringArray(field.value);

  function commit(raw: string, input: HTMLInputElement) {
    const next = raw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    field.onChange([...tags, ...next]);
    input.value = "";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(input.value, input);
      return;
    }
    if (e.key === "Backspace" && input.value === "" && tags.length > 0) {
      field.onChange(tags.slice(0, -1));
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1 shadow-sm",
        controlMinHeightClass[size],
      )}
    >
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-muted px-2 text-xs"
        >
          <span className="truncate">{tag}</span>
          {!readOnly && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${tag}`}
              onClick={() => field.onChange(tags.filter((_, idx) => idx !== i))}
            >
              <Icon icon={UiClose} />
            </button>
          )}
        </span>
      ))}
      {!readOnly && (
        <input
          id={fieldId}
          data-jsf-input
          className={cn("min-w-32 flex-1 bg-transparent px-1 py-1 outline-none", labelSizeClass[size])}
          placeholder={tags.length === 0 ? defaultPlaceholder(field.schema) : ""}
          onKeyDown={handleKeyDown}
          onBlur={(e) => commit(e.currentTarget.value, e.currentTarget)}
        />
      )}
    </div>
  );
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [];
}
