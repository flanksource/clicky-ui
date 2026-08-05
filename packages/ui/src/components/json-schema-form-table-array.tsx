import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiAdd, UiTrash } from "../icons";
import { HoverCard } from "../overlay/HoverCard";
import { Button } from "./button";
import {
  controlHeightClass,
  inputSizeClass,
} from "./json-schema-form-size";
import { schemaHelper } from "./json-schema-form-resolve";
import { appendInstancePath } from "./json-schema-form-errors";
import {
  isPlainObject,
  orderByClickyOrder,
  orderByXOrder,
  removeIndex,
  seedFromSchema,
  setIndex,
} from "./json-schema-form-utils";
import type {
  FieldControl,
  JsonSchemaProperty,
  RenderContext,
} from "./json-schema-form-types";

// TableArray renders an object-item array as a table: a header row of the item's
// property names and one row per item with value-only controls, plus per-row
// remove and an add button. Driven by `x-layout: table`.
export function TableArray({
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
  // The item schema's explicit `x-order` is the authority for the keys it names:
  // per-property `x-clicky-order` sorts first (so it still orders everything
  // `x-order` leaves out, and composes across merged sources), then `x-order`
  // pulls its listed columns to the front in its own sequence.
  const columns = orderByXOrder(
    orderByClickyOrder(Object.entries(itemSchema.properties ?? {})),
    itemSchema["x-order"],
  );
  const childCtx: RenderContext = { ...ctx, readOnly, depth: ctx.depth + 1 };

  function cell(
    item: unknown,
    rowIndex: number,
    col: string,
    prop: JsonSchemaProperty,
  ): ReactNode {
    const obj = isPlainObject(item) ? item : {};
    const nodes = ctx.render.renderFieldNodes(
      {
        key: `${field.key}[${rowIndex}].${col}`,
        prop,
        required: false,
        value: obj[col],
        onChange: (next) =>
          field.onChange(setIndex(items, rowIndex, { ...obj, [col]: next })),
        instancePath: appendInstancePath(
          appendInstancePath(ctx.instancePath, rowIndex),
          col,
        ),
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
              <th
                key={col}
                className="px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                <TableColumnHeader name={col} schema={prop} />
              </th>
            ))}
            {!readOnly && <th className="w-10 px-2 py-1" />}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className="border-b border-input last:border-b-0 align-top"
            >
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
      {!readOnly && (
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
