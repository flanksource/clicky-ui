import type { FieldControl, RenderContext } from "./json-schema-form-types";

// CustomControl renders a field whose `format` a form extension registered a
// renderer for (kind "custom"). The renderer is mounted as its own component so
// it may use hooks, and receives everything it needs as props: the field (config
// is read from `field.schema`), its value and committer, the shared input id,
// and the post-extension context for reading/writing sibling fields.
export function CustomControl({
  field,
  fieldId,
  readOnly,
  ctx,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  ctx: RenderContext;
}) {
  const entry = field.format === undefined ? undefined : ctx.extensions.formats.get(field.format);
  if (!entry) {
    throw new Error(
      `field "${field.key}" resolved to a custom control but no form extension registers format "${field.format}"`,
    );
  }
  const Render = entry.render;
  return (
    <Render
      field={field}
      value={field.value}
      onChange={field.onChange}
      fieldId={fieldId}
      readOnly={readOnly}
      ctx={{
        fieldId,
        instancePath: ctx.instancePath,
        ...(ctx.rootValue ? { rootValue: ctx.rootValue } : {}),
        ...(ctx.onRootChange ? { onRootChange: ctx.onRootChange } : {}),
      }}
    />
  );
}
