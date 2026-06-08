import { cn } from "../lib/utils";
import { renderObjectFields, type RenderContext } from "./json-schema-form-render";
import type { FormLayout, JsonSchemaFormProps } from "./json-schema-form-types";

const DEFAULT_LABEL_MAX_WIDTH = "40ch";
const DEFAULT_VALUE_MAX_WIDTH = "400px";

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
    requiredFirst,
    pre: pre ?? [],
    post: post ?? [],
    depth: 0,
  };
  const rows = renderObjectFields(schema, value, onChange, ctx, hiddenKeys ? { hiddenKeys } : undefined);

  return (
    <div className="space-y-3">
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      <div className={cn(resolvedLayout.mode === "inline" ? "grid gap-2" : "grid gap-4")}>{rows}</div>
    </div>
  );
}
