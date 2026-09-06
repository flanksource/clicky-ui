import { ArrayControl } from "./json-schema-form-array";
import { ObjectControl, StringMapControl } from "./json-schema-form-object";
import { fieldInputId } from "./json-schema-form-utils";
import type { FieldControl, RenderContext } from "./json-schema-form-types";

export function PropertyCollectionPreview({
  field,
  ctx,
}: {
  field: FieldControl;
  ctx: RenderContext;
}) {
  const previewCtx: RenderContext = {
    ...ctx,
    presentation: true,
    readOnly: true,
    layout: { ...ctx.layout, mode: "stacked" },
  };
  if (field.kind === "array")
    return (
      <ArrayControl
        field={field}
        fieldId={fieldInputId(ctx.instancePath, ctx.idPrefix)}
        ctx={previewCtx}
      />
    );
  if (field.kind === "object")
    return <ObjectControl field={field} ctx={previewCtx} />;
  return <StringMapControl field={field} ctx={previewCtx} />;
}
