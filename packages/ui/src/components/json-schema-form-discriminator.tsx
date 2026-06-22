import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { LabelIcon, type LabelIconSpec } from "../data/Icon";
import { labelSizeClass } from "./json-schema-form-size";
import type { JsonSchemaObject, JsonSchemaProperty, RenderContext } from "./json-schema-form-types";

// DiscriminatedForm renders the two-phase "pick a kind, then fill its form" flow
// driven by a schema's `x-discriminator`. Phase 1 (the discriminator value is
// unset) shows only the discriminator control — typically the x-enum-icons grid.
// Phase 2 (a value is chosen) collapses the picker to a compact header with a
// "Change" affordance and renders the matched branch's fields (the discriminator
// itself hidden, since the header already shows it). It returns nodes meant to be
// children of the form's FieldsGrid (the header/phase-1 block span the full grid
// width; phase-2 field rows snap to the grid tracks as usual).
export function DiscriminatedForm({
  schema,
  value,
  onChange,
  ctx,
  discKey,
}: {
  schema: JsonSchemaObject;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  ctx: RenderContext;
  discKey: string;
}): ReactNode {
  const prop = schema.properties?.[discKey];
  // A schema that names a discriminator it does not define is malformed; render
  // it as an ordinary form rather than silently hiding everything.
  if (!prop) return <>{ctx.render.renderObjectFields(schema, value, onChange, ctx)}</>;

  const current = value[discKey];
  const required = (schema.required ?? []).includes(discKey);

  if (current == null || current === "") {
    const built = ctx.render.renderFieldNodes(
      {
        key: discKey,
        prop,
        required,
        value: current,
        onChange: (next) => onChange({ ...value, [discKey]: next }),
      },
      ctx,
    );
    return (
      <div className="col-span-full flex flex-col gap-2">
        <h3 className={cn("font-semibold", labelSizeClass[ctx.size])}>
          {typeof prop.title === "string" && prop.title ? prop.title : discKey}
        </h3>
        {built?.value}
      </div>
    );
  }

  const selected = String(current);
  const change = () => {
    const next = { ...value };
    delete next[discKey];
    onChange(next);
  };
  return (
    <>
      <div className="col-span-full flex items-center justify-between rounded-md border border-input px-3 py-2">
        <span className={cn("flex items-center gap-2 font-medium", labelSizeClass[ctx.size])}>
          <LabelIcon icon={iconFor(prop, selected)} className="text-lg text-foreground" />
          <span>{labelFor(prop, selected)}</span>
        </span>
        {!ctx.readOnly && (
          <button type="button" onClick={change} className="text-xs font-medium text-primary hover:underline">
            Change {typeof prop.title === "string" && prop.title ? prop.title.toLowerCase() : discKey}
          </button>
        )}
      </div>
      {ctx.render.renderObjectFields(schema, value, onChange, ctx, { hiddenKeys: [discKey] })}
    </>
  );
}

function labelFor(prop: JsonSchemaProperty, value: string): string {
  const l = prop["x-enum-labels"]?.[value];
  return typeof l === "string" && l ? l : value;
}

function iconFor(prop: JsonSchemaProperty, value: string): LabelIconSpec | undefined {
  const i = prop["x-enum-icons"]?.[value];
  return typeof i === "string" && i ? i : undefined;
}
