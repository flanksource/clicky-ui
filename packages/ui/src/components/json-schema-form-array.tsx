import { type KeyboardEvent } from "react";
import { Icon } from "../data/Icon";
import { UiAdd, UiChevronDown, UiChevronUp, UiClose, UiTrash } from "../icons";
import { Button } from "./button";
import { defaultPlaceholder } from "./json-schema-form-fields";
import { isScalarStringItems } from "./json-schema-form-resolve";
import {
  moveItem,
  removeIndex,
  renderFieldRow,
  seedFromSchema,
  setIndex,
  type RenderContext,
} from "./json-schema-form-render";
import type { FieldControl } from "./json-schema-form-types";

// ArrayControl is a hybrid: plain string-item arrays keep the compact tag UI;
// anything richer (objects, numbers, enums, nested arrays) renders one recursive
// control per item with add / remove / reorder.
export function ArrayControl({
  field,
  fieldId,
  ctx,
}: {
  field: FieldControl;
  fieldId: string;
  ctx: RenderContext;
}) {
  if (isScalarStringItems(field.itemSchema)) {
    return <TagArray field={field} fieldId={fieldId} readOnly={ctx.readOnly} />;
  }
  const items = Array.isArray(field.value) ? field.value : [];
  const itemSchema = field.itemSchema ?? { type: "string" };
  const childCtx: RenderContext = { ...ctx, depth: ctx.depth + 1 };

  return (
    <div className="space-y-2 rounded-md border border-input p-2">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-2">
          <div className="min-w-0">
            {renderFieldRow(
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
          {!ctx.readOnly && (
            <ItemControls
              onUp={i > 0 ? () => field.onChange(moveItem(items, i, i - 1)) : undefined}
              onDown={i < items.length - 1 ? () => field.onChange(moveItem(items, i, i + 1)) : undefined}
              onRemove={() => field.onChange(removeIndex(items, i))}
              index={i}
            />
          )}
        </div>
      ))}
      {!ctx.readOnly && (
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
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
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
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1 shadow-sm">
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
          className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none"
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
