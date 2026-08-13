import { moveItem, removeIndex, setIndex } from "../lib/collections";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { FilterPill } from "../data/FilterPill";
import { UiAdd } from "../icons";
import { Button } from "./button";
import { ItemActions } from "./ItemActions";
import {
  controlMinHeightClass,
  fieldInnerGapClass,
  inputSizeClass,
  type FormSize,
} from "./json-schema-form-size";
import { AccordionArray } from "./json-schema-form-accordion-array";
import { CardsArray } from "./json-schema-form-cards-array";
import { FieldsGrid } from "./json-schema-form-layout";
import { scalarItemsType } from "./json-schema-form-resolve";
import { appendInstancePath } from "./json-schema-form-errors";
import { TableArray } from "./json-schema-form-table-array";
import { TagsComboboxControl } from "./json-schema-form-tags-combobox";
import {
  hasObjectItemProperties,
  seedFromSchema,
  toStringArray,
} from "./json-schema-form-utils";
import type {
  FieldControl,
  FieldOption,
  RenderContext,
} from "./json-schema-form-types";

// A comma is the second commit key in every tag list, and what a pasted list is
// split on. Newlines split too — see splitOnComboboxSeparators.
const TAG_SEPARATORS = [","];

// ArrayControl routes an array to the control its items call for: a flat list of
// values (choices, scalars) is ONE tag combobox; object items are summary rows,
// cards or a table; anything else renders a control per item with add / remove /
// reorder. Recursion goes through ctx.render so this module never imports the
// renderer (no import cycle).
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
  const choices = enumItemOptions(field);
  if (field.arrayDisplay === "filter-pills" && choices.length > 0) {
    return (
      <FilterPillArray
        field={field}
        fieldId={fieldId}
        readOnly={readOnly}
        size={ctx.size}
      />
    );
  }
  // A list of choices is ONE control, not a stack of them: the enum item schema
  // makes the whole array a multi-select whose committed values are pills, so
  // the option set is discoverable in one dropdown instead of repeated per item.
  // `x-array-display: "stacked"` opts back into a combobox per item.
  if (field.arrayDisplay !== "stacked" && choices.length > 0) {
    return (
      <TagsComboboxControl
        field={field}
        fieldId={fieldId}
        readOnly={readOnly}
        size={ctx.size}
        options={choices}
      />
    );
  }
  // A flat list of scalars is the same gesture as the enum list above — type a
  // value, get a pill — so it takes the same control, with no options to pick
  // from and a comma as a second commit key. Numeric items commit numbers.
  const scalarType = scalarItemsType(field.itemSchema);
  if (field.arrayDisplay !== "stacked" && scalarType) {
    return (
      <TagsComboboxControl
        field={field}
        fieldId={fieldId}
        readOnly={readOnly}
        size={ctx.size}
        options={[]}
        itemType={scalarType}
        separators={TAG_SEPARATORS}
      />
    );
  }
  if (hasObjectItemProperties(field.itemSchema)) {
    if (field.arrayDisplay === "cards") {
      return <CardsArray field={field} ctx={ctx} readOnly={readOnly} />;
    }
    // The accordion is the DEFAULT for object items: stacked in full, a
    // ten-property item costs ~700px of screen each and a list of them says
    // nothing about which item is which. `x-array-display: "stacked"` opts back
    // into the per-item sub-form below; `x-layout: "table"` into the row grid.
    // An explicit accordion outranks the table, since it names the renderer.
    if (
      field.arrayDisplay === "accordion" ||
      (field.arrayDisplay !== "stacked" && field.layout !== "table")
    ) {
      return <AccordionArray field={field} ctx={ctx} readOnly={readOnly} />;
    }
    // `x-layout: table` renders object-item arrays as compact rows with one
    // column per item property — denser still than the summary rows.
    if (field.layout === "table") {
      return <TableArray field={field} ctx={ctx} readOnly={readOnly} />;
    }
  }
  const items = Array.isArray(field.value) ? field.value : [];
  const itemSchema = field.itemSchema ?? { type: "string" };
  const childCtx: RenderContext = { ...ctx, readOnly, depth: ctx.depth + 1 };

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border border-input p-2",
        fieldInnerGapClass[ctx.size],
      )}
    >
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-2">
          {/* The item's row is a FieldWrapper (or a full-width ObjectSection),
              both of which are grid children of a FieldsGrid — inline mode's
              `grid-cols-subgrid` resolves to `none` without one, collapsing
              every item into a stacked column while the rest of the form stays
              aligned. Fixed at one column: an item is a single row, and any
              multi-column layout belongs to the item's own object body. */}
          <FieldsGrid layout={ctx.layout} size={ctx.size} columns={1} className="min-w-0">
            {ctx.render.renderFieldRow(
              {
                key: `${field.key}[${i}]`,
                prop: itemSchema,
                required: false,
                value: item,
                onChange: (next) => field.onChange(setIndex(items, i, next)),
                instancePath: appendInstancePath(ctx.instancePath, i),
              },
              childCtx,
              { labelOverride: `Item ${i + 1}` },
            )}
          </FieldsGrid>
          {!readOnly && (
            <ItemActions
              label={`item ${i + 1}`}
              index={i}
              count={items.length}
              size={ctx.size}
              reveal={false}
              onMove={(to) => field.onChange(moveItem(items, i, to))}
              onRemove={() => field.onChange(removeIndex(items, i))}
            />
          )}
        </div>
      ))}
      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          className={cn("gap-1.5", inputSizeClass[ctx.size])}
          onClick={() => field.onChange([...items, seedFromSchema(itemSchema)])}
        >
          <Icon icon={UiAdd} className="text-sm" />
          Add item
        </Button>
      )}
    </div>
  );
}

// The choices an array of enum items offers, deduped by value. Prefers the
// resolved `options` (they carry the schema's labels, icons and tones) and falls
// back to the raw item `enum` for a field a pre-extension built by hand.
function enumItemOptions(field: FieldControl): FieldOption[] {
  const rawOptions =
    field.options ??
    (Array.isArray(field.itemSchema?.enum)
      ? field.itemSchema.enum.map((value) => ({
          value: String(value),
          label: String(value),
        }))
      : []);
  const seen = new Set<string>();
  return rawOptions.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

function FilterPillArray({
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
  const options = enumItemOptions(field);
  const validValues = new Set(options.map((option) => option.value));
  const explicitValues = toStringArray(field.value).filter((value) =>
    validValues.has(value),
  );
  const implicitAll = explicitValues.length === 0;
  const selected = new Set(
    implicitAll ? options.map((option) => option.value) : explicitValues,
  );

  function commit(nextSelected: Set<string>) {
    const next = options
      .map((option) => option.value)
      .filter((value) => nextSelected.has(value));
    field.onChange(next.length === options.length ? [] : next);
  }

  function toggle(value: string) {
    if (readOnly) return;
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    commit(next);
  }

  return (
    <div
      id={fieldId}
      data-jsf-input
      role="group"
      aria-label={field.label}
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1 shadow-sm",
        controlMinHeightClass[size],
      )}
    >
      {options.map((option) => (
        <FilterPill
          key={option.value}
          label={option.label}
          mode={selected.has(option.value) ? "active" : "neutral"}
          title={
            implicitAll ? `${option.label} enabled by default` : option.label
          }
          {...(!readOnly ? { onClick: () => toggle(option.value) } : {})}
          className="max-w-full"
        />
      ))}
    </div>
  );
}

