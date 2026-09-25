import { type ReactNode } from "react";
import { isPlainObject, removeIndex, setIndex } from "../lib/collections";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiAdd, UiTrash } from "../icons";
import { HoverCard } from "../overlay/HoverCard";
import { Button } from "./button";
import {
  controlHeightClass,
  controlMinHeightClass,
  inputSizeClass,
} from "./json-schema-form-size";
import { resolveControl, schemaHelper } from "./json-schema-form-resolve";
import { applyPostExtensions } from "./json-schema-form-extensions";
import { appendInstancePath } from "./json-schema-form-errors";
import { applyChangeEffects } from "./json-schema-form-listeners";
import { tableColumnOptions, tableLayout } from "./json-schema-form-array-view";
import { itemCountLabel, noItemsLabel, resolveItemSpec } from "./json-schema-form-item-summary";
import { labelSizeClass } from "./json-schema-form-size";
import {
  canAddItem,
  canRemoveItem,
  seedFromSchema,
} from "./json-schema-form-utils";
import type {
  FieldControl,
  JsonSchemaObject,
  JsonSchemaProperty,
  RenderContext,
} from "./json-schema-form-types";

// TableArray renders an object-item array as a table: a header row of the item's
// property names and one row per item with value-only controls, plus per-row
// remove and an add button. The grid view of an object array; see ObjectArrayView.
export function TableArray({
  field,
  ctx,
  readOnly,
  toolbar,
}: {
  field: FieldControl;
  ctx: RenderContext;
  readOnly: boolean;
  /** List-level actions, right-aligned on a slim line above the table beside the row count. */
  toolbar?: ReactNode;
}) {
  const items = Array.isArray(field.value) ? field.value : [];
  const itemSchema = field.itemSchema ?? { type: "object" };
  // A table read-only as a whole — a view (the form's `readOnly` prop or a
  // readOnly ancestor; see RenderContext.viewOnly) or the array's own
  // `readOnly` — renders every cell as its value, exactly as a column the
  // schema (or a listener patch) marks readOnly does: a readOnly field is value
  // text wherever it sits, and in a table the grid itself is the structure a
  // disabled control would otherwise keep visible. `x-disabled`, which only
  // reaches ctx.readOnly, keeps real controls, disabled.
  const options = tableColumnOptions(field, ctx);
  const valueCells = options.valueCells;
  // Columns are the union across rows of each row's effective item properties
  // under its own listener state — `allOf` members included, so a listener
  // path that patches one cell (appended as an allOf member) reaches it —
  // minus the cells no row would render: `x-hidden`, a readOnly cell under
  // hideReadOnlyFields, and a writeOnly cell in a read-only view. A cell its
  // own row hides renders as an empty placeholder in a column another row
  // shows. The item schema's explicit `x-order` is the authority for the keys
  // it names: per-property `x-clicky-order` sorts first, then `x-order` pulls
  // its listed columns to the front in its own sequence.
  const { columns, rows } = tableLayout(itemSchema, items, options);
  // hideReadOnlyFields already dropped the declared-readOnly columns; the
  // cells a read-only table marks readOnly itself must still render.
  const childCtx: RenderContext = {
    ...ctx,
    readOnly,
    depth: ctx.depth + 1,
    ...(valueCells ? { hideReadOnlyFields: false } : {}),
  };
  // The trash column disappears with the buttons that would have filled it, so
  // an array of a fixed length reads as a table rather than one with a blank
  // gutter down the side.
  const removable = !readOnly && canRemoveItem(field, items.length);

  // A cell renders its OWN row's property, so a listener's readOnly, enable or
  // patch reaches that row alone, and commits through the row's value
  // listeners exactly as an item of the list views does.
  function cell(item: unknown, rowIndex: number, col: string): ReactNode {
    const obj = isPlainObject(item) ? item : {};
    const prop = rows[rowIndex]?.[col];
    const nodes = prop
      ? ctx.render.renderFieldNodes(
          {
            key: `${field.key}[${rowIndex}].${col}`,
            prop: valueCells ? { ...prop, readOnly: true } : prop,
            required: false,
            value: obj[col],
            onChange: (next) =>
              field.onChange(
                setIndex(
                  items,
                  rowIndex,
                  applyChangeEffects(itemSchema as JsonSchemaObject, {
                    root: options.rootValue ?? obj,
                    ...(options.evaluate ? { evaluate: options.evaluate } : {}),
                    value: obj,
                    key: col,
                    next,
                  }),
                ),
              ),
            instancePath: appendInstancePath(
              appendInstancePath(ctx.instancePath, rowIndex),
              col,
            ),
          },
          childCtx,
        )
      : null;
    if (!nodes) return <span data-jsf-cell-placeholder aria-hidden="true" className={cn("block", controlMinHeightClass[ctx.size])} />;
    return ctx.presentation ? (
      <div
        className={cn(
          "flex min-w-0 items-center [overflow-wrap:anywhere] [&_span[data-jsf-readonly]]:h-auto [&_span[data-jsf-readonly]]:min-w-0",
          controlMinHeightClass[ctx.size],
        )}
      >
        {nodes.value}
      </div>
    ) : (
      nodes.value
    );
  }

  // A column header is its column's label, so post extensions decorate it as
  // they decorate every field label, on the column's field (keyed by the
  // property name, after the pre-extensions). Only the returned label is used:
  // a header holds no value, and value adornments belong in the cells. A
  // column names no single value, so the context carries no instancePath.
  function columnHeader(col: string, prop: JsonSchemaProperty, header: ReactNode): ReactNode {
    const roots = {
      ...(ctx.rootValue ? { rootValue: ctx.rootValue } : {}),
      ...(ctx.onRootChange ? { onRootChange: ctx.onRootChange } : {}),
    };
    let column: FieldControl | null = resolveControl({ key: col, prop, required: false, value: undefined, onChange: () => {} });
    for (const ext of ctx.pre) {
      if (!column) break;
      column = ext(column, { key: col, prop, value: undefined, ...roots });
    }
    if (!column) return header;
    return applyPostExtensions(column, { label: header, value: null }, ctx.post, roots).label;
  }

  const table = (
    <div
      className={cn(
        "overflow-x-auto",
        !ctx.presentation && "rounded-md border border-input",
      )}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            className={cn(
              "border-b bg-muted/40 text-left",
              ctx.presentation ? "border-border" : "border-input",
            )}
          >
            {columns.map(([col, prop]) => (
              <th
                key={col}
                className="px-2 py-1 text-xs font-medium text-muted-foreground [overflow-wrap:anywhere]"
              >
                {columnHeader(
                  col,
                  prop,
                  ctx.presentation ? prop.title || col : <TableColumnHeader name={col} schema={prop} />,
                )}
              </th>
            ))}
            {removable && <th className="w-10 px-2 py-1" />}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className={cn(
                "border-b last:border-b-0 align-top",
                ctx.presentation ? "border-border" : "border-input",
              )}
            >
              {columns.map(([col]) => (
                <td key={col} className={cn("px-2 py-1", !ctx.presentation && !readOnly && "min-w-40")}>
                  {cell(item, i, col)}
                </td>
              ))}
              {removable && (
                <td className="px-2 py-1">
                  <button
                    type="button"
                    aria-label={`Remove item ${i + 1}`}
                    className={cn(
                      "inline-flex aspect-square items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground",
                      controlHeightClass[ctx.size],
                    )}
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
      {!readOnly && canAddItem(field, items.length) && (
        <div className="p-2">
          <Button
            type="button"
            variant="outline"
            className={cn("gap-1.5", inputSizeClass[ctx.size])}
            onClick={() =>
              field.onChange([...items, seedFromSchema(itemSchema)])
            }
          >
            <Icon icon={UiAdd} className="text-sm" />
            Add item
          </Button>
        </div>
      )}
    </div>
  );
  if (toolbar === undefined) return table;
  // The same summary line the item list shows, so switching views keeps the
  // count and the toolbar where they were.
  const spec = field.itemSpec ?? resolveItemSpec(field.schema, itemSchema);
  return (
    <div className="flex flex-col gap-2">
      <div data-jsf-array-summary className="flex items-center justify-between gap-2">
        <p className={cn("text-muted-foreground", labelSizeClass[ctx.size])}>
          {items.length === 0 ? noItemsLabel(spec) : itemCountLabel(spec, items.length)}
        </p>
        <div className="flex shrink-0 items-center">{toolbar}</div>
      </div>
      {table}
    </div>
  );
}

function TableColumnHeader({
  name,
  schema,
}: {
  name: string;
  schema: JsonSchemaProperty;
}) {
  const label =
    typeof schema.title === "string" && schema.title ? schema.title : name;
  const helper = schemaHelper(schema);
  if (!helper) return label;

  return (
    <HoverCard
      placement="bottom"
      trigger={
        <button
          type="button"
          aria-label={`${label} help`}
          className="cursor-help border-b border-dotted border-current text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {label}
        </button>
      }
      cardClassName="max-w-xs whitespace-normal text-left font-normal text-foreground"
    >
      {helper}
    </HoverCard>
  );
}
