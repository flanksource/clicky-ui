import { duplicateIndex, moveItem, removeIndex, setIndex } from "../lib/collections";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiAdd } from "../icons";
import { Button } from "./button";
import { ItemActions } from "./ItemActions";
import { appendInstancePath } from "./json-schema-form-errors";
import {
  addItemLabel,
  emptyItemsCopy,
  itemActionsAllow,
  itemSummaryFor,
  resolveItemSpec,
} from "./json-schema-form-item-summary";
import { ItemBadge, RequiredMark } from "./json-schema-form-item-row";
import { inputSizeClass } from "./json-schema-form-size";
import { TONE_EDGE_CLASS } from "./json-schema-form-tone";
import { seedFromSchema } from "./json-schema-form-utils";
import type { FieldControl, RenderContext } from "./json-schema-form-types";

// CardsArray renders an object-item array as a stack of titled cards: every
// item stays open, but each one is headed by what it actually is rather than
// "Item 3", and carries the item type's hue on its left edge so a long stack is
// scannable at a glance.
//
// It is the everything-visible counterpart to AccordionArray. Both read the
// same `x-item` summary, so a consumer switches between them by changing
// `x-array-display` alone — no second vocabulary to learn.
export function CardsArray({
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
  // The array's help mode governs its whole subtree, exactly as it does for the
  // accordion: a card whose fields each carry a permanent two-line paragraph is
  // back to the height the card layout exists to reclaim.
  const childCtx: RenderContext = {
    ...ctx,
    readOnly,
    depth: ctx.depth + 1,
    ...(field.helpDisplay ? { layout: { ...ctx.layout, help: field.helpDisplay } } : {}),
  };

  function commit(next: unknown[]) {
    field.onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const summary =
          field.itemSummary?.({ item, index: i }) ??
          itemSummaryFor({ item, index: i, spec, itemSchema });
        return (
          <article
            key={i}
            className={cn(
              "group rounded-lg border border-l-4 border-border shadow-sm",
              summary.glyph ? TONE_EDGE_CLASS[summary.glyph.tone] : undefined,
            )}
          >
            <header className="flex items-center gap-2 rounded-tr-md border-b border-border bg-muted/40 px-3 py-2">
              <span className="w-5 shrink-0 text-center font-mono text-xs text-muted-foreground">
                {i + 1}
              </span>
              <span className="shrink-0 text-sm font-semibold">{summary.title}</span>
              <ItemBadge badge={summary.badge} />
              {summary.flagged && <RequiredMark />}
              {summary.summary && (
                <code className="truncate font-mono text-xs text-muted-foreground">
                  {summary.summary}
                </code>
              )}
              {!readOnly && (
                <ItemActions
                  label={summary.title}
                  index={i}
                  count={items.length}
                  size={ctx.size}
                  {...(itemActionsAllow(spec, "reorder")
                    ? { onMove: (to: number) => commit(moveItem(items, i, to)) }
                    : {})}
                  {...(itemActionsAllow(spec, "duplicate")
                    ? { onDuplicate: () => commit(duplicateIndex(items, i)) }
                    : {})}
                  {...(itemActionsAllow(spec, "remove")
                    ? { onRemove: () => commit(removeIndex(items, i)) }
                    : {})}
                />
              )}
            </header>
            <div className="p-3">
              {/* Recurse through the shared pipeline so consumer pre/post
                  extensions still apply to the item and its properties — and so
                  the item's own x-columns reaches its ObjectControl. */}
              {ctx.render.renderFieldNodes(
                {
                  key: `${field.key}[${i}]`,
                  prop: itemSchema,
                  required: false,
                  value: item,
                  onChange: (next) => commit(setIndex(items, i, next)),
                  instancePath: appendInstancePath(ctx.instancePath, i),
                },
                childCtx,
              )?.value ?? null}
            </div>
          </article>
        );
      })}
      {items.length === 0 && emptyCopy && (
        <p className="text-xs leading-snug text-muted-foreground">{emptyCopy}</p>
      )}
      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          className={cn("gap-1.5 self-start", inputSizeClass[ctx.size])}
          onClick={() => commit([...items, seedFromSchema(itemSchema)])}
        >
          <Icon icon={UiAdd} className="text-sm" />
          {addItemLabel(spec)}
        </Button>
      )}
    </div>
  );
}
