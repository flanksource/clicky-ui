import { cn } from "../lib/utils";
import { renderObjectFields, type RenderContext } from "./json-schema-form-render";
import type { JsonSchemaFormProps } from "./json-schema-form-types";

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
  hideReadOnlyFields = false,
  hiddenKeys,
  requiredFirst = false,
  title,
  pre,
  post,
}: JsonSchemaFormProps) {
  const ctx: RenderContext = {
    readOnly,
    hideReadOnlyFields,
    inline,
    requiredFirst,
    pre: pre ?? [],
    post: post ?? [],
    depth: 0,
  };
  const rows = renderObjectFields(schema, value, onChange, ctx, hiddenKeys ? { hiddenKeys } : undefined);

  return (
    <div className="space-y-3">
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      <div className={cn(inline ? "grid gap-2" : "grid gap-4")}>{rows}</div>
    </div>
  );
}
