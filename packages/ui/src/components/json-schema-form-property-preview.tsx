import { Markdown } from "../data/Markdown";
import { cn } from "../lib/utils";
import { BooleanControl, ReadOnlyValue } from "./json-schema-form-fields";
import { controlMinHeightClass, labelSizeClass } from "./json-schema-form-size";
import { scalarItemsType } from "./json-schema-form-resolve";
import { PropertySelectionPreview } from "./json-schema-form-property-selection";
import { PropertyCollectionPreview } from "./json-schema-form-property-collection";
import { toText } from "./json-schema-form-utils";
import type { FieldControl, RenderContext } from "./json-schema-form-types";

export function PropertyValuePreview({
  field,
  fieldId,
  ctx,
}: {
  field: FieldControl;
  fieldId: string;
  ctx: RenderContext;
}) {
  if (field.kind === "markdown") {
    return (
      <Markdown
        text={toText(field.value)}
        className={cn(
          "break-words [&_p]:my-1 [&_h2]:my-2",
          labelSizeClass[ctx.size],
        )}
      />
    );
  }
  if (
    field.kind === "string" ||
    field.kind === "date" ||
    field.kind === "number" ||
    field.kind === "boolean"
  ) {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        {field.prefix}
        {/* A property row is one field with room for a checkbox glyph and its
            own Edit button, so a boolean previews as the disabled checkbox the
            editor will hand back. Nested inside a collection preview
            (`presentation`) there is no such affordance — the whole summary
            opens as a unit — so a disabled checkbox would be chrome promising
            an interaction the cell does not have, and it reads as text. */}
        {!ctx.presentation &&
        field.kind === "boolean" &&
        typeof field.value === "boolean" ? (
          <>
            <label htmlFor={fieldId} className="sr-only">
              {field.label}
            </label>
            <BooleanControl
              field={field}
              fieldId={fieldId}
              size={ctx.size}
              readOnly
            />
          </>
        ) : (
          <ReadOnlyValue field={field} fieldId={fieldId} size={ctx.size} />
        )}
        {field.suffix ??
          (field.unit ? (
            <span className="text-muted-foreground">{field.unit}</span>
          ) : null)}
      </div>
    );
  }
  const selection =
    field.kind === "enum" ||
    field.kind === "lookup" ||
    (field.kind === "array" &&
      field.arrayDisplay !== "stacked" &&
      field.arrayDisplay !== "list" &&
      (Boolean(scalarItemsType(field.itemSchema)) ||
        Boolean(field.options?.length)));
  return (
    <div
      id={fieldId}
      data-jsf-readonly
      className={cn(
        "flex min-w-0 items-center gap-1.5",
        controlMinHeightClass[ctx.size],
        labelSizeClass[ctx.size],
      )}
    >
      {field.prefix}
      <div className="min-w-0 flex-1">
        {selection ? (
          <PropertySelectionPreview field={field} ctx={ctx} />
        ) : field.kind === "textarea" ? (
          <span className="whitespace-pre-wrap break-words">
            {toText(field.value) || "—"}
          </span>
        ) : (
          <PropertyCollectionPreview field={field} ctx={ctx} />
        )}
      </div>
      {field.suffix}
    </div>
  );
}
