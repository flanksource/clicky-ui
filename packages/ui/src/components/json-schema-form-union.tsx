import { useRef, useState } from "react";
import { Select } from "./select";
import { unionBranches, matchesUnionBranch, branchType, seedUnionBranch } from "./json-schema-form-union-model";
import type { FieldControl, RenderContext } from "./json-schema-form-types";

export function UnionControl({ field, fieldId, ctx }: { field: FieldControl; fieldId: string; ctx: RenderContext }) {
  const drafts = useRef(new Map<number, unknown>());
  const [preferred, setPreferred] = useState(0);
  const branches = unionBranches(field.schema);
  const matched = branches[preferred] && matchesUnionBranch(branches[preferred], field.value) ? preferred : branches.findIndex((branch) => matchesUnionBranch(branch, field.value));
  const selected = matched < 0 ? 0 : matched;
  const branch = branches[selected];
  if (!branch) throw new Error(`Union ${field.key} has no branch`);
  const { oneOf: _oneOf, anyOf: _anyOf, ...base } = field.schema;
  const prop = { ...base, ...branch, title: field.label };
  const nodes = ctx.render.renderFieldNodes({ key: field.key, prop, required: field.required,
    value: field.value, onChange: field.onChange, instancePath: ctx.instancePath }, ctx);
  const inferFromValue = branches.every((item) =>
    ["string", "number", "integer", "boolean"].includes(branchType(item)) && Object.keys(item).every((key) => key === "type"),
  );
  return <div className="flex min-w-0 flex-col gap-2">
    {!inferFromValue && <Select id={`${fieldId}-variant`} aria-label={`${field.label} format`} value={String(selected)} disabled={ctx.readOnly || field.readOnly}
      options={branches.map((item, i) => ({ value: String(i), label: item.title && branches.filter((other) => other.title === item.title).length === 1 ? item.title : `${item.title ?? "Variant"} (${branchType(item)} ${i + 1})` }))}
      onChange={(event) => {
        const next = Number(event.target.value);
        const target = branches[next];
        if (!target) throw new Error(`Unknown union variant ${next}`);
        drafts.current.set(selected, field.value);
        setPreferred(next);
        field.onChange(drafts.current.has(next) ? drafts.current.get(next) : seedUnionBranch(target));
      }} />}
    {branchType(branch) === "null" ? <code>null</code> : nodes?.value}
  </div>;
}
