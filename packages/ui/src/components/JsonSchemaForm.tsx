import { cn } from "../lib/utils";
import { renderObjectFields, type RenderContext } from "./json-schema-form-render";
import {
  DEFAULT_FORM_SIZE,
  fieldInnerGapClass,
  inlineRowGapClass,
  labelSizeClass,
  stackedRowGapClass,
} from "./json-schema-form-size";
import type { FormLayout, JsonSchemaFormProps } from "./json-schema-form-types";

const DEFAULT_LABEL_MAX_WIDTH = "40ch";
const DEFAULT_VALUE_MAX_WIDTH = "600px";

// resolveFormLayout maps the `layout`/`inline` props to a single resolved
// FormLayout. An explicit `layout` wins; otherwise `inline` selects the inline
// preset. Width caps are only filled for inline mode.
function resolveFormLayout(layout: FormLayout | undefined, inline: boolean): FormLayout {
  const base = layout ?? { mode: inline ? "inline" : "stacked" };
  if (base.mode !== "inline") return { mode: "stacked" };
  return {
    mode: "inline",
    labelMaxWidth: base.labelMaxWidth ?? DEFAULT_LABEL_MAX_WIDTH,
    valueMaxWidth: base.valueMaxWidth ?? DEFAULT_VALUE_MAX_WIDTH,
  };
}

// JsonSchemaForm renders an object subschema as a form: one control per
// (effective) property. It resolves if/then conditionals internally and recurses
// through array items and object/map values; every other behaviour is layered on
// by the pre/post extension functions the consumer supplies. The component holds
// no domain knowledge.
export function JsonSchemaForm({
  schema,
  value,
  onChange,
  readOnly = false,
  inline = false,
  layout,
  size = DEFAULT_FORM_SIZE,
  idPrefix,
  hideReadOnlyFields = false,
  hiddenKeys,
  requiredFirst = false,
  title,
  pre,
  post,
}: JsonSchemaFormProps) {
  const resolvedLayout = resolveFormLayout(layout, inline);
  const ctx: RenderContext = {
    readOnly,
    hideReadOnlyFields,
    layout: resolvedLayout,
    size,
    requiredFirst,
    pre: pre ?? [],
    post: post ?? [],
    depth: 0,
    ...(idPrefix ? { idPrefix } : {}),
  };
  const rows = renderObjectFields(schema, value, onChange, ctx, hiddenKeys ? { hiddenKeys } : undefined);

  const rowGap = resolvedLayout.mode === "inline" ? inlineRowGapClass[size] : stackedRowGapClass[size];
  return (
    <div className={cn("flex flex-col", fieldInnerGapClass[size])}>
      {title && <h3 className={cn("font-semibold", labelSizeClass[size])}>{title}</h3>}
      <div className={cn("grid", rowGap)}>{rows}</div>
    </div>
  );
}
