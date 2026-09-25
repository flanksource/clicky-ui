import { isPlainObject } from "../lib/collections";
import { applyListenerState } from "./json-schema-form-listeners";
import { resolveControl } from "./json-schema-form-resolve";
import { hasObjectItemProperties, orderByClickyOrder, orderByXOrder } from "./json-schema-form-utils";
import type {
  ExpressionEvaluator,
  FieldControl,
  FormLayout,
  JsonSchemaObject,
  JsonSchemaProperty,
  RenderContext,
} from "./json-schema-form-types";

// How an object array renders: the row grid (TableArray), or the item list
// (AccordionArray) with each item's fields stacked or labelled inline.
export type ArrayView = "grid" | "stack" | "inline";

export const DEFAULT_TABLE_MAX_COLUMNS = 4;

export interface TableColumnOptions {
  hideReadOnlyFields: boolean;
  // The whole table is a view, so every cell renders as its value; see TableArray.
  valueCells: boolean;
  rootValue?: Record<string, unknown>;
  evaluate?: ExpressionEvaluator;
}

export interface TableLayout {
  // Every column at least one row shows, in x-clicky-order / x-order order,
  // carrying the first showing row's property for the header.
  columns: [string, JsonSchemaProperty][];
  // Per row, that row's effective item properties under its own listener state.
  rows: Record<string, JsonSchemaProperty>[];
}

export interface ArrayViewOptions extends TableColumnOptions {
  // The layout the array inherits, which an explicit accordion keeps.
  layoutMode: FormLayout["mode"];
}

export function arrayViewOptions(field: FieldControl, ctx: RenderContext): ArrayViewOptions {
  return { ...tableColumnOptions(field, ctx), layoutMode: ctx.layout.mode };
}

export function tableColumnOptions(field: FieldControl, ctx: RenderContext): TableColumnOptions {
  return {
    hideReadOnlyFields: ctx.hideReadOnlyFields,
    valueCells: ctx.viewOnly || field.readOnly === true,
    ...(ctx.rootValue ? { rootValue: ctx.rootValue } : {}),
    ...(ctx.expressionEvaluator ? { evaluate: ctx.expressionEvaluator } : {}),
  };
}

// tableLayout evaluates the item schema's listeners per row, as the object
// renderer does for each item of the list views, so a cell a row's own
// `x-on-change` reveals gets a column. With no rows the columns come from the
// load state of an empty item.
export function tableLayout(
  itemSchema: JsonSchemaProperty,
  items: unknown[],
  options: TableColumnOptions,
): TableLayout {
  const schema = itemSchema as JsonSchemaObject;
  const states = (items.length > 0 ? items : [{}]).map((item) => {
    const row = isPlainObject(item) ? item : {};
    return applyListenerState(schema, row, {
      root: options.rootValue ?? row,
      ...(options.evaluate ? { evaluate: options.evaluate } : {}),
    }).properties;
  });
  const keys = new Set(states.flatMap((state) => Object.keys(state)));
  const shown = [...keys].flatMap((key): [string, JsonSchemaProperty][] => {
    const prop = states.map((state) => state[key]).find((p) => p !== undefined && cellShows(p, options));
    return prop ? [[key, prop]] : [];
  });
  return {
    columns: orderByXOrder(orderByClickyOrder(shown), schema["x-order"]),
    rows: items.length > 0 ? states : [],
  };
}

// cellShows mirrors the renderer's drop rules for one cell: `x-hidden`, a
// readOnly cell under hideReadOnlyFields, and a writeOnly cell in a view.
function cellShows(prop: JsonSchemaProperty, options: TableColumnOptions): boolean {
  return (
    prop["x-hidden"] !== true &&
    !(options.hideReadOnlyFields && prop.readOnly === true) &&
    !(prop.writeOnly === true && (options.valueCells || prop.readOnly === true))
  );
}

// defaultArrayView picks the view an object array opens in. An explicit
// accordion names its renderer and outranks an explicit table, keeping the
// label placement of the form around it (inline in an inline form, stacked
// otherwise); without either hint a grid of up to `x-table-max-columns`
// visible columns stays a grid and a wider one — or one with a nested
// sub-form column — opens as the inline item form.
export function defaultArrayView(field: FieldControl, options: ArrayViewOptions): ArrayView {
  if (field.arrayDisplay === "accordion") return options.layoutMode === "inline" ? "inline" : "stack";
  if (field.layout === "table") return "grid";
  const max = field.schema["x-table-max-columns"] ?? DEFAULT_TABLE_MAX_COLUMNS;
  if (!Number.isInteger(max) || max < 1) {
    throw new Error(`${field.key}: x-table-max-columns must be a positive integer, got ${JSON.stringify(max)}`);
  }
  const items = Array.isArray(field.value) ? field.value : [];
  const { columns } = tableLayout(field.itemSchema ?? { type: "object" }, items, options);
  // A cell holding a whole sub-form (an object, a map, a list of objects)
  // needs the item form's width, however few columns there are.
  if (columns.some(([key, prop]) => nestsForm(key, prop))) return "inline";
  return columns.length <= max ? "grid" : "inline";
}

function nestsForm(key: string, prop: JsonSchemaProperty): boolean {
  const control = resolveControl({ key, prop, required: false, value: undefined, onChange: () => {} });
  return (
    control.kind === "object" ||
    control.kind === "string-map" ||
    (control.kind === "array" && hasObjectItemProperties(control.itemSchema))
  );
}
