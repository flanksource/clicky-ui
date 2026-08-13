import { AccordionList } from "./AccordionList";
import { appendInstancePath, errorCountUnderInstancePath } from "./json-schema-form-errors";
import {
  ItemBadge,
  ItemErrorMark,
  ItemGlyph,
  RequiredMark,
} from "./json-schema-form-item-row";
import {
  addItemLabel,
  emptyItemsCopy,
  itemActionsAllow,
  itemCountLabel,
  itemSummaryFor,
  noItemsLabel,
  resolveItemSpec,
} from "./json-schema-form-item-summary";
import { fieldInputId, seedFromSchema } from "./json-schema-form-utils";
import type { FieldControl, RenderContext } from "./json-schema-form-types";

// AccordionArray is the JsonSchemaForm adapter over AccordionList: it turns
// `x-item` into row content and the schema's item into a recursive sub-form, and
// owns nothing structural. Everything about the interaction — one row open at a
// time, roving focus, the add row that doubles as the empty state — lives in
// AccordionList, which knows nothing about JSON Schema.
export function AccordionArray({
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
  const spec = field.itemSpec ?? resolveItemSpec(field.schema, itemSchema);
  const emptyCopy = emptyItemsCopy(spec, field.schema);
  // The array's help mode governs its whole subtree. Without this the fields
  // inside an expanded row keep the form-level default, so an accordion that
  // resolved to "hover" would still stack a two-line paragraph under every
  // control — the exact height the summary rows exist to reclaim.
  const childCtx: RenderContext = {
    ...ctx,
    readOnly,
    depth: ctx.depth + 1,
    ...(field.helpDisplay
      ? { layout: { ...ctx.layout, help: field.helpDisplay } }
      : {}),
  };

  function summaryFor(item: unknown, index: number) {
    return field.itemSummary?.({ item, index }) ?? itemSummaryFor({ item, index, spec, itemSchema });
  }

  return (
    <AccordionList<unknown>
      items={items}
      onChange={(next) => field.onChange(next)}
      summary={items.length === 0 ? noItemsLabel(spec) : itemCountLabel(spec, items.length)}
      size={ctx.size}
      readOnly={readOnly}
      itemId={(index) => fieldInputId(appendInstancePath(ctx.instancePath, index), ctx.idPrefix)}
      // The panel's controls are the form's own inputs; anything else focusable
      // inside an item (a help disclosure, a remove button on a nested array)
      // would otherwise win the caret on add.
      focusSelector="[data-jsf-input]"
      itemLabel={({ item, index }) => summaryFor(item, index).title}
      allowReorder={itemActionsAllow(spec, "reorder")}
      allowDuplicate={itemActionsAllow(spec, "duplicate")}
      allowRemove={itemActionsAllow(spec, "remove")}
      onCreate={() => seedFromSchema(itemSchema)}
      addLabel={addItemLabel(spec)}
      {...(emptyCopy ? { addDescription: emptyCopy } : {})}
      renderHeader={({ item, index, open }) => {
        const summary = summaryFor(item, index);
        return (
          <>
            <ItemGlyph glyph={summary.glyph} />
            <span className="shrink-0 text-sm font-medium">{summary.title}</span>
            <ItemBadge badge={summary.badge} />
            {summary.flagged && <RequiredMark />}
            {summary.summary && (
              <code className="truncate font-mono text-xs text-muted-foreground">
                {summary.summary}
              </code>
            )}
            {!open && (
              <ItemErrorMark
                count={errorCountUnderInstancePath(
                  ctx.errors,
                  appendInstancePath(ctx.instancePath, index),
                )}
              />
            )}
          </>
        );
      }}
      renderBody={({ item, index, onChange }) =>
        // Recurse through the shared pipeline so consumer pre/post extensions
        // still apply to the item and its properties.
        ctx.render.renderFieldNodes(
          {
            key: `${field.key}[${index}]`,
            prop: itemSchema,
            required: false,
            value: item,
            onChange,
            instancePath: appendInstancePath(ctx.instancePath, index),
          },
          childCtx,
        )?.value ?? null
      }
    />
  );
}
